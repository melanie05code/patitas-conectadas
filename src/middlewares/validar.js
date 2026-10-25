const ErrorApp = require("../utils/ErrorApp");

function validar(esquema) {
  return (req, res, next) => {
    const { errores, datos } = esquema(req.body ?? {});
    if (errores.length > 0) throw new ErrorApp(400, errores.join(" "));
    req.body = datos;
    next();
  };
}

module.exports = validar;
