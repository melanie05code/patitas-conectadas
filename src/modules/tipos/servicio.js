const repositorio = require("./repositorio");
const ErrorApp = require("../../utils/ErrorApp");

const MENSAJE_DUPLICADO = "Ya existe un tipo de mascota con ese nombre.";

function traducirDuplicado(error) {
  if (error.code === "ER_DUP_ENTRY") return new ErrorApp(409, MENSAJE_DUPLICADO);
  return error;
}

function listar(filtros) {
  return repositorio.listar(filtros);
}

async function crear(datos) {
  try {
    const id = await repositorio.crear(datos);
    return repositorio.buscarPorId(id);
  } catch (error) {
    throw traducirDuplicado(error);
  }
}

async function actualizar(id, datos) {
  let actualizado;
  try {
    actualizado = await repositorio.actualizar(id, datos);
  } catch (error) {
    throw traducirDuplicado(error);
  }
  if (!actualizado) throw new ErrorApp(404, "Tipo de mascota no encontrado.");
  return repositorio.buscarPorId(id);
}

module.exports = { listar, crear, actualizar };
