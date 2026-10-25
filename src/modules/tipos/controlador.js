const servicio = require("./servicio");

async function listar(req, res) {
  res.json(
    await servicio.listar({
      soloActivos: req.query.activos === "1",
      soloConMascotas: req.query.conMascotas === "1",
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
