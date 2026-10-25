const repositorio = require("./repositorio");
const ErrorApp = require("../../utils/ErrorApp");

function listar(usuarioId) {
  return repositorio.listarPorUsuario(usuarioId);
}

async function totalNoLeidas(usuarioId) {
  return { total: await repositorio.contarNoLeidas(usuarioId) };
}

async function marcarLeida(id, usuarioId) {
  const dueno = await repositorio.buscarDueno(id);
  if (dueno === null) throw new ErrorApp(404, "Notificación no encontrada.");
  if (dueno !== usuarioId) throw new ErrorApp(403, "No puedes modificar notificaciones de otra persona.");
  return repositorio.marcarLeida(id);
}

async function marcarTodasLeidas(usuarioId) {
  return { actualizadas: await repositorio.marcarTodasLeidas(usuarioId) };
}

module.exports = { listar, totalNoLeidas, marcarLeida, marcarTodasLeidas };
