const { Router } = require("express");
const controlador = require("./controlador");
const validar = require("../../middlewares/validar");
const validarId = require("../../middlewares/validarId");
const { requiereAuth, requiereRol } = require("../../middlewares/autenticacion");
const { validarSolicitud, validarRespuesta } = require("./validaciones");

const rutas = Router();
rutas.use(requiereAuth);
rutas.post("/", requiereRol("adoptante"), validar(validarSolicitud), controlador.crear);
rutas.get("/mias", controlador.listarPropias);
rutas.get("/:id", validarId, controlador.obtener);

const rutasAdmin = Router();
rutasAdmin.use(requiereAuth, requiereRol("admin"));
rutasAdmin.get("/", controlador.listar);
rutasAdmin.patch("/:id", validarId, validar(validarRespuesta), controlador.responder);

module.exports = { rutas, rutasAdmin };
