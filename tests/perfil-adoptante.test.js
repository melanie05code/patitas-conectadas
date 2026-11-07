const {
  app,
  request,
  USUARIOS,
  MASCOTAS,
  PERFIL_VALIDO,
  reiniciarBaseDatos,
  iniciarSesion,
  registrarAdoptante,
  completarPerfil,
  consultarUna,
  solicitudValida,
  cerrarConexiones,
} = require("./ayudantes");

function guardarPerfil(token, perfil) {
  return request(app).put("/api/perfil-adoptante").set("Authorization", `Bearer ${token}`).send(perfil);
}

beforeEach(reiniciarBaseDatos);
afterAll(cerrarConexiones);

describe("Perfil del adoptante (RF-11)", () => {
  test("PR-34 solicitar sin perfil responde 400 con mensaje claro y no guarda la solicitud", async () => {
    const token = await registrarAdoptante("Laura Pérez", "laura.perez@correo.com");
    const sinPerfil = await request(app).get("/api/perfil-adoptante").set("Authorization", `Bearer ${token}`);
    const respuesta = await request(app).post("/api/solicitudes").set("Authorization", `Bearer ${token}`).send(solicitudValida(MASCOTAS.cjotas));

    expect(sinPerfil.status).toBe(404);
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toBe("Completa tu perfil de adoptante antes de solicitar una adopción.");
    const { total } = await consultarUna("SELECT COUNT(*) AS total FROM solicitudes WHERE mascota_id = ?", [MASCOTAS.cjotas]);
    expect(total).toBe(0);

    await completarPerfil(token);
    const conPerfil = await request(app).post("/api/solicitudes").set("Authorization", `Bearer ${token}`).send(solicitudValida(MASCOTAS.cjotas));
    expect(conPerfil.status).toBe(201);
  });

  test("PR-35 valores límite del perfil: personas en el hogar 0/1/20/21, campos vacíos y detalles obligatorios", async () => {
    const token = await registrarAdoptante("Laura Pérez", "laura.perez@correo.com");
    const casos = [
      [{ ...PERFIL_VALIDO, personasHogar: 0 }, 400],
      [{ ...PERFIL_VALIDO, personasHogar: 1 }, 200],
      [{ ...PERFIL_VALIDO, personasHogar: 20 }, 200],
      [{ ...PERFIL_VALIDO, personasHogar: 21 }, 400],
      [{ ...PERFIL_VALIDO, personasHogar: 2.5 }, 400],
      [{ ...PERFIL_VALIDO, personasHogar: "" }, 400],
      [{ ...PERFIL_VALIDO, tipoVivienda: "" }, 400],
      [{ ...PERFIL_VALIDO, tipoVivienda: "Castillo" }, 400],
      [{ ...PERFIL_VALIDO, tienePatio: "si" }, 400],
      [{ ...PERFIL_VALIDO, tieneOtrasMascotas: true, otrasMascotasDetalle: "" }, 400],
      [{ ...PERFIL_VALIDO, tieneOtrasMascotas: true, otrasMascotasDetalle: "x".repeat(201) }, 400],
      [{ ...PERFIL_VALIDO, tieneOtrasMascotas: true, otrasMascotasDetalle: "x".repeat(200) }, 200],
      [{ ...PERFIL_VALIDO, experienciaPrevia: true, experienciaDetalle: "x".repeat(301) }, 400],
      [{}, 400],
    ];
    const obtenidos = [];
    for (const [perfil] of casos) obtenidos.push((await guardarPerfil(token, perfil)).status);
    expect(obtenidos).toEqual(casos.map(([, esperado]) => esperado));

    const vacio = await guardarPerfil(token, {});
    expect(vacio.body.error).toContain("tipo de vivienda");
    expect(vacio.body.error).toContain("entre 1 y 20");
  });

  test("PR-36 el perfil se guarda, se edita sin duplicarse y solo lo usa el adoptante (admin 403)", async () => {
    const token = await registrarAdoptante("Laura Pérez", "laura.perez@correo.com");
    const creado = await completarPerfil(token);
    const editado = await guardarPerfil(token, { ...PERFIL_VALIDO, tipoVivienda: "Apartamento", tienePatio: false, experienciaPrevia: false, experienciaDetalle: "se ignora" });
    const leido = await request(app).get("/api/perfil-adoptante").set("Authorization", `Bearer ${token}`);
    const tokenAdmin = await iniciarSesion(USUARIOS.admin);
    const admin = await request(app).get("/api/perfil-adoptante").set("Authorization", `Bearer ${tokenAdmin}`);

    expect(creado).toMatchObject({ tipoVivienda: "Casa", tienePatio: true, personasHogar: 3 });
    expect(editado.status).toBe(200);
    expect(leido.body).toMatchObject({ tipoVivienda: "Apartamento", tienePatio: false, experienciaPrevia: false, experienciaDetalle: null });
    expect(admin.status).toBe(403);
    const { total } = await consultarUna("SELECT COUNT(*) AS total FROM perfiles_adoptante WHERE usuario_id = ?", [creado.usuarioId]);
    expect(total).toBe(1);
  });
});
