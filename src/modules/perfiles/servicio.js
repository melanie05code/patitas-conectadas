const repositorio = require("./repositorio");
const ErrorApp = require("../../utils/ErrorApp");

const MENSAJE_SIN_PERFIL = "Completa tu perfil de adoptante antes de solicitar una adopción.";

async function obtener(usuarioId) {
  const perfil = await repositorio.buscarPorUsuario(usuarioId);
  if (!perfil) throw new ErrorApp(404, "Todavía no completas tu perfil de adoptante.");
  return perfil;
}

function guardar(usuarioId, datos) {
  return repositorio.guardar(usuarioId, datos);
}

async function exigirPerfil(usuarioId, conexion) {
  const perfil = await repositorio.buscarPorUsuario(usuarioId, conexion);
  if (!perfil) throw new ErrorApp(400, MENSAJE_SIN_PERFIL);
  return perfil;
}

module.exports = { obtener, guardar, exigirPerfil, MENSAJE_SIN_PERFIL };
