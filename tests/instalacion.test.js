const { app, request, reiniciarBaseDatos, cerrarConexiones } = require("./ayudantes");

afterAll(cerrarConexiones);

describe("Instalación de la base de datos y estado del servicio", () => {
  test("PR-31 la instalación exige las contraseñas demo por variable de entorno y el servicio responde", async () => {
    const original = process.env.SEED_ADMIN_PASSWORD;
    delete process.env.SEED_ADMIN_PASSWORD;
    try {
      await expect(reiniciarBaseDatos()).rejects.toThrow("Falta la variable de entorno SEED_ADMIN_PASSWORD");
    } finally {
      process.env.SEED_ADMIN_PASSWORD = original;
    }

    await reiniciarBaseDatos();
    const respuesta = await request(app).get("/api/salud");
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({ estado: "ok", baseDatos: "patitas_test" });
  });
});
