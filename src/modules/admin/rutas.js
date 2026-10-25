const { Router } = require("express");
const controlador = require("./controlador");
const { requiereAuth, requiereRol } = require("../../middlewares/autenticacion");

const rutas = Router();
rutas.get("/diagnostico", requiereAuth, requiereRol("admin"), controlador.diagnostico);

module.exports = rutas;
