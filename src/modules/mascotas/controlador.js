const servicio = require("./servicio");
const ErrorApp = require("../../utils/ErrorApp");
const { texto, enteroPositivo } = require("../../utils/validadores");
const { leerFiltroEstados } = require("./validaciones");
const { urlFotoMascota } = require("../../utils/archivos");

async function listar(req, res) {
  const tipoId = req.query.tipoId ? enteroPositivo(req.query.tipoId) : null;
  if (req.query.tipoId && !tipoId) throw new ErrorApp(400, "El filtro de tipo no es válido.");
  const estados = leerFiltroEstados(req.query.estado);
  if (!estados) throw new ErrorApp(400, "El filtro de estado no es válido.");
  const busqueda = texto(req.query.q).slice(0, 60);
  res.json(await servicio.listar({ tipoId, busqueda, estados }));
}

async function obtener(req, res) {
  res.json(await servicio.obtener(req.params.id));
}

async function estadisticas(req, res) {
  res.json(await servicio.estadisticas());
}

function urlDeLaSubida(req) {
  return req.file ? urlFotoMascota(req.file.filename) : null;
}

async function crear(req, res) {
  res.status(201).json(await servicio.crear({ ...req.body, fotoUrl: urlDeLaSubida(req) }));
}

async function actualizar(req, res) {
  res.json(await servicio.actualizar(req.params.id, { ...req.body, nuevaFotoUrl: urlDeLaSubida(req) }));
}

module.exports = { listar, obtener, estadisticas, crear, actualizar };
