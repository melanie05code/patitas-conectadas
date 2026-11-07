const fs = require("fs");
const path = require("path");
const { app, request, USUARIOS, reiniciarBaseDatos, iniciarSesion, consultarUna, cerrarConexiones } = require("./ayudantes");
const repositorioSeguimientos = require("../src/modules/seguimientos/repositorio");
const { directorioMascotas } = require("../src/utils/archivos");
const { generarRecordatorios } = require("../src/modules/seguimientos/servicio");

const FOTO_JPG = fs.readFileSync(path.join(__dirname, "..", "database", "seed-fotos", "lara.jpg"));
const SOLICITUD_VAQUITA = 5;
const CONTROL_LARA_VENCIDO = 6;
const CONTROL_LARA_FUTURO = 7;
const CONTROL_LARA_REVISADO = 5;

let tokenAdmin;
let tokenEdwin;

function admin(metodo, ruta) {
  return request(app)[metodo](`/api/admin${ruta}`).set("Authorization", `Bearer ${tokenAdmin}`);
}

function subirFoto(token, id, contenido = FOTO_JPG, nombre = "control.jpg", tipo = "image/jpeg") {
  return request(app).post(`/api/seguimientos/${id}/foto`).set("Authorization", `Bearer ${token}`).attach("foto", contenido, { filename: nombre, contentType: tipo });
}

async function llevarVaquitaAEntrevistada() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 2);
  if (fecha.getDay() === 0) fecha.setDate(fecha.getDate() + 1);
  const dos = (n) => String(n).padStart(2, "0");
  await admin("patch", `/solicitudes/${SOLICITUD_VAQUITA}/entrevista`).send({ fechaHora: `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())} 09:30` });
  await admin("patch", `/solicitudes/${SOLICITUD_VAQUITA}/entrevistada`).send({});
}

function archivosSubidos() {
  return fs.readdirSync(directorioMascotas).length;
}

beforeEach(async () => {
  await reiniciarBaseDatos();
  tokenAdmin = await iniciarSesion(USUARIOS.admin);
  tokenEdwin = await iniciarSesion(USUARIOS.edwin);
});
afterEach(() => jest.restoreAllMocks());
afterAll(cerrarConexiones);

describe("Seguimiento post-adopción y recordatorios (RF-13, RF-14, RF-15)", () => {
  test("PR-45 aprobar crea N controles programados cada intervalo (configurables por .env)", async () => {
    await llevarVaquitaAEntrevistada();
    const aprobada = await admin("patch", `/solicitudes/${SOLICITUD_VAQUITA}/estado`).send({ estado: "Aprobada" });
    const controles = await request(app).get(`/api/solicitudes/${SOLICITUD_VAQUITA}/seguimientos`).set("Authorization", `Bearer ${tokenAdmin}`);
    const dias = await consultarUna(
      "SELECT GROUP_CONCAT(DATEDIFF(fecha_programada, CURDATE()) ORDER BY numero) AS dias, COUNT(*) AS total FROM seguimientos WHERE solicitud_id = ?",
      [SOLICITUD_VAQUITA]
    );

    expect(aprobada.status).toBe(200);
    expect(controles.status).toBe(200);
    expect(controles.body.map((c) => [c.numero, c.estado, c.habilitado])).toEqual([[1, "Pendiente", false], [2, "Pendiente", false], [3, "Pendiente", false], [4, "Pendiente", false]]);
    expect(dias).toMatchObject({ total: 4, dias: "90,180,270,360" });
  });

  test("PR-46 si falla la creación de los seguimientos al aprobar, se hace rollback de todo", async () => {
    await llevarVaquitaAEntrevistada();
    const notificacionesAntes = await consultarUna("SELECT COUNT(*) AS total FROM notificaciones");
    jest.spyOn(repositorioSeguimientos, "crearPlan").mockRejectedValueOnce(new Error("Fallo simulado al crear los seguimientos"));

    const respuesta = await admin("patch", `/solicitudes/${SOLICITUD_VAQUITA}/estado`).send({ estado: "Aprobada" });

    expect(respuesta.status).toBe(500);
    const estado = await consultarUna(
      `SELECT s.estado AS solicitud, m.estado AS mascota, (SELECT COUNT(*) FROM seguimientos WHERE solicitud_id = s.id) AS controles
       FROM solicitudes s INNER JOIN mascotas m ON m.id = s.mascota_id WHERE s.id = ?`,
      [SOLICITUD_VAQUITA]
    );
    expect(estado).toEqual({ solicitud: "Entrevistada", mascota: "En proceso", controles: 0 });
    expect(await consultarUna("SELECT COUNT(*) AS total FROM notificaciones")).toEqual(notificacionesAntes);
  });

  test("PR-47 el adoptante sube la foto de su control vencido; uno ajeno responde 403 y uno futuro 409", async () => {
    const tokenAna = await iniciarSesion(USUARIOS.ana);
    const antes = archivosSubidos();
    const ajeno = await subirFoto(tokenAna, CONTROL_LARA_VENCIDO);
    const futuro = await subirFoto(tokenEdwin, CONTROL_LARA_FUTURO);
    const adminSube = await subirFoto(tokenAdmin, CONTROL_LARA_VENCIDO);
    expect(archivosSubidos()).toBe(antes);

    const propio = await subirFoto(tokenEdwin, CONTROL_LARA_VENCIDO);
    const repetido = await subirFoto(tokenEdwin, CONTROL_LARA_VENCIDO);

    expect(ajeno.status).toBe(403);
    expect(futuro.status).toBe(409);
    expect(futuro.body.error).toContain("todavía no está habilitado");
    expect(adminSube.status).toBe(403);
    expect(propio.status).toBe(200);
    expect(propio.body).toMatchObject({ estado: "Enviado", fotoUrl: expect.stringMatching(/^\/uploads\/mascotas\/[0-9a-f-]+\.jpg$/) });
    expect(repetido.status).toBe(409);
    expect(archivosSubidos()).toBe(antes + 1);
    const foto = await request(app).get(propio.body.fotoUrl);
    expect(foto.status).toBe(200);
  });

  test("PR-48 la foto del control se valida como las de mascotas: tipo inválido, disfrazada o mayor a 2 MB responde 400", async () => {
    const antes = archivosSubidos();
    const texto = await subirFoto(tokenEdwin, CONTROL_LARA_VENCIDO, Buffer.from("no es una imagen"), "nota.txt", "text/plain");
    const disfrazada = await subirFoto(tokenEdwin, CONTROL_LARA_VENCIDO, Buffer.from("esto no es un jpg de verdad"), "falsa.jpg", "image/jpeg");
    const grande = Buffer.concat([FOTO_JPG, Buffer.alloc(2 * 1024 * 1024)]);
    const pesada = await subirFoto(tokenEdwin, CONTROL_LARA_VENCIDO, grande, "grande.jpg");
    const sinArchivo = await request(app).post(`/api/seguimientos/${CONTROL_LARA_VENCIDO}/foto`).set("Authorization", `Bearer ${tokenEdwin}`);

    expect([texto.status, disfrazada.status, pesada.status, sinArchivo.status]).toEqual([400, 400, 400, 400]);
    expect(pesada.body.error).toBe("La foto no puede superar 2 MB.");
    expect(archivosSubidos()).toBe(antes);
    expect((await consultarUna("SELECT estado FROM seguimientos WHERE id = ?", [CONTROL_LARA_VENCIDO])).estado).toBe("Pendiente");
  });

  test("PR-49 el admin revisa un control enviado con comentario y el adoptante recibe la notificación", async () => {
    await subirFoto(tokenEdwin, CONTROL_LARA_VENCIDO);
    const pendientes = await admin("get", "/seguimientos").query({ estado: "Enviado" });
    const sinComentario = await admin("patch", `/seguimientos/${CONTROL_LARA_VENCIDO}`).send({ estado: "Todo bien", comentario: "" });
    const estadoInvalido = await admin("patch", `/seguimientos/${CONTROL_LARA_VENCIDO}`).send({ estado: "Excelente", comentario: "Muy bien" });
    const revisado = await admin("patch", `/seguimientos/${CONTROL_LARA_VENCIDO}`).send({ estado: "Requiere atención", comentario: "La jaula se ve pequeña; te llamaremos para orientarte." });
    const yaRevisado = await admin("patch", `/seguimientos/${CONTROL_LARA_REVISADO}`).send({ estado: "Todo bien", comentario: "Otra vez" });
    const adoptante = await request(app).patch(`/api/admin/seguimientos/${CONTROL_LARA_VENCIDO}`).set("Authorization", `Bearer ${tokenEdwin}`).send({ estado: "Todo bien", comentario: "Yo mismo" });

    expect(pendientes.body.map((c) => [c.id, c.mascotaNombre, c.adoptanteNombre])).toEqual([[CONTROL_LARA_VENCIDO, "Lara", "Edwin Obando"]]);
    expect([sinComentario.status, estadoInvalido.status]).toEqual([400, 400]);
    expect(revisado.status).toBe(200);
    expect(revisado.body).toMatchObject({ estado: "Requiere atención", comentarioAdmin: "La jaula se ve pequeña; te llamaremos para orientarte." });
    expect(yaRevisado.status).toBe(409);
    expect(adoptante.status).toBe(403);
    const notificacion = await consultarUna("SELECT texto FROM notificaciones WHERE usuario_id = 2 ORDER BY id DESC LIMIT 1");
    expect(notificacion.texto).toBe("Revisamos el control 2 de Lara: Requiere atención. La jaula se ve pequeña; te llamaremos para orientarte.");
  });

  test("PR-50 el recordatorio de un control vencido se crea una sola vez (login, consulta y script) y deja de aplicar al enviar la foto", async () => {
    const consultas = await Promise.all([
      request(app).get("/api/notificaciones").set("Authorization", `Bearer ${tokenEdwin}`),
      request(app).get("/api/notificaciones/no-leidas/total").set("Authorization", `Bearer ${tokenEdwin}`),
      iniciarSesion(USUARIOS.edwin),
    ]);
    const delScript = await generarRecordatorios(null);
    const recordatorios = await consultarUna("SELECT COUNT(*) AS total, MAX(texto) AS texto FROM notificaciones WHERE recordatorio_seguimiento_id IS NOT NULL");
    const seguimientosAjenos = await request(app).get("/api/solicitudes/4/seguimientos").set("Authorization", `Bearer ${await iniciarSesion(USUARIOS.ana)}`);

    expect(consultas[0].body.some((n) => n.texto.startsWith("Recordatorio: el control 2 de Lara está pendiente desde el"))).toBe(true);
    expect(delScript).toBe(0);
    expect(recordatorios.total).toBe(1);
    expect(recordatorios.texto).toContain("Sube una foto en tu seguimiento.");
    expect(seguimientosAjenos.status).toBe(403);
  });
});
