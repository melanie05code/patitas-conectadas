const { randomBytes } = require("crypto");
const bcrypt = require("bcrypt");
const repositorio = require("./repositorio");
const ErrorApp = require("../../utils/ErrorApp");
const { generarToken } = require("../../utils/token");

const RONDAS_BCRYPT = 10;
const MENSAJE_CORREO_DUPLICADO = "Ya existe una cuenta con ese correo.";
const MENSAJE_CREDENCIALES = "Correo o contraseña incorrectos.";
const HASH_SIMULADO = bcrypt.hashSync(randomBytes(16).toString("hex"), RONDAS_BCRYPT);

function respuestaDeSesion(usuario) {
  const publico = Object.fromEntries(Object.entries(usuario).filter(([clave]) => clave !== "passwordHash"));
  return { token: generarToken(publico), usuario: publico };
}

async function registrar({ nombre, email, password }) {
  if (await repositorio.existeEmail(email)) throw new ErrorApp(409, MENSAJE_CORREO_DUPLICADO);

  const passwordHash = await bcrypt.hash(password, RONDAS_BCRYPT);
  let id;
  try {
    id = await repositorio.crear({ nombre, email, passwordHash, rol: "adoptante" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw new ErrorApp(409, MENSAJE_CORREO_DUPLICADO);
    throw error;
  }
  return respuestaDeSesion(await repositorio.buscarPorId(id));
}

async function iniciarSesion({ email, password }) {
  const usuario = await repositorio.buscarPorEmailConHash(email);
  const coincide = await bcrypt.compare(password, usuario ? usuario.passwordHash : HASH_SIMULADO);
  if (!usuario || !coincide) throw new ErrorApp(401, MENSAJE_CREDENCIALES);
  return respuestaDeSesion(usuario);
}

async function obtenerPerfil(id) {
  const usuario = await repositorio.buscarPorId(id);
  if (!usuario) throw new ErrorApp(401, "Tu sesión ya no es válida. Inicia sesión de nuevo.");
  return usuario;
}

module.exports = { registrar, iniciarSesion, obtenerPerfil };
