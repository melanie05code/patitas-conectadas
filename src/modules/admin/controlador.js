const servicio = require("./servicio");
const ErrorApp = require("../../utils/ErrorApp");

async function diagnostico(req, res) {
  const host = typeof req.query.host === "string" ? req.query.host : "";
  if (!host) throw new ErrorApp(400, "Indica el host a diagnosticar.");
  res.json(await servicio.diagnosticarHost(host));
}

module.exports = { diagnostico };
