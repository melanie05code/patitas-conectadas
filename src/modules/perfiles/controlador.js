const servicio = require("./servicio");

async function obtener(req, res) {
  res.json(await servicio.obtener(req.usuario.id));
}

async function guardar(req, res) {
  res.json(await servicio.guardar(req.usuario.id, req.body));
}

module.exports = { obtener, guardar };
