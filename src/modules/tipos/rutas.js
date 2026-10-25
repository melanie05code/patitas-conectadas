const { Router } = require("express");
const controlador = require("./controlador");
const validar = require("../../middlewares/validar");
const validarId = require("../../middlewares/validarId");
const { requiereAuth, requiereRol } = require("../../middlewares/autenticacion");
const { validarTipo } = require("./validaciones");

const rutas = Router();

rutas.get("/", controlador.listar);
rutas.post("/", requiereAuth, requiereRol("admin"), validar(validarTipo), controlador.crear);
rutas.put("/:id", requiereAuth, requiereRol("admin"), validarId, validar(validarTipo), controlador.actualizar);

module.exports = rutas;
