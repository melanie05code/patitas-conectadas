const servicio = require("./servicio");
const ErrorApp = require("../../utils/ErrorApp");
const { validarDiagnostico } = require("./validaciones");

async function diagnostico(req, res) {
  const { errores, datos } = validarDiagnostico(req.query);
  if (errores.length > 0) throw new ErrorApp(400, errores.join(" "));
  res.json(await servicio.diagnosticarHost(datos.host));
}

module.exports = { diagnostico };
