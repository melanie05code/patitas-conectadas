const { Router } = require("express");
const controlador = require("./controlador");
const validar = require("../../middlewares/validar");
const { requiereAuth, requiereRol } = require("../../middlewares/autenticacion");
const { validarPerfil } = require("./validaciones");

const rutas = Router();
rutas.use(requiereAuth, requiereRol("adoptante"));
rutas.get("/", controlador.obtener);
rutas.put("/", validar(validarPerfil), controlador.guardar);

module.exports = rutas;
