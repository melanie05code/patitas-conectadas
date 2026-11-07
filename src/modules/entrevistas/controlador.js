const servicio = require("./servicio");

async function disponibilidad(req, res) {
  res.json(await servicio.disponibilidad(req.query.fecha));
}

async function agenda(req, res) {
  res.json(await servicio.agenda(req.query.desde));
}

module.exports = { disponibilidad, agenda };
