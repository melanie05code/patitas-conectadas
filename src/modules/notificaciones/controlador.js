const servicio = require("./servicio");

async function listar(req, res) {
  res.json(await servicio.listar(req.usuario.id));
}

async function totalNoLeidas(req, res) {
  res.json(await servicio.totalNoLeidas(req.usuario.id));
}

async function marcarLeida(req, res) {
  res.json(await servicio.marcarLeida(req.params.id, req.usuario.id));
}

async function marcarTodasLeidas(req, res) {
  res.json(await servicio.marcarTodasLeidas(req.usuario.id));
}

module.exports = { listar, totalNoLeidas, marcarLeida, marcarTodasLeidas };
