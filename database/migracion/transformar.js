const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ESTADOS_MASCOTA = ["Disponible", "En proceso", "Adoptada"];
const ESTADOS_SOLICITUD = ["En revisión", "Aprobada", "Rechazada"];
const UNIDADES = {
  minuto: 60 * 1000,
  hora: 60 * 60 * 1000,
  dia: 24 * 60 * 60 * 1000,
  semana: 7 * 24 * 60 * 60 * 1000,
};

function sinAcentos(texto) {
  return String(texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

function normalizarEmail(valor) {
  const email = String(valor ?? "").trim().toLowerCase();
  return PATRON_EMAIL.test(email) ? email : null;
}

function normalizarTelefono(valor) {
  let digitos = String(valor ?? "").replace(/\D/g, "");
  if (digitos.length === 11 && digitos.startsWith("505")) digitos = digitos.slice(3);
  return digitos.length === 8 ? `${digitos.slice(0, 4)}-${digitos.slice(4)}` : null;
}

function normalizarEstado(valor, permitidos) {
  const buscado = sinAcentos(valor);
  return permitidos.find((estado) => sinAcentos(estado) === buscado) || null;
}

function aDatetime(fecha) {
  const dos = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())} ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}:${dos(fecha.getSeconds())}`;
}

function convertirFecha(valor, referencia) {
  const texto = sinAcentos(valor);
  const absoluta = /^(\d{4})-(\d{2})-(\d{2})(?:[ t](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(texto);
  if (absoluta) {
    const [, anio, mes, dia, hora = 0, minuto = 0, segundo = 0] = absoluta.map((v) => (v === undefined ? undefined : Number(v)));
    const fecha = new Date(anio, mes - 1, dia, hora, minuto, segundo);
    if (!Number.isNaN(fecha.getTime()) && fecha.getMonth() === mes - 1) return { fecha: aDatetime(fecha), exacta: true };
  }
  if (texto === "hace un momento" || texto === "hoy" || texto === "ahora") {
    return { fecha: aDatetime(referencia), exacta: false };
  }
  if (texto === "ayer") return { fecha: aDatetime(new Date(referencia.getTime() - UNIDADES.dia)), exacta: false };
  const relativa = /^hace (\d+|un|una) (minuto|hora|dia|semana)s?$/.exec(texto);
  if (relativa) {
    const cantidad = /^\d+$/.test(relativa[1]) ? Number(relativa[1]) : 1;
    return { fecha: aDatetime(new Date(referencia.getTime() - cantidad * UNIDADES[relativa[2]])), exacta: false };
  }
  return null;
}

function esHashBcrypt(valor) {
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(String(valor ?? ""));
}

function leerColeccion(datos, clave) {
  const valor = datos[clave];
  if (valor === undefined || valor === null) return [];
  const lista = typeof valor === "string" ? JSON.parse(valor) : valor;
  if (!Array.isArray(lista)) throw new Error(`La clave ${clave} del respaldo no contiene una lista.`);
  return lista;
}

module.exports = {
  ESTADOS_MASCOTA,
  ESTADOS_SOLICITUD,
  sinAcentos,
  normalizarEmail,
  normalizarTelefono,
  normalizarEstado,
  aDatetime,
  convertirFecha,
  esHashBcrypt,
  leerColeccion,
};
