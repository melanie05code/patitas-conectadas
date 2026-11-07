const repositorio = require("./repositorio");
const repositorioMascotas = require("../mascotas/repositorio");
const repositorioNotificaciones = require("../notificaciones/repositorio");
const repositorioEntrevistas = require("../entrevistas/repositorio");
const repositorioPerfiles = require("../perfiles/repositorio");
const servicioPerfiles = require("../perfiles/servicio");
const servicioEntrevistas = require("../entrevistas/servicio");
const ErrorApp = require("../../utils/ErrorApp");
const { fechaEnTexto, horaEnTexto } = require("../../utils/fechas");
const { enTransaccion } = require("../../config/db");
const { ESTADOS_ACTIVOS } = require("./validaciones");

const MENSAJE_NO_DISPONIBLE = "Esta mascota ya no está disponible para adopción.";
const MENSAJE_DUPLICADA = "Ya tienes una solicitud activa para esta mascota.";

async function crear(usuarioId, datos) {
  let id;
  try {
    id = await enTransaccion(async (conexion) => {
      await servicioPerfiles.exigirPerfil(usuarioId, conexion);
      const mascota = await repositorioMascotas.bloquearPorId(datos.mascotaId, conexion);
      if (!mascota) throw new ErrorApp(404, "Mascota no encontrada.");
      if (await repositorio.existeActiva(usuarioId, datos.mascotaId, conexion)) throw new ErrorApp(409, MENSAJE_DUPLICADA);
      if (mascota.estado !== "Disponible") throw new ErrorApp(409, MENSAJE_NO_DISPONIBLE);

      const solicitudId = await repositorio.crear({ ...datos, usuarioId }, conexion);
      await repositorioMascotas.cambiarEstado(datos.mascotaId, "En proceso", conexion);
      const { nombre } = await repositorioMascotas.buscarPorId(datos.mascotaId, conexion);
      await repositorioNotificaciones.crear(
        { usuarioId, solicitudId, texto: `Recibimos tu solicitud para ${nombre}. Te avisaremos cuando el refugio agende tu entrevista.` },
        conexion
      );
      return solicitudId;
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw new ErrorApp(409, MENSAJE_NO_DISPONIBLE);
    throw error;
  }
  return repositorio.buscarPorId(id);
}

async function bloquearSolicitud(id, conexion) {
  const solicitud = await repositorio.bloquearPorId(id, conexion);
  if (!solicitud) throw new ErrorApp(404, "Solicitud no encontrada.");
  return solicitud;
}

async function agendarEntrevista(id, { fechaHora }) {
  try {
    await enTransaccion(async (conexion) => {
      const solicitud = await bloquearSolicitud(id, conexion);
      if (!["Solicitada", "Entrevista programada"].includes(solicitud.estado)) {
        throw new ErrorApp(409, `Solo se puede agendar la entrevista de una solicitud Solicitada o con Entrevista programada (estado actual: ${solicitud.estado}).`);
      }
      const horario = await servicioEntrevistas.validarHorario(fechaHora, id, conexion);
      const reprogramada = solicitud.estado === "Entrevista programada";
      if (reprogramada) await repositorioEntrevistas.reprogramar(id, horario, conexion);
      else {
        await repositorioEntrevistas.crear({ solicitudId: id, ...horario }, conexion);
        await repositorio.cambiarEstado(id, "Entrevista programada", conexion);
      }
      const { nombre } = await repositorioMascotas.buscarPorId(solicitud.mascotaId, conexion);
      const cuando = `el ${fechaEnTexto(horario.momento)} a las ${horaEnTexto(horario.momento)}`;
      const texto = reprogramada
        ? `Tu entrevista para adoptar a ${nombre} se reprogramó para ${cuando}.`
        : `Tu entrevista para adoptar a ${nombre} quedó agendada para ${cuando} en el refugio.`;
      await repositorioNotificaciones.crear({ usuarioId: solicitud.usuarioId, solicitudId: id, texto }, conexion);
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw new ErrorApp(409, servicioEntrevistas.MENSAJE_OCUPADO);
    throw error;
  }
  return obtenerDetalle(id);
}

async function marcarEntrevistada(id, { notas }) {
  await enTransaccion(async (conexion) => {
    const solicitud = await bloquearSolicitud(id, conexion);
    if (solicitud.estado !== "Entrevista programada") {
      throw new ErrorApp(409, `Solo se puede marcar como entrevistada una solicitud con Entrevista programada (estado actual: ${solicitud.estado}).`);
    }
    await repositorioEntrevistas.marcarRealizada(id, notas, conexion);
    await repositorio.cambiarEstado(id, "Entrevistada", conexion);
  });
  return obtenerDetalle(id);
}

async function aprobar(solicitud, conexion) {
  if (solicitud.estado !== "Entrevistada") {
    throw new ErrorApp(409, "Solo se puede aprobar una solicitud después de realizar la entrevista.");
  }
  await repositorio.cambiarEstado(solicitud.id, "Aprobada", conexion);
  await repositorioMascotas.cambiarEstado(solicitud.mascotaId, "Adoptada", conexion);
  const { nombre } = await repositorioMascotas.buscarPorId(solicitud.mascotaId, conexion);
  return `Tu solicitud para ${nombre} fue aprobada. Revisa en tu seguimiento las fechas de los controles post-adopción.`;
}

async function rechazar(solicitud, motivo, conexion) {
  if (!ESTADOS_ACTIVOS.includes(solicitud.estado)) {
    throw new ErrorApp(409, `Esta solicitud ya fue respondida (${solicitud.estado}).`);
  }
  await repositorio.cambiarEstado(solicitud.id, "Rechazada", conexion);
  await repositorioMascotas.cambiarEstado(solicitud.mascotaId, "Disponible", conexion);
  await repositorioEntrevistas.cerrarPorRechazo(solicitud.id, motivo, conexion);
  const { nombre } = await repositorioMascotas.buscarPorId(solicitud.mascotaId, conexion);
  return `Tu solicitud para ${nombre} fue rechazada.`;
}

async function responder(id, { estado, motivo }) {
  await enTransaccion(async (conexion) => {
    const solicitud = await bloquearSolicitud(id, conexion);
    await repositorioMascotas.bloquearPorId(solicitud.mascotaId, conexion);
    const texto = estado === "Aprobada" ? await aprobar(solicitud, conexion) : await rechazar(solicitud, motivo, conexion);
    await repositorioNotificaciones.crear({ usuarioId: solicitud.usuarioId, solicitudId: id, texto }, conexion);
  });
  return obtenerDetalle(id);
}

async function obtenerDetalle(id) {
  const solicitud = await repositorio.buscarPorId(id);
  if (!solicitud) throw new ErrorApp(404, "Solicitud no encontrada.");
  const [entrevista, perfil] = await Promise.all([
    repositorioEntrevistas.buscarPorSolicitud(id),
    repositorioPerfiles.buscarPorUsuario(solicitud.usuario.id),
  ]);
  return { ...solicitud, entrevista, perfil };
}

async function obtener(id, usuario) {
  const solicitud = await repositorio.buscarPorId(id);
  if (!solicitud) throw new ErrorApp(404, "Solicitud no encontrada.");
  if (usuario.rol !== "admin" && solicitud.usuario.id !== usuario.id) {
    throw new ErrorApp(403, "No tienes permiso para ver esta solicitud.");
  }
  const entrevista = await repositorioEntrevistas.buscarPorSolicitud(id);
  return { ...solicitud, entrevista: entrevista && { ...entrevista, notasAdmin: usuario.rol === "admin" ? entrevista.notasAdmin : undefined } };
}

function listarPropias(usuarioId) {
  return repositorio.listarPorUsuario(usuarioId);
}

function listar(filtros) {
  return repositorio.listar(filtros);
}

module.exports = {
  crear,
  agendarEntrevista,
  marcarEntrevistada,
  responder,
  obtener,
  obtenerDetalle,
  listarPropias,
  listar,
};
