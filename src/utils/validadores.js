const ESPACIO = /\s/;
const PATRON_TELEFONO = /^[0-9]{4}-[0-9]{4}$/;

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function esEmail(valor) {
  if (typeof valor !== "string" || ESPACIO.test(valor)) return false;
  const partes = valor.split("@");
  if (partes.length !== 2) return false;
  const [usuario, dominio] = partes;
  return usuario.length > 0 && dominio.slice(1, -1).includes(".");
}

function esTelefono(valor) {
  return PATRON_TELEFONO.test(valor);
}

function enteroPositivo(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

module.exports = { texto, esEmail, esTelefono, enteroPositivo };
