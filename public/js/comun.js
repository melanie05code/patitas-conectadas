/* global api */
/* exported redirigirSiHaySesion, requiereSesion, renderizarBarra, mostrarAlerta, claseEstado, parametroId, numeroSolicitud, fechaRelativa, fotoMascota, iconoSvg, iconoMascota, fechaLarga, horaCorta, leerFechaLocal, MESES_LARGOS */

const CLAVE_SESION = "pc_sesion";

function leerExpiracion(token) {
  try {
    const carga = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return carga.exp ? carga.exp * 1000 : null;
  } catch {
    return null;
  }
}

const sesion = {
  obtener() {
    let datos = null;
    try {
      datos = JSON.parse(sessionStorage.getItem(CLAVE_SESION));
    } catch {
      datos = null;
    }
    if (datos && datos.expira && Date.now() >= datos.expira) {
      sesion.cerrar();
      return null;
    }
    return datos;
  },
  guardar({ token, usuario }) {
    const datos = { token, id: usuario.id, nombre: usuario.nombre, rol: usuario.rol, expira: leerExpiracion(token) };
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(datos));
  },
  cerrar() {
    sessionStorage.removeItem(CLAVE_SESION);
  },
};

function paginaInicio(usuario) {
  return usuario.rol === "admin" ? "admin.html" : "catalogo.html";
}

function requiereSesion(rol) {
  const actual = sesion.obtener();
  if (!actual) {
    window.location.replace("login.html");
    return null;
  }
  if (rol && actual.rol !== rol) {
    window.location.replace(paginaInicio(actual));
    return null;
  }
  return actual;
}

function redirigirSiHaySesion() {
  const actual = sesion.obtener();
  if (actual) window.location.replace(paginaInicio(actual));
  return Boolean(actual);
}

function cerrarSesion() {
  sesion.cerrar();
  window.location.href = "login.html";
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function enlaceBarra(href, texto, clave, activa) {
  return `<a href="${href}" class="${clave === activa ? "active" : ""}">${texto}</a>`;
}

function renderizarBarra(activa) {
  const barra = document.getElementById("topbar");
  if (!barra) return;
  const actual = sesion.obtener();
  let enlaces;
  if (!actual) {
    enlaces = enlaceBarra("catalogo-publico.html", "Mascotas", "catalogo", activa)
      + '<a href="login.html">Iniciar sesión</a>'
      + '<a href="registro.html">Registrarse</a>';
  } else if (actual.rol === "admin") {
    enlaces = enlaceBarra("admin.html", "Panel Admin", "admin", activa)
      + enlaceBarra("catalogo.html", "Mascotas", "catalogo", activa);
  } else {
    enlaces = enlaceBarra("catalogo.html", "Mascotas", "catalogo", activa)
      + enlaceBarra("mis-solicitudes.html", "Mis Solicitudes", "solicitudes", activa)
      + enlaceBarra("perfil.html", "Mi perfil", "perfil", activa)
      + enlaceBarra("notificaciones.html", 'Notificaciones<span class="contador hidden" id="contadorNotificaciones"></span>', "notificaciones", activa);
  }
  if (actual) {
    enlaces += `<a href="login.html" id="btnSalir">Salir (${escaparHtml(actual.nombre.split(" ")[0])})</a>`;
  }
  barra.innerHTML = `
    <a class="brand" href="${actual ? paginaInicio(actual) : "index.html"}"><span class="paw">🐾</span> Patitas Conectadas</a>
    <nav>${enlaces}</nav>
  `;
  const salir = document.getElementById("btnSalir");
  if (salir) {
    salir.addEventListener("click", (evento) => {
      evento.preventDefault();
      cerrarSesion();
    });
  }
  if (actual && actual.rol === "adoptante") void actualizarContadorNotificaciones();
}

async function actualizarContadorNotificaciones() {
  const contador = document.getElementById("contadorNotificaciones");
  if (!contador || typeof api === "undefined") return;
  try {
    const { total } = await api.get("/notificaciones/no-leidas/total");
    contador.textContent = total > 9 ? "9+" : String(total);
    contador.title = `${total} sin leer`;
    contador.classList.toggle("hidden", total === 0);
  } catch {
    contador.classList.add("hidden");
  }
}

function mostrarAlerta(contenedor, mensaje, tipo = "error") {
  contenedor.innerHTML = `<div class="alert ${tipo}" role="alert">${escaparHtml(mensaje)}</div>`;
}

function claseEstado(estado) {
  const clases = {
    Disponible: "green",
    "En proceso": "orange",
    Adoptada: "gray",
    Solicitada: "orange",
    "Entrevista programada": "teal",
    Entrevistada: "teal",
    Pendiente: "orange",
    Enviado: "teal",
    "Todo bien": "green",
    "Requiere atención": "red",
    Aprobada: "green",
    Rechazada: "red",
  };
  return clases[estado] || "gray";
}

const TRAZOS_ICONO = {
  huella: '<circle cx="7" cy="8" r="2"/><circle cx="12" cy="5.5" r="2"/><circle cx="17" cy="8" r="2"/><circle cx="19" cy="13" r="1.8"/><circle cx="5" cy="13" r="1.8"/><path d="M12 11c-3 0-5.5 4-5.5 6.2 0 1.6 1.3 2.3 2.7 2.3 1.2 0 1.8-.6 2.8-.6s1.6.6 2.8.6c1.4 0 2.7-.7 2.7-2.3C17.5 15 15 11 12 11z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  equis: '<path d="M6 6l12 12M18 6L6 18"/>',
  campana: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  casa: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
  ubicacion: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  telefono: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  flecha: '<path d="M15 6l-6 6 6 6"/>',
  reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  calendario: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  camara: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/>',
  alerta: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.2v.1"/>',
  punto: '<circle cx="12" cy="12" r="4.5" fill="currentColor"/>',
  circulo: '<circle cx="12" cy="12" r="6"/>',
};

function iconoSvg(nombre, clase = "icono") {
  const trazos = TRAZOS_ICONO[nombre] || TRAZOS_ICONO.huella;
  return `<svg class="${clase}" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${trazos}</svg>`;
}

function iconoMascota() {
  return iconoSvg("huella", "icono icono-mascota");
}

function parametroId(nombre = "id") {
  const valor = Number(new URLSearchParams(window.location.search).get(nombre));
  return Number.isInteger(valor) && valor > 0 ? valor : null;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatearFecha(valor, conHora = false) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(valor || "");
  if (!partes) return valor || "";
  const [, anio, mes, dia, hora, minuto] = partes;
  const fecha = `${Number(dia)} ${MESES[Number(mes) - 1]} ${anio}`;
  return conHora && hora ? `${fecha}, ${hora}:${minuto}` : fecha;
}

const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function leerFechaLocal(valor) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(valor || "");
  if (!partes) return null;
  const [, anio, mes, dia, hora, minuto] = partes.map(Number);
  return new Date(anio, mes - 1, dia, hora || 0, minuto || 0);
}

function fechaLarga(valor) {
  const fecha = valor instanceof Date ? valor : leerFechaLocal(valor);
  if (!fecha) return valor || "";
  return `${DIAS_SEMANA[fecha.getDay()]} ${fecha.getDate()} de ${MESES_LARGOS[fecha.getMonth()]}`;
}

function horaCorta(valor) {
  const fecha = valor instanceof Date ? valor : leerFechaLocal(valor);
  if (!fecha) return "";
  const horas = fecha.getHours();
  const hora12 = horas % 12 === 0 ? 12 : horas % 12;
  return `${hora12}:${String(fecha.getMinutes()).padStart(2, "0")} ${horas < 12 ? "a. m." : "p. m."}`;
}

function numeroSolicitud(id) {
  return `#${String(id).padStart(3, "0")}`;
}

function fechaRelativa(valor) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(valor || "");
  if (!partes) return valor || "";
  const [, anio, mes, dia, hora, minuto, segundo] = partes.map(Number);
  const fecha = new Date(anio, mes - 1, dia, hora, minuto, segundo || 0);
  const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);
  if (minutos < 1) return "Hace un momento";
  if (minutos < 60) return `Hace ${minutos} minuto${minutos === 1 ? "" : "s"}`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} hora${horas === 1 ? "" : "s"}`;
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const dias = Math.round((inicioHoy - new Date(anio, mes - 1, dia)) / 86400000);
  if (dias <= 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  return formatearFecha(valor);
}

function fotoMascota(mascota) {
  if (!mascota || !mascota.fotoUrl) return iconoMascota();
  return `<img src="${escaparHtml(mascota.fotoUrl)}" alt="Foto de ${escaparHtml(mascota.nombre)}" loading="lazy">`;
}
