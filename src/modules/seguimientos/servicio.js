const repositorio = require("./repositorio");
const repositorioSolicitudes = require("../solicitudes/repositorio");
const repositorioNotificaciones = require("../notificaciones/repositorio");
const ErrorApp = require("../../utils/ErrorApp");
const { urlFotoMascota } = require("../../utils/archivos");
const { formatearFechaCorta } = require("../../utils/fechas");
const { seguimientos: configuracion } = require("../../config/entorno");
const { enTransaccion } = require("../../config/db");

const LARGO_NOTIFICACION = 255;

function programar(solicitudId, conexion) {
  return repositorio.crearPlan(solicitudId, configuracion, conexion);
}

async function listarDeSolicitud(solicitudId, usuario) {
  const solicitud = await repositorioSolicitudes.buscarPorId(solicitudId);
  if (!solicitud) throw new ErrorApp(404, "Solicitud no encontrada.");
  if (usuario.rol !== "admin" && solicitud.usuario.id !== usuario.id) {
    throw new ErrorApp(403, "No tienes permiso para ver estos seguimientos.");
  }
  return repositorio.listarPorSolicitud(solicitudId);
}

async function subirFoto(id, usuario, archivo) {
  if (!archivo) throw new ErrorApp(400, "Adjunta una foto de tu mascota en el campo 'foto'.");
  await enTransaccion(async (conexion) => {
    const seguimiento = await repositorio.bloquearPorId(id, conexion);
    if (!seguimiento) throw new ErrorApp(404, "Control de seguimiento no encontrado.");
    if (seguimiento.usuarioId !== usuario.id) throw new ErrorApp(403, "Solo puedes subir fotos de tus propios controles.");
    if (seguimiento.estado !== "Pendiente") throw new ErrorApp(409, `Este control ya tiene una foto (${seguimiento.estado}).`);
    if (!seguimiento.habilitado) {
      throw new ErrorApp(409, `Este control todavía no está habilitado. Podrás subir la foto desde el ${formatearFechaCorta(seguimiento.fechaProgramada)}.`);
    }
    await repositorio.registrarFoto(id, urlFotoMascota(archivo.filename), conexion);
  });
  return repositorio.buscarPorId(id);
}

async function revisar(id, { estado, comentario }) {
  await enTransaccion(async (conexion) => {
    const seguimiento = await repositorio.bloquearPorId(id, conexion);
    if (!seguimiento) throw new ErrorApp(404, "Control de seguimiento no encontrado.");
    if (seguimiento.estado !== "Enviado") {
      throw new ErrorApp(409, `Solo se revisan controles con la foto enviada (estado actual: ${seguimiento.estado}).`);
    }
    await repositorio.registrarRevision(id, { estado, comentario }, conexion);
    const texto = `Revisamos el control ${seguimiento.numero} de ${seguimiento.mascotaNombre}: ${estado}. ${comentario}`;
    await repositorioNotificaciones.crear(
      { usuarioId: seguimiento.usuarioId, solicitudId: seguimiento.solicitudId, texto: texto.length > LARGO_NOTIFICACION ? `${texto.slice(0, LARGO_NOTIFICACION - 3)}...` : texto },
      conexion
    );
  });
  return repositorio.buscarPorId(id);
}

function listarParaAdmin(estados) {
  return repositorio.listarParaAdmin(estados);
}

function generarRecordatorios(usuarioId) {
  return repositorio.generarRecordatorios(usuarioId);
}

module.exports = { programar, listarDeSolicitud, subirFoto, revisar, listarParaAdmin, generarRecordatorios };
