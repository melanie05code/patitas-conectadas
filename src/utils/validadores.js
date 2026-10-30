const ESPACIO = /\s/;
const PATRON_TELEFONO = /^[0-9]{4}-[0-9]{4}$/;
const CARACTERES_HOST = /^[a-z0-9-]+$/i;
const LARGO_MAXIMO_HOST = 253;
const LARGO_MAXIMO_ETIQUETA = 63;

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

function esEtiquetaHost(etiqueta) {
  return (
    etiqueta.length <= LARGO_MAXIMO_ETIQUETA &&
    CARACTERES_HOST.test(etiqueta) &&
    !etiqueta.startsWith("-") &&
    !etiqueta.endsWith("-")
  );
}

function esHost(valor) {
  if (typeof valor !== "string" || valor.length === 0 || valor.length > LARGO_MAXIMO_HOST) return false;
  return valor.split(".").every(esEtiquetaHost);
}

function enteroPositivo(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

module.exports = { texto, esEmail, esTelefono, esHost, enteroPositivo };
