const jwt = require("jsonwebtoken");
const { jwt: configuracion } = require("../config/entorno");

function generarToken(usuario) {
  return jwt.sign({ rol: usuario.rol }, configuracion.secreto, {
    subject: String(usuario.id),
    expiresIn: configuracion.expira,
    algorithm: "HS256",
  });
}

function verificarToken(token) {
  const carga = jwt.verify(token, configuracion.secreto, { algorithms: ["HS256"] });
  return { id: Number(carga.sub), rol: carga.rol };
}

module.exports = { generarToken, verificarToken };
