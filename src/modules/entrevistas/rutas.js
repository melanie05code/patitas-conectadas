const { Router } = require("express");
const controlador = require("./controlador");
const { requiereAuth, requiereRol } = require("../../middlewares/autenticacion");

const rutas = Router();
rutas.use(requiereAuth, requiereRol("admin"));
rutas.get("/disponibilidad", controlador.disponibilidad);
rutas.get("/", controlador.agenda);

module.exports = rutas;
