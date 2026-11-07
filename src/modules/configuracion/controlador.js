const servicio = require("./servicio");

async function obtener(req, res) {
  res.json(await servicio.obtener());
}

async function actualizar(req, res) {
  res.json(await servicio.actualizar(req.body));
}

module.exports = { obtener, actualizar };
