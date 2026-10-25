const ErrorApp = require("../utils/ErrorApp");
const { verificarToken } = require("../utils/token");

function requiereAuth(req, res, next) {
  const [esquema, token] = (req.get("Authorization") || "").split(" ");
  if (esquema !== "Bearer" || !token) {
    throw new ErrorApp(401, "Debes iniciar sesión para continuar.");
  }
  try {
    req.usuario = verificarToken(token);
  } catch {
    throw new ErrorApp(401, "Tu sesión expiró o no es válida. Inicia sesión de nuevo.");
  }
  next();
}

function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      throw new ErrorApp(403, "No tienes permiso para realizar esta acción.");
    }
    next();
  };
}

module.exports = { requiereAuth, requiereRol };
