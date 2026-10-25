const ErrorApp = require("../utils/ErrorApp");
const { enteroPositivo } = require("../utils/validadores");

function validarId(req, res, next) {
  const id = enteroPositivo(req.params.id);
  if (!id) throw new ErrorApp(400, "El identificador debe ser un número entero positivo.");
  req.params.id = id;
  next();
}

module.exports = validarId;
