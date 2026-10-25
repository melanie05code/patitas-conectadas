const { Router } = require("express");
const controlador = require("./controlador");
const validar = require("../../middlewares/validar");
const validarId = require("../../middlewares/validarId");
const { requiereAuth, requiereRol } = require("../../middlewares/autenticacion");
const { subirFotoMascota } = require("../../middlewares/subida");
const { validarCreacion, validarEdicion } = require("./validaciones");

const rutas = Router();

rutas.get("/", controlador.listar);
rutas.get("/estadisticas", controlador.estadisticas);
rutas.get("/:id", validarId, controlador.obtener);
rutas.post("/", requiereAuth, requiereRol("admin"), subirFotoMascota, validar(validarCreacion), controlador.crear);
rutas.put("/:id", requiereAuth, requiereRol("admin"), validarId, subirFotoMascota, validar(validarEdicion), controlador.actualizar);

module.exports = rutas;
