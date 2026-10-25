const fs = require("fs");
const path = require("path");
const { app, request, USUARIOS, MASCOTAS, reiniciarBaseDatos, iniciarSesion, cerrarConexiones } = require("./ayudantes");
const { directorioMascotas } = require("../src/utils/archivos");

const FOTO_JPG = fs.readFileSync(path.join(__dirname, "..", "database", "seed-fotos", "cjotas.jpg"));
const NUEVA_MASCOTA = { nombre: "Copito", tipoId: "4", edad: "1 año", raza: "Cabeza de león", sexo: "Macho", descripcion: "Conejo blanco muy tranquilo y limpio." };

function conCampos(peticion, campos) {
  return Object.entries(campos).reduce((p, [campo, valor]) => p.field(campo, valor), peticion);
}

let tokenAdmin;

beforeEach(async () => {
  await reiniciarBaseDatos();
  tokenAdmin = await iniciarSesion(USUARIOS.admin);
});
afterAll(cerrarConexiones);

describe("Catálogo y tipos de mascota (RF-03, RF-04, RF-09, RNF-04, PB-10, PB-16)", () => {
  test("PR-07 el catálogo público se filtra por tipo y búsqueda", async () => {
    const gatos = await request(app).get("/api/mascotas").query({ tipoId: 2 });
    const busqueda = await request(app).get("/api/mascotas").query({ q: "chu" });
    const filtros = await request(app).get("/api/tipos-mascota").query({ activos: 1, conMascotas: 1 });

    expect(gatos.status).toBe(200);
    expect(gatos.body.map((m) => m.nombre).sort()).toEqual(["Calenturiento", "Encantador"]);
    expect(busqueda.body.map((m) => m.nombre)).toEqual(["Mechudo"]);
    expect(filtros.body.map((t) => t.nombre)).toEqual(["Perro", "Gato", "Ave"]);
  });

  test("PR-08 el detalle es público y una mascota inexistente responde 404", async () => {
    const lara = await request(app).get(`/api/mascotas/${MASCOTAS.lara}`);
    const inexistente = await request(app).get("/api/mascotas/999");

    expect(lara.status).toBe(200);
    expect(lara.body).toMatchObject({ nombre: "Lara", estado: "Adoptada", tipo: { nombre: "Ave" }, fotoUrl: "/uploads/mascotas/lara.jpg" });
    expect(inexistente.status).toBe(404);
    expect(inexistente.body).toEqual({ error: "Mascota no encontrada." });
  });

  test("PR-09 crear un tipo de mascota duplicado responde 409", async () => {
    const respuesta = await request(app)
      .post("/api/tipos-mascota")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ nombre: "perro" });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body).toEqual({ error: "Ya existe un tipo de mascota con ese nombre." });
  });

  test("PR-10 un adoptante no puede gestionar tipos ni mascotas (403) y sin sesión es 401", async () => {
    const tokenAdoptante = await iniciarSesion(USUARIOS.edwin);
    const tipo = await request(app).post("/api/tipos-mascota").set("Authorization", `Bearer ${tokenAdoptante}`).send({ nombre: "Hurón" });
    const mascota = await request(app).post("/api/mascotas").set("Authorization", `Bearer ${tokenAdoptante}`).send(NUEVA_MASCOTA);
    const sinSesion = await request(app).post("/api/mascotas").send(NUEVA_MASCOTA);

    expect(tipo.status).toBe(403);
    expect(mascota.status).toBe(403);
    expect(sinSesion.status).toBe(401);
  });

  test("PR-11 el administrador crea una mascota con foto válida", async () => {
    const respuesta = await conCampos(request(app).post("/api/mascotas").set("Authorization", `Bearer ${tokenAdmin}`), NUEVA_MASCOTA)
      .attach("foto", FOTO_JPG, { filename: "copito.jpg", contentType: "image/jpeg" });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body).toMatchObject({ nombre: "Copito", estado: "Disponible", tipo: { nombre: "Conejo" } });
    expect(respuesta.body.fotoUrl).toMatch(/^\/uploads\/mascotas\/[0-9a-f-]{36}\.jpg$/);
    const foto = await request(app).get(respuesta.body.fotoUrl);
    expect(foto.status).toBe(200);
    expect(foto.headers["content-type"]).toBe("image/jpeg");
  });

  test("PR-12 una foto con formato no permitido o disfrazada responde 400 y no queda en el disco", async () => {
    const archivosAntes = fs.readdirSync(directorioMascotas).length;
    const texto = await conCampos(request(app).post("/api/mascotas").set("Authorization", `Bearer ${tokenAdmin}`), NUEVA_MASCOTA)
      .attach("foto", Buffer.from("hola"), { filename: "nota.txt", contentType: "text/plain" });
    const disfrazado = await conCampos(request(app).post("/api/mascotas").set("Authorization", `Bearer ${tokenAdmin}`), NUEVA_MASCOTA)
      .attach("foto", Buffer.from("esto no es una imagen"), { filename: "falso.png", contentType: "image/png" });
    const invalida = await conCampos(request(app).post("/api/mascotas").set("Authorization", `Bearer ${tokenAdmin}`), { ...NUEVA_MASCOTA, nombre: "" })
      .attach("foto", FOTO_JPG, { filename: "valida.jpg", contentType: "image/jpeg" });

    expect(texto.status).toBe(400);
    expect(texto.body).toEqual({ error: "La foto debe ser una imagen JPG, PNG o WEBP." });
    expect(disfrazado.status).toBe(400);
    expect(invalida.status).toBe(400);
    expect(fs.readdirSync(directorioMascotas).length).toBe(archivosAntes);
  });

  test("PR-13 un tipo desactivado deja de ofrecerse y no se puede asignar", async () => {
    const desactivar = await request(app)
      .put("/api/tipos-mascota/4")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ nombre: "Conejo", icono: "🐰", activo: false });
    const activos = await request(app).get("/api/tipos-mascota").query({ activos: 1 });
    const crear = await request(app).post("/api/mascotas").set("Authorization", `Bearer ${tokenAdmin}`).send(NUEVA_MASCOTA);

    expect(desactivar.status).toBe(200);
    expect(activos.body.map((t) => t.nombre)).not.toContain("Conejo");
    expect(crear.status).toBe(400);
    expect(crear.body.error).toContain("está desactivado");
  });
});
