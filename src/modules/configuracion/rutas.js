const { Router } = require("express");
const controlador = require("./controlador");
const validar = require("../../middlewares/validar");
const { requiereAuth, requiereRol } = require("../../middlewares/autenticacion");
const { validarConfiguracion } = require("./validaciones");

const rutas = Router();
rutas.use(requiereAuth, requiereRol("admin"));
rutas.get("/", controlador.obtener);
rutas.put("/", validar(validarConfiguracion), controlador.actualizar);

module.exports = rutas;
