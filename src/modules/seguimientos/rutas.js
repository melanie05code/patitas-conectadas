const { Router } = require("express");
const controlador = require("./controlador");
const validar = require("../../middlewares/validar");
const validarId = require("../../middlewares/validarId");
const { requiereAuth, requiereRol } = require("../../middlewares/autenticacion");
const { subirFotoMascota } = require("../../middlewares/subida");
const { validarRevision } = require("./validaciones");

const rutas = Router();
rutas.post("/:id/foto", requiereAuth, requiereRol("adoptante"), validarId, subirFotoMascota, controlador.subirFoto);

const rutasAdmin = Router();
rutasAdmin.use(requiereAuth, requiereRol("admin"));
rutasAdmin.get("/", controlador.listarParaAdmin);
rutasAdmin.patch("/:id", validarId, validar(validarRevision), controlador.revisar);

module.exports = { rutas, rutasAdmin };
