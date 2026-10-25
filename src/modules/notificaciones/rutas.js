const { Router } = require("express");
const controlador = require("./controlador");
const validarId = require("../../middlewares/validarId");
const { requiereAuth } = require("../../middlewares/autenticacion");

const rutas = Router();
rutas.use(requiereAuth);
rutas.get("/", controlador.listar);
rutas.get("/no-leidas/total", controlador.totalNoLeidas);
rutas.patch("/leidas", controlador.marcarTodasLeidas);
rutas.patch("/:id/leida", validarId, controlador.marcarLeida);

module.exports = rutas;
