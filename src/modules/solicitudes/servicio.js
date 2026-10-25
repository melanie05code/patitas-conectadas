const repositorio = require("./repositorio");
const repositorioMascotas = require("../mascotas/repositorio");
const repositorioNotificaciones = require("../notificaciones/repositorio");
const ErrorApp = require("../../utils/ErrorApp");
const { enTransaccion } = require("../../config/db");

const MENSAJE_NO_DISPONIBLE = "Esta mascota ya no está disponible para adopción.";
const MENSAJE_DUPLICADA = "Ya tienes una solicitud en revisión para esta mascota.";

const RESULTADOS = {
  Aprobada: { estadoMascota: "Adoptada", texto: (nombre) => `¡Tu solicitud para ${nombre} fue aprobada!` },
  Rechazada: { estadoMascota: "Disponible", texto: (nombre) => `Tu solicitud para ${nombre} fue rechazada.` },
};

async function crear(usuarioId, datos) {
  let id;
  try {
    id = await enTransaccion(async (conexion) => {
      const mascota = await repositorioMascotas.bloquearPorId(datos.mascotaId, conexion);
      if (!mascota) throw new ErrorApp(404, "Mascota no encontrada.");
      if (await repositorio.existeActiva(usuarioId, datos.mascotaId, conexion)) throw new ErrorApp(409, MENSAJE_DUPLICADA);
      if (mascota.estado !== "Disponible") throw new ErrorApp(409, MENSAJE_NO_DISPONIBLE);

      const solicitudId = await repositorio.crear({ ...datos, usuarioId }, conexion);
      await repositorioMascotas.cambiarEstado(datos.mascotaId, "En proceso", conexion);
      const { nombre } = await repositorioMascotas.buscarPorId(datos.mascotaId, conexion);
      await repositorioNotificaciones.crear(
        { usuarioId, solicitudId, texto: `Tu solicitud para ${nombre} está en revisión.` },
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

async function responder(id, estado) {
  await enTransaccion(async (conexion) => {
    const solicitud = await repositorio.bloquearPorId(id, conexion);
    if (!solicitud) throw new ErrorApp(404, "Solicitud no encontrada.");
    if (solicitud.estado !== "En revisión") {
      throw new ErrorApp(409, `Esta solicitud ya fue respondida (${solicitud.estado}).`);
    }
    await repositorioMascotas.bloquearPorId(solicitud.mascotaId, conexion);
    const resultado = RESULTADOS[estado];

    await repositorio.cambiarEstado(id, estado, conexion);
    await repositorioMascotas.cambiarEstado(solicitud.mascotaId, resultado.estadoMascota, conexion);
    const { nombre } = await repositorioMascotas.buscarPorId(solicitud.mascotaId, conexion);
    await repositorioNotificaciones.crear(
      { usuarioId: solicitud.usuarioId, solicitudId: id, texto: resultado.texto(nombre) },
      conexion
    );
  });
  return repositorio.buscarPorId(id);
}

async function obtener(id, usuario) {
  const solicitud = await repositorio.buscarPorId(id);
  if (!solicitud) throw new ErrorApp(404, "Solicitud no encontrada.");
  if (usuario.rol !== "admin" && solicitud.usuario.id !== usuario.id) {
    throw new ErrorApp(403, "No tienes permiso para ver esta solicitud.");
  }
  return solicitud;
}

function listarPropias(usuarioId) {
  return repositorio.listarPorUsuario(usuarioId);
}

function listar(filtros) {
  return repositorio.listar(filtros);
}

module.exports = { crear, responder, obtener, listarPropias, listar };
