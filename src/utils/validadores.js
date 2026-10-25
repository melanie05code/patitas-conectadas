const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PATRON_TELEFONO = /^[0-9]{4}-[0-9]{4}$/;

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function esEmail(valor) {
  return PATRON_EMAIL.test(valor);
}

function esTelefono(valor) {
  return PATRON_TELEFONO.test(valor);
}

function enteroPositivo(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

module.exports = { texto, esEmail, esTelefono, enteroPositivo };
