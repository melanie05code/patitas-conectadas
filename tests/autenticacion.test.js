const { app, request, USUARIOS, reiniciarBaseDatos, consultarUna, cerrarConexiones } = require("./ayudantes");

beforeEach(reiniciarBaseDatos);
afterAll(cerrarConexiones);

describe("Autenticación (RF-01, RF-02, RNF-02)", () => {
  test("PR-01 registro exitoso guarda la contraseña con hash bcrypt", async () => {
    const respuesta = await request(app)
      .post("/api/auth/registro")
      .send({ nombre: "  Ana López ", email: "ANA@Correo.com", password: "Segura2026", confirmacion: "Segura2026" });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.token).toEqual(expect.any(String));
    expect(respuesta.body.usuario).toMatchObject({ nombre: "Ana López", email: "ana@correo.com", rol: "adoptante" });
    expect(respuesta.body.usuario).not.toHaveProperty("passwordHash");

    const fila = await consultarUna("SELECT password_hash FROM usuarios WHERE email = ?", ["ana@correo.com"]);
    expect(fila.password_hash).toMatch(/^\$2b\$10\$/);
    expect(fila.password_hash).not.toContain("Segura2026");
  });

  test("PR-02 registro con correo duplicado responde 409", async () => {
    const respuesta = await request(app)
      .post("/api/auth/registro")
      .send({ nombre: "Otro Edwin", email: "EDWIN.OBANDO@correo.com", password: "Segura2026" });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body).toEqual({ error: "Ya existe una cuenta con ese correo." });
    const { total } = await consultarUna("SELECT COUNT(*) AS total FROM usuarios WHERE email = ?", ["edwin.obando@correo.com"]);
    expect(total).toBe(1);
  });

  test("PR-03 registro con datos inválidos responde 400 aunque no pase por el navegador", async () => {
    const respuesta = await request(app).post("/api/auth/registro").send({ nombre: "A", email: "no-es-correo", password: "123" });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toContain("El nombre debe tener al menos 2 caracteres.");
    expect(respuesta.body.error).toContain("El correo electrónico no tiene un formato válido.");
    expect(respuesta.body.error).toContain("La contraseña debe tener al menos 8 caracteres.");
  });

  test("PR-04 login válido devuelve un JWT con el rol del usuario", async () => {
    const respuesta = await request(app).post("/api/auth/login").send(USUARIOS.admin);

    expect(respuesta.status).toBe(200);
    const carga = JSON.parse(Buffer.from(respuesta.body.token.split(".")[1], "base64url").toString());
    expect(carga).toMatchObject({ rol: "admin", sub: "1" });
    expect(carga.exp).toBeGreaterThan(carga.iat);
    expect(respuesta.body.usuario).toMatchObject({ email: "admin@patitas.com", rol: "admin" });
  });

  test("PR-05 login con contraseña incorrecta responde 401 con mensaje genérico", async () => {
    const incorrecta = await request(app).post("/api/auth/login").send({ email: USUARIOS.edwin.email, password: "incorrecta1" });
    const inexistente = await request(app).post("/api/auth/login").send({ email: "nadie@correo.com", password: "incorrecta1" });

    expect(incorrecta.status).toBe(401);
    expect(incorrecta.body).toEqual({ error: "Correo o contraseña incorrectos." });
    expect(inexistente.status).toBe(401);
    expect(inexistente.body).toEqual(incorrecta.body);
  });
});
