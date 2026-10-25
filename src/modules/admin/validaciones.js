const { texto } = require("../../utils/validadores");

function campoTexto(cuerpo, campo, etiqueta, minimo, maximo, errores) {
  const valor = texto(cuerpo[campo]);
  if (valor.length < minimo) errores.push(`Completa el campo ${etiqueta}.`);
  else if (valor.length > maximo) errores.push(`El campo ${etiqueta} no puede superar ${maximo} caracteres.`);
  return valor;
}

function validarDiagnostico(consulta) {
  const errores = [];
  const host = campoTexto(consulta, "host", "host", 1, 253, errores);
  return { errores, datos: { host } };
}

module.exports = { validarDiagnostico };
