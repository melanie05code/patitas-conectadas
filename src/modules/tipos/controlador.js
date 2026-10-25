const servicio = require("./servicio");
const ErrorApp = require("../../utils/ErrorApp");
const { leerFiltroEstados } = require("../mascotas/validaciones");

async function listar(req, res) {
  const estados = leerFiltroEstados(req.query.estado);
  if (!estados) throw new ErrorApp(400, "El filtro de estado no es válido.");
  res.json(
    await servicio.listar({
      soloActivos: req.query.activos === "1",
      soloConMascotas: req.query.conMascotas === "1",
      estados,
    })
  );
}

async function crear(req, res) {
  res.status(201).json(await servicio.crear(req.body));
}

async function actualizar(req, res) {
  res.json(await servicio.actualizar(req.params.id, req.body));
}

module.exports = { listar, crear, actualizar };
