const { campoTexto, esHost } = require("../../utils/validadores");

function validarDiagnostico(consulta) {
  const errores = [];
  const host = campoTexto(consulta, "host", "host", 1, 253, errores);
  if (host && !esHost(host)) errores.push("El host solo puede tener letras, números, guiones y puntos.");
  return { errores, datos: { host } };
}

module.exports = { validarDiagnostico };
