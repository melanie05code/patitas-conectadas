/* global api, escaparHtml, fechaLarga, formatearFecha, horaCorta, iconoSvg, numeroSolicitud, parametroId, renderizarBarra, requiereSesion */

const ETAPAS = ["Solicitada", "Entrevista programada", "Entrevistada", "Aprobada"];

function fechasDeEtapas(solicitud) {
  const entrevista = solicitud.entrevista || {};
  return {
    Solicitada: solicitud.fecha,
    "Entrevista programada": entrevista.creadoEn,
    Entrevistada: entrevista.realizadaEn,
    Aprobada: solicitud.estado === "Aprobada" ? solicitud.respondidaEn : null,
    Rechazada: solicitud.estado === "Rechazada" ? solicitud.respondidaEn : null,
  };
}

function lineaDeTiempo(solicitud) {
  const rechazada = solicitud.estado === "Rechazada";
  const fechas = fechasDeEtapas(solicitud);
  const alcanzada = ETAPAS.indexOf(solicitud.estado);
  const etapas = [...ETAPAS.slice(0, 3), rechazada ? "Rechazada" : "Aprobada"];
  const claseDe = (etapa, i) => {
    if (etapa === "Rechazada") return ["rechazada", "equis"];
    if (rechazada) return fechas[etapa] ? ["completada", "check"] : ["pendiente", "circulo"];
    if (i < alcanzada || (etapa === solicitud.estado && etapa === "Aprobada")) return ["completada", "check"];
    if (i === alcanzada) return ["actual", "punto"];
    return ["pendiente", "circulo"];
  };
  return `<ol class="linea-tiempo" aria-label="Etapas de la solicitud">${etapas.map((etapa, i) => {
    const [clase, icono] = claseDe(etapa, i);
    const fecha = fechas[etapa];
    return `
      <li class="etapa ${clase}" ${clase === "actual" ? 'aria-current="step"' : ""}>
        <div class="marca">${iconoSvg(icono)}</div>
        <div>
          <div class="nombre-etapa">${escaparHtml(etapa)}</div>
          <div class="fecha-etapa">${fecha ? escaparHtml(formatearFecha(fecha)) : ""}</div>
        </div>
      </li>`;
  }).join("")}</ol>`;
}

function tarjetaEntrevista(entrevista) {
  if (!entrevista || entrevista.canceladaEn) return "";
  const realizada = Boolean(entrevista.realizadaEn);
  return `
    <section class="tarjeta-entrevista" aria-label="Tu entrevista">
      <h2>${realizada ? "Tu entrevista (realizada)" : "Tu entrevista"}</h2>
      <div class="dato-entrevista">${iconoSvg("calendario")}<div><strong>Día</strong>${escaparHtml(fechaLarga(entrevista.fechaHora))}</div></div>
      <div class="dato-entrevista">${iconoSvg("reloj")}<div><strong>Hora</strong>${escaparHtml(horaCorta(entrevista.fechaHora))}</div></div>
      <div class="dato-entrevista">${iconoSvg("ubicacion")}<div><strong>Lugar</strong>${escaparHtml(entrevista.lugar)}</div></div>
      ${realizada ? "" : '<p style="margin-top:10px; font-size:0.85rem; color:#555;">Llega 10 minutos antes y lleva tu cédula de identidad.</p>'}
    </section>`;
}

function mensajeDeEstado(solicitud) {
  const mensajes = {
    Solicitada: "El refugio está revisando tu solicitud y tu perfil. Te avisaremos cuando agende tu entrevista.",
    "Entrevista programada": "Tu entrevista está agendada. Revisa el día, la hora y el lugar.",
    Entrevistada: "Ya realizaste la entrevista. El refugio te dará una respuesta pronto.",
    Aprobada: "Tu adopción fue aprobada. Gracias por darle un hogar.",
    Rechazada: "Tu solicitud no fue aprobada. Puedes solicitar otra mascota del catálogo.",
  };
  return mensajes[solicitud.estado] || "";
}

function dato(titulo, valor) {
  return `
    <div style="margin-top:10px;">
      <div style="font-size:0.85rem; font-weight:bold; color:#555;">${titulo}</div>
      <div style="overflow-wrap:anywhere;">${escaparHtml(valor)}</div>
    </div>`;
}

function iniciarPagina() {
  renderizarBarra("solicitudes");
  const contenido = document.getElementById("content");

  async function cargar() {
    const id = parametroId();
    try {
      if (!id) throw new Error("Solicitud no encontrada.");
      const solicitud = await api.get(`/solicitudes/${id}`);
      contenido.innerHTML = `
        <div style="background:var(--orange-light); padding:14px 16px; border-radius:8px; margin-bottom:6px;">
          <div style="font-size:0.85rem; color:var(--orange-text);">Solicitud ${numeroSolicitud(solicitud.id)}</div>
          <div style="font-weight:bold; font-size:1.1rem; color:var(--orange-text);">${iconoSvg("huella")} ${escaparHtml(solicitud.mascota.nombre)}</div>
        </div>
        ${lineaDeTiempo(solicitud)}
        <p style="color:#555; margin-top:6px;">${escaparHtml(mensajeDeEstado(solicitud))}</p>
        ${tarjetaEntrevista(solicitud.entrevista)}
        <div class="card" style="background:var(--gray-light); box-shadow:none; margin-top:16px;">
          ${dato("Fecha de la solicitud", formatearFecha(solicitud.fecha, true))}
          ${solicitud.respondidaEn ? dato("Fecha de la respuesta", formatearFecha(solicitud.respondidaEn, true)) : ""}
          ${dato("Teléfono de contacto", solicitud.telefono)}
          ${dato("Dirección", solicitud.direccion)}
          ${dato("Motivo", solicitud.motivo)}
        </div>
        <a class="link-line" href="mis-solicitudes.html" style="display:block; margin-top:14px;">${iconoSvg("flecha")} Volver a mis solicitudes</a>
      `;
    } catch (error) {
      contenido.innerHTML = `<div class="empty-state">${escaparHtml(error.message)} <a href="mis-solicitudes.html">Volver a mis solicitudes</a></div>`;
    }
  }

  void cargar();
}

if (requiereSesion("adoptante")) iniciarPagina();
