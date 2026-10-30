const { app, request, USUARIOS, reiniciarBaseDatos, iniciarSesion, cerrarConexiones } = require("./ayudantes");
const servicioAdmin = require("../src/modules/admin/servicio");

beforeAll(reiniciarBaseDatos);
afterEach(() => jest.restoreAllMocks());
afterAll(cerrarConexiones);

describe("Diagnóstico de red del administrador", () => {
  test("PR-29 el administrador diagnostica un host válido", async () => {
    const token = await iniciarSesion(USUARIOS.admin);
    const respuesta = await request(app).get("/api/admin/diagnostico").query({ host: "127.0.0.1" }).set("Authorization", `Bearer ${token}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({ host: "127.0.0.1", alcanzable: expect.any(Boolean), salida: expect.any(String) });
    expect(respuesta.body.salida.length).toBeLessThanOrEqual(2000);
  });

  test("PR-30 el diagnóstico rechaza hosts con comandos u opciones sin ejecutar nada", async () => {
    const token = await iniciarSesion(USUARIOS.admin);
    const espia = jest.spyOn(servicioAdmin, "diagnosticarHost");

    for (const host of ["127.0.0.1; ls", "127.0.0.1 && whoami", "$(id)", "-f", "a..b", "host-", "", "x".repeat(254)]) {
      const respuesta = await request(app).get("/api/admin/diagnostico").query({ host }).set("Authorization", `Bearer ${token}`);
      expect(respuesta.status).toBe(400);
    }
    expect(espia).not.toHaveBeenCalled();
  });

  test("PR-31 solo el administrador puede usar el diagnóstico", async () => {
    const tokenAdoptante = await iniciarSesion(USUARIOS.edwin);
    const sinSesion = await request(app).get("/api/admin/diagnostico").query({ host: "127.0.0.1" });
    const adoptante = await request(app).get("/api/admin/diagnostico").query({ host: "127.0.0.1" }).set("Authorization", `Bearer ${tokenAdoptante}`);

    expect(sinSesion.status).toBe(401);
    expect(adoptante.status).toBe(403);
  });

  test("PR-32 el estado del servicio confirma la conexión con la base de pruebas", async () => {
    const respuesta = await request(app).get("/api/salud");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({ estado: "ok", baseDatos: "patitas_test" });
  });
});
