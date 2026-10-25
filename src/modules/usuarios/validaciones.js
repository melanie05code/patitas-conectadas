const { texto, esEmail } = require("../../utils/validadores");

const MAX_BYTES_BCRYPT = 72;

function validarRegistro(cuerpo) {
  const errores = [];
  const nombre = texto(cuerpo.nombre);
  const email = texto(cuerpo.email).toLowerCase();
  const password = typeof cuerpo.password === "string" ? cuerpo.password : "";

  if (nombre.length < 2) errores.push("El nombre debe tener al menos 2 caracteres.");
  else if (nombre.length > 100) errores.push("El nombre no puede superar 100 caracteres.");

  if (!email) errores.push("El correo electrónico es obligatorio.");
  else if (!esEmail(email) || email.length > 150) errores.push("El correo electrónico no tiene un formato válido.");

  if (password.length < 8) errores.push("La contraseña debe tener al menos 8 caracteres.");
  else if (Buffer.byteLength(password, "utf8") > MAX_BYTES_BCRYPT) errores.push("La contraseña es demasiado larga.");

  if (cuerpo.confirmacion !== undefined && cuerpo.confirmacion !== password) {
    errores.push("Las contraseñas no coinciden.");
  }

  return { errores, datos: { nombre, email, password } };
}

function validarLogin(cuerpo) {
  const email = texto(cuerpo.email).toLowerCase();
  const password = typeof cuerpo.password === "string" ? cuerpo.password : "";
  const errores = !email || !password ? ["Ingresa tu correo y tu contraseña."] : [];
  return { errores, datos: { email, password } };
}

module.exports = { validarRegistro, validarLogin };
