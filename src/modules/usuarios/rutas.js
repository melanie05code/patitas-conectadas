const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const controlador = require("./controlador");
const validar = require("../../middlewares/validar");
const { requiereAuth } = require("../../middlewares/autenticacion");
const { validarRegistro, validarLogin } = require("./validaciones");

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiados intentos fallidos de inicio de sesión. Intenta de nuevo en 15 minutos." },
});

const rutas = Router();

rutas.post("/registro", validar(validarRegistro), controlador.registrar);
rutas.post("/login", limiteLogin, validar(validarLogin), controlador.iniciarSesion);
rutas.get("/perfil", requiereAuth, controlador.perfil);

module.exports = rutas;
