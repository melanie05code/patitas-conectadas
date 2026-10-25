const { app, request, reiniciarBaseDatos, cerrarConexiones } = require("./ayudantes");

beforeAll(reiniciarBaseDatos);
afterAll(cerrarConexiones);

describe("Límite de intentos de inicio de sesión (RF-02)", () => {
  test("PR-06 tras 5 intentos fallidos el login se bloquea con 429", async () => {
    const intento = () => request(app).post("/api/auth/login").send({ email: "x@correo.com", password: "incorrecta1" });
    const estados = [];
    for (let i = 0; i < 6; i++) estados.push((await intento()).status);

    expect(estados).toEqual([401, 401, 401, 401, 401, 429]);
  });
});
