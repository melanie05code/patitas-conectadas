const servicio = require("./servicio");
const ErrorApp = require("../../utils/ErrorApp");
const { texto } = require("../../utils/validadores");
const { ESTADOS } = require("./validaciones");

async function crear(req, res) {
  res.status(201).json(await servicio.crear(req.usuario.id, req.body));
}

async function listarPropias(req, res) {
  res.json(await servicio.listarPropias(req.usuario.id));
}

async function obtener(req, res) {
  res.json(await servicio.obtener(req.params.id, req.usuario));
}

async function listar(req, res) {
  const estado = texto(req.query.estado);
  if (estado && !ESTADOS.includes(estado)) throw new ErrorApp(400, "El filtro de estado no es válido.");
  res.json(await servicio.listar({ estado }));
}

async function responder(req, res) {
  res.json(await servicio.responder(req.params.id, req.body.estado));
}

module.exports = { crear, listarPropias, obtener, listar, responder };
