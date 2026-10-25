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
      + enlaceBarra("notificaciones.html", "Notificaciones", "notificaciones", activa);
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
}

function mostrarAlerta(contenedor, mensaje, tipo = "error") {
  contenedor.innerHTML = `<div class="alert ${tipo}" role="alert">${escaparHtml(mensaje)}</div>`;
}

function claseEstado(estado) {
  const clases = {
    Disponible: "green",
    "En proceso": "orange",
    Adoptada: "gray",
    "En revisión": "orange",
    Aprobada: "green",
    Rechazada: "red",
  };
  return clases[estado] || "gray";
}

function iconoMascota(mascota) {
  return escaparHtml((mascota && mascota.tipo && mascota.tipo.icono) || "🐾");
}

function parametroId(nombre = "id") {
  const valor = Number(new URLSearchParams(window.location.search).get(nombre));
  return Number.isInteger(valor) && valor > 0 ? valor : null;
}
