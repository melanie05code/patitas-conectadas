const { app, request, USUARIOS, reiniciarBaseDatos, iniciarSesion, registrarAdoptante, cerrarConexiones } = require("./ayudantes");

let tokenEdwin;

function totalNoLeidas(token) {
  return request(app).get("/api/notificaciones/no-leidas/total").set("Authorization", `Bearer ${token}`);
}

beforeEach(async () => {
  await reiniciarBaseDatos();
  tokenEdwin = await iniciarSesion(USUARIOS.edwin);
});
afterAll(cerrarConexiones);

describe("Notificaciones internas (RF-07)", () => {
  test("PR-22 marcar una notificación como leída baja el contador y solo lo puede hacer su dueño", async () => {
    const lista = await request(app).get("/api/notificaciones").set("Authorization", `Bearer ${tokenEdwin}`);
    const noLeida = lista.body.find((n) => !n.leida);
    const tokenAna = await registrarAdoptante("Ana López", "ana@correo.com");

    const ajena = await request(app).patch(`/api/notificaciones/${noLeida.id}/leida`).set("Authorization", `Bearer ${tokenAna}`);
    expect(ajena.status).toBe(403);
    expect((await totalNoLeidas(tokenEdwin)).body).toEqual({ total: 3 });

    const propia = await request(app).patch(`/api/notificaciones/${noLeida.id}/leida`).set("Authorization", `Bearer ${tokenEdwin}`);
    expect(propia.status).toBe(200);
    expect(propia.body).toMatchObject({ id: noLeida.id, leida: true });
    expect((await totalNoLeidas(tokenEdwin)).body).toEqual({ total: 2 });
  });

  test("PR-23 las notificaciones exigen sesión (401)", async () => {
    const respuesta = await request(app).get("/api/notificaciones");

    expect(respuesta.status).toBe(401);
    expect(respuesta.body).toEqual({ error: "Debes iniciar sesión para continuar." });
  });
});
