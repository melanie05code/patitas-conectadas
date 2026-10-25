const ErrorApp = require("../utils/ErrorApp");
const { esPrueba } = require("../config/entorno");

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

function manejadorErrores(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ErrorApp) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "La petición es demasiado grande." });
  }
  if (ERRORES_MYSQL[error.code]) {
    const [status, mensaje] = ERRORES_MYSQL[error.code];
    return res.status(status).json({ error: mensaje });
  }

  if (!esPrueba) console.error(error);
  res.status(500).json({ error: "Error interno del servidor." });
}

module.exports = { rutaNoEncontrada, manejadorErrores };
