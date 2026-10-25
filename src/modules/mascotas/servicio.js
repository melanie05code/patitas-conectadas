const repositorio = require("./repositorio");
const repositorioTipos = require("../tipos/repositorio");
const ErrorApp = require("../../utils/ErrorApp");
const { enTransaccion } = require("../../config/db");
const { eliminarFotoMascota } = require("../../utils/archivos");

const MENSAJE_NO_ENCONTRADA = "Mascota no encontrada.";

async function verificarTipo(tipoId, tipoActualId, conexion) {
  const tipo = await repositorioTipos.buscarPorId(tipoId, conexion);
  if (!tipo) throw new ErrorApp(400, "El tipo de mascota seleccionado no existe.");
  if (!tipo.activo && tipo.id !== tipoActualId) {
    throw new ErrorApp(400, `El tipo "${tipo.nombre}" está desactivado; elige otro tipo.`);
  }
}

async function verificarCambioDeEstado(mascota, nuevoEstado, conexion) {
  if (mascota.estado === nuevoEstado) return;
  if (nuevoEstado === "En proceso") {
    throw new ErrorApp(400, "El estado En proceso se asigna automáticamente cuando un adoptante envía una solicitud.");
  }
  const { enRevision, aprobadas } = await repositorio.resumenSolicitudes(mascota.id, conexion);
  if (enRevision > 0) {
    throw new ErrorApp(409, "La mascota tiene una solicitud en revisión. Apruébala o recházala desde el panel.");
  }
  if (aprobadas > 0) {
    throw new ErrorApp(409, "La mascota fue adoptada mediante una solicitud aprobada y su estado ya no puede cambiarse.");
  }
}

function listar({ tipoId, busqueda, estado }) {
  return repositorio.listar({ tipoId, busqueda, estado });
}

async function obtener(id) {
  const mascota = await repositorio.buscarPorId(id);
  if (!mascota) throw new ErrorApp(404, MENSAJE_NO_ENCONTRADA);
  return mascota;
}

async function estadisticas() {
  const conteo = await repositorio.contarPorEstado();
  return {
    disponibles: conteo["Disponible"] || 0,
    enProceso: conteo["En proceso"] || 0,
    adoptadas: conteo["Adoptada"] || 0,
  };
}

async function crear(datos) {
  await verificarTipo(datos.tipoId, null);
  const id = await repositorio.crear(datos);
  return repositorio.buscarPorId(id);
}

async function actualizar(id, { nuevaFotoUrl, quitarFoto, ...datos }) {
  const fotoAnterior = await enTransaccion(async (conexion) => {
    const actual = await repositorio.bloquearPorId(id, conexion);
    if (!actual) throw new ErrorApp(404, MENSAJE_NO_ENCONTRADA);
    await verificarTipo(datos.tipoId, actual.tipoId, conexion);
    await verificarCambioDeEstado(actual, datos.estado, conexion);
    const fotoUrl = nuevaFotoUrl || (quitarFoto ? null : undefined);
    await repositorio.actualizar(id, { ...datos, fotoUrl }, conexion);
    return fotoUrl !== undefined ? actual.fotoUrl : null;
  });
  await eliminarFotoMascota(fotoAnterior);
  return repositorio.buscarPorId(id);
}

module.exports = { listar, obtener, estadisticas, crear, actualizar };
