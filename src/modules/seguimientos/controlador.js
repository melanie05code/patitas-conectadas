const servicio = require("./servicio");
const ErrorApp = require("../../utils/ErrorApp");
const { leerFiltroEstados } = require("./validaciones");

async function listarDeSolicitud(req, res) {
  res.json(await servicio.listarDeSolicitud(req.params.id, req.usuario));
}

async function subirFoto(req, res) {
  res.json(await servicio.subirFoto(req.params.id, req.usuario, req.file));
}

async function listarParaAdmin(req, res) {
  const estados = leerFiltroEstados(req.query.estado);
  if (!estados) throw new ErrorApp(400, "El filtro de estado no es válido.");
  res.json(await servicio.listarParaAdmin(estados));
}

async function revisar(req, res) {
  res.json(await servicio.revisar(req.params.id, req.body));
}

module.exports = { listarDeSolicitud, subirFoto, listarParaAdmin, revisar };
