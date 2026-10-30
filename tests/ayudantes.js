const crypto = require("crypto");
const request = require("supertest");
const app = require("../src/app");
const { pool } = require("../src/config/db");
const { db, esPrueba } = require("../src/config/entorno");
const { instalarBaseDatos } = require("../database/instalar");

if (!esPrueba || db.database === "patitas_conectadas") {
  throw new Error(`Las pruebas solo se ejecutan contra la base de datos de pruebas (actual: ${db.database}).`);
}

const USUARIOS = {
  admin: { email: "admin@patitas.com", password: process.env.SEED_ADMIN_PASSWORD },
  edwin: { email: "edwin.obando@correo.com", password: process.env.SEED_ADOPTANTE_PASSWORD },
};

function contrasenaAleatoria(largo = 16) {
  return crypto.randomBytes(largo).toString("base64url").slice(0, largo);
}

const MASCOTAS = { mechudo: 1, cjotas: 2, elHambriento: 3, encantador: 4, lara: 10 };

function reiniciarBaseDatos() {
  return instalarBaseDatos({ silencioso: true });
}

async function iniciarSesion({ email, password }) {
  const respuesta = await request(app).post("/api/auth/login").send({ email, password });
  if (respuesta.status !== 200) throw new Error(`No se pudo iniciar sesión con ${email}: ${respuesta.status}`);
  return respuesta.body.token;
}

async function registrarAdoptante(nombre, email) {
  const respuesta = await request(app).post("/api/auth/registro").send({ nombre, email, password: contrasenaAleatoria() });
  if (respuesta.status !== 201) throw new Error(`No se pudo registrar a ${email}: ${respuesta.status}`);
  return respuesta.body.token;
}

async function consultarUna(sql, parametros = []) {
  const [filas] = await pool.query(sql, parametros);
  return filas[0];
}

function solicitudValida(mascotaId) {
  return {
    mascotaId,
    telefono: "8765-4321",
    direccion: "Colonia Centroamérica, Managua",
    motivo: "Tengo tiempo, espacio y mucho cariño para darle.",
  };
}

function cerrarConexiones() {
  return pool.end();
}

module.exports = {
  app,
  request,
  pool,
  USUARIOS,
  MASCOTAS,
  contrasenaAleatoria,
  reiniciarBaseDatos,
  iniciarSesion,
  registrarAdoptante,
  consultarUna,
  solicitudValida,
  cerrarConexiones,
};
