const servicio = require("./servicio");
const ErrorApp = require("../../utils/ErrorApp");
const { leerFiltroEstados } = require("./validaciones");

async function crear(req, res) {
  res.status(201).json(await servicio.crear(req.usuario.id, req.body));
}

async function listarPropias(req, res) {
  res.json(await servicio.listarPropias(req.usuario.id));
}

async function obtener(req, res) {
  res.json(await servicio.obtener(req.params.id, req.usuario));
}

async function obtenerDetalle(req, res) {
  res.json(await servicio.obtenerDetalle(req.params.id));
}

async function listar(req, res) {
  const estados = leerFiltroEstados(req.query.estado);
  if (!estados) throw new ErrorApp(400, "El filtro de estado no es válido.");
  res.json(await servicio.listar({ estados }));
}

async function agendarEntrevista(req, res) {
  res.json(await servicio.agendarEntrevista(req.params.id, req.body));
}

async function marcarEntrevistada(req, res) {
  res.json(await servicio.marcarEntrevistada(req.params.id, req.body));
}

async function responder(req, res) {
  res.json(await servicio.responder(req.params.id, req.body));
}

module.exports = { crear, listarPropias, obtener, obtenerDetalle, listar, agendarEntrevista, marcarEntrevistada, responder };
