const ErrorApp = require("../utils/ErrorApp");
const { esPrueba } = require("../config/entorno");
const { eliminarArchivo } = require("../utils/archivos");

const ERRORES_MYSQL = {
  ER_DUP_ENTRY: [409, "El registro ya existe."],
  ER_CHECK_CONSTRAINT_VIOLATED: [400, "Los datos no cumplen las reglas de validación."],
  ER_NO_REFERENCED_ROW_2: [400, "El registro relacionado no existe."],
  ER_ROW_IS_REFERENCED_2: [409, "No se puede eliminar porque tiene registros relacionados."],
  ER_DATA_TOO_LONG: [400, "Uno de los campos supera la longitud permitida."],
  WARN_DATA_TRUNCATED: [400, "Uno de los campos tiene un valor no permitido."],
};

function rutaNoEncontrada(req, res, next) {
  next(new ErrorApp(404, "Recurso no encontrado."));
}

function respuestaDeError(error) {
  if (error instanceof ErrorApp) return [error.status, error.message];
  if (error.type === "entity.parse.failed") return [400, "El cuerpo de la petición no es un JSON válido."];
  if (error.type === "entity.too.large") return [413, "La petición es demasiado grande."];
  if (ERRORES_MYSQL[error.code]) return ERRORES_MYSQL[error.code];
  if (!esPrueba) console.error(error);
  return [500, "Error interno del servidor."];
}

async function manejadorErrores(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (req.file) await eliminarArchivo(req.file.path).catch(() => {});
  const [status, mensaje] = respuestaDeError(error);
  res.status(status).json({ error: mensaje });
}

module.exports = { rutaNoEncontrada, manejadorErrores };
