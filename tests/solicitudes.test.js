const {
  app,
  request,
  USUARIOS,
  MASCOTAS,
  reiniciarBaseDatos,
  iniciarSesion,
  registrarAdoptante,
  consultarUna,
  solicitudValida,
  cerrarConexiones,
} = require("./ayudantes");
const repositorioNotificaciones = require("../src/modules/notificaciones/repositorio");

let tokenAdmin;
let tokenEdwin;

function crearSolicitud(token, cuerpo) {
  return request(app).post("/api/solicitudes").set("Authorization", `Bearer ${token}`).send(cuerpo);
}

function responder(id, estado) {
  return request(app).patch(`/api/admin/solicitudes/${id}`).set("Authorization", `Bearer ${tokenAdmin}`).send({ estado });
}

async function fotografiaDeLaBase(mascotaId) {
  return consultarUna(
    `SELECT (SELECT COUNT(*) FROM solicitudes) AS solicitudes,
            (SELECT COUNT(*) FROM notificaciones) AS notificaciones,
            (SELECT estado FROM mascotas WHERE id = ?) AS estadoMascota`,
    [mascotaId]
  );
}

beforeEach(async () => {
  await reiniciarBaseDatos();
  tokenAdmin = await iniciarSesion(USUARIOS.admin);
  tokenEdwin = await iniciarSesion(USUARIOS.edwin);
});
afterEach(() => jest.restoreAllMocks());
afterAll(cerrarConexiones);

describe("Solicitudes de adopción y transacciones (RF-05, RF-06, RF-08, RF-10)", () => {
  test("PR-14 crear una solicitud válida la deja En revisión, pasa la mascota a En proceso y notifica", async () => {
    const respuesta = await crearSolicitud(tokenEdwin, solicitudValida(MASCOTAS.cjotas));

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toMatchObject({ estado: "En revisión", mascota: { nombre: "Cjotas", estado: "En proceso" }, usuario: { nombre: "Edwin Obando" } });
    const mias = await request(app).get("/api/solicitudes/mias").set("Authorization", `Bearer ${tokenEdwin}`);
    expect(mias.body[0]).toMatchObject({ id: respuesta.body.id, estado: "En revisión" });
    const notificacion = await consultarUna("SELECT texto FROM notificaciones WHERE solicitud_id = ?", [respuesta.body.id]);
    expect(notificacion.texto).toBe("Tu solicitud para Cjotas está en revisión.");
  });

  test("PR-15 una solicitud con teléfono inválido responde 400 y no se guarda", async () => {
    const respuesta = await crearSolicitud(tokenEdwin, { ...solicitudValida(MASCOTAS.cjotas), telefono: "88881234" });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toEqual({ error: "El teléfono debe tener el formato 8888-1234." });
    expect((await fotografiaDeLaBase(MASCOTAS.cjotas)).estadoMascota).toBe("Disponible");
  });

  test("PR-16 solicitar una mascota que no está disponible responde 409", async () => {
    const adoptada = await crearSolicitud(tokenEdwin, solicitudValida(MASCOTAS.encantador));
    const tokenAna = await registrarAdoptante("Ana López", "ana@correo.com");
    const enProceso = await crearSolicitud(tokenAna, solicitudValida(MASCOTAS.mechudo));

    expect(adoptada.status).toBe(409);
    expect(adoptada.body).toEqual({ error: "Esta mascota ya no está disponible para adopción." });
    expect(enProceso.status).toBe(409);
  });

  test("PR-17 un adoptante que intenta entrar a una ruta de administración recibe 403 (RNF-04)", async () => {
    const listar = await request(app).get("/api/admin/solicitudes").set("Authorization", `Bearer ${tokenEdwin}`);
    const aprobar = await request(app).patch("/api/admin/solicitudes/1").set("Authorization", `Bearer ${tokenEdwin}`).send({ estado: "Aprobada" });

    expect(listar.status).toBe(403);
    expect(aprobar.status).toBe(403);
    expect(listar.body).toEqual({ error: "No tienes permiso para realizar esta acción." });
    expect((await consultarUna("SELECT estado FROM solicitudes WHERE id = 1")).estado).toBe("En revisión");
  });

  test("PR-18 aprobar una solicitud cambia la mascota a Adoptada y crea la notificación", async () => {
    const respuesta = await responder(1, "Aprobada");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({ estado: "Aprobada", mascota: { nombre: "Mechudo", estado: "Adoptada" } });
    const notificacion = await consultarUna("SELECT texto, leida FROM notificaciones WHERE solicitud_id = 1 ORDER BY id DESC LIMIT 1");
    expect(notificacion).toMatchObject({ texto: "¡Tu solicitud para Mechudo fue aprobada!", leida: 0 });
    const repetida = await responder(1, "Rechazada");
    expect(repetida.status).toBe(409);
  });

  test("PR-19 si falla la notificación, la transacción hace rollback y nada queda guardado", async () => {
    const antes = await fotografiaDeLaBase(MASCOTAS.mechudo);
    jest.spyOn(repositorioNotificaciones, "crear").mockRejectedValueOnce(new Error("Fallo simulado al insertar la notificación"));

    const respuesta = await responder(1, "Aprobada");

    expect(respuesta.status).toBe(500);
    expect(respuesta.body).toEqual({ error: "Error interno del servidor." });
    expect(await fotografiaDeLaBase(MASCOTAS.mechudo)).toEqual(antes);
    expect(antes.estadoMascota).toBe("En proceso");
    expect((await consultarUna("SELECT estado FROM solicitudes WHERE id = 1")).estado).toBe("En revisión");
  });

  test("PR-20 dos solicitudes simultáneas por la misma mascota: solo una se guarda", async () => {
    const tokenAna = await registrarAdoptante("Ana López", "ana@correo.com");
    const tokenBeto = await registrarAdoptante("Beto Ruiz", "beto@correo.com");

    const respuestas = await Promise.all([
      crearSolicitud(tokenAna, solicitudValida(MASCOTAS.elHambriento)),
      crearSolicitud(tokenBeto, solicitudValida(MASCOTAS.elHambriento)),
    ]);

    expect(respuestas.map((r) => r.status).sort()).toEqual([201, 409]);
    const { total } = await consultarUna("SELECT COUNT(*) AS total FROM solicitudes WHERE mascota_id = ?", [MASCOTAS.elHambriento]);
    expect(total).toBe(1);
  });

  test("PR-21 el seguimiento responde en menos de 2 segundos y solo lo ve su dueño (RF-05, RNF-01)", async () => {
    const inicio = performance.now();
    const propio = await request(app).get("/api/solicitudes/1").set("Authorization", `Bearer ${tokenEdwin}`);
    const duracion = performance.now() - inicio;
    const tokenAna = await registrarAdoptante("Ana López", "ana@correo.com");
    const ajeno = await request(app).get("/api/solicitudes/1").set("Authorization", `Bearer ${tokenAna}`);

    expect(propio.status).toBe(200);
    expect(propio.body).toMatchObject({ id: 1, estado: "En revisión", mascota: { nombre: "Mechudo" } });
    expect(duracion).toBeLessThan(2000);
    expect(ajeno.status).toBe(403);
  });
});
