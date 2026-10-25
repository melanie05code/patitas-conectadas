const servicio = require("./servicio");

async function registrar(req, res) {
  res.status(201).json(await servicio.registrar(req.body));
}

async function iniciarSesion(req, res) {
  res.json(await servicio.iniciarSesion(req.body));
}

async function perfil(req, res) {
  res.json({ usuario: await servicio.obtenerPerfil(req.usuario.id) });
}

module.exports = { registrar, iniciarSesion, perfil };
