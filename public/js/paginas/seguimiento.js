/* global api, escaparHtml, fechaLarga, formatearFecha, horaCorta, iconoSvg, mostrarAlerta, numeroSolicitud, parametroId, renderizarBarra, requiereSesion */

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

const TAMANO_MAXIMO = 2 * 1024 * 1024;

function estadoVisual(control) {
  if (control.estado === "Pendiente") return control.habilitado ? ["Pendiente", "orange"] : ["Próximamente", "gray"];
  if (control.estado === "Enviado") return ["En revisión", "teal"];
  return [control.estado, control.estado === "Todo bien" ? "green" : "orange"];
}

function cuerpoControl(control) {
  const comentario = control.comentarioAdmin
    ? `<p class="comentario-control"><strong>Comentario del refugio:</strong> ${escaparHtml(control.comentarioAdmin)}</p>`
    : "";
  const foto = control.fotoUrl ? `<img src="${escaparHtml(control.fotoUrl)}" alt="Foto del control ${control.numero}" class="miniatura-control" loading="lazy">` : "";
  if (control.estado === "Todo bien") return `${foto}${comentario}`;
  if (control.estado === "Requiere atención") return `${comentario}${foto}`;
  if (control.estado === "Enviado") return `${foto}<p class="subtitle">Recibimos tu foto. El refugio la revisará pronto.</p>`;
  if (!control.habilitado) return '<p class="subtitle">Podrás subir la foto cuando llegue la fecha del control.</p>';
  return `
    <div id="alerta-${control.id}"></div>
    <label for="foto-${control.id}">Foto de tu mascota (JPG, PNG o WEBP, máximo 2 MB)</label>
    <input type="file" id="foto-${control.id}" accept="image/jpeg,image/png,image/webp" data-control="${control.id}">
    <div id="vista-${control.id}"></div>
    <button type="button" data-enviar="${control.id}" disabled style="margin-top:8px;">${iconoSvg("camara")} Subir foto</button>`;
}

function seccionSeguimientos(controles) {
  if (!controles.length) return "";
  return `
    <section class="seccion-controles" id="seguimientos" aria-label="Seguimiento de tu adopción">
      <h2>Seguimiento de tu adopción</h2>
      <p class="subtitle">En cada control, sube una foto de tu mascota para que el refugio sepa cómo está.</p>
      ${controles.map((control) => {
        const [etiqueta, color] = estadoVisual(control);
        return `
          <article class="control control-${color}">
            <div class="row-flex">
              <strong>Control ${control.numero} · ${escaparHtml(fechaLarga(control.fechaProgramada))}</strong>
              <span class="badge ${color}">${escaparHtml(etiqueta)}</span>
            </div>
            ${cuerpoControl(control)}
          </article>`;
      }).join("")}
    </section>`;
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
      const controles = solicitud.estado === "Aprobada" ? await api.get(`/solicitudes/${id}/seguimientos`) : [];
      contenido.innerHTML = `
        <div style="background:var(--orange-light); padding:14px 16px; border-radius:8px; margin-bottom:6px;">
          <div style="font-size:0.85rem; color:var(--orange-text);">Solicitud ${numeroSolicitud(solicitud.id)}</div>
          <div style="font-weight:bold; font-size:1.1rem; color:var(--orange-text);">${iconoSvg("huella")} ${escaparHtml(solicitud.mascota.nombre)}</div>
        </div>
        ${lineaDeTiempo(solicitud)}
        <p style="color:#555; margin-top:6px;">${escaparHtml(mensajeDeEstado(solicitud))}</p>
        ${tarjetaEntrevista(solicitud.entrevista)}
        ${seccionSeguimientos(controles)}
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

  contenido.addEventListener("change", (evento) => {
    const campo = evento.target.closest("input[type=file][data-control]");
    if (!campo) return;
    const vista = document.getElementById(`vista-${campo.dataset.control}`);
    const boton = contenido.querySelector(`[data-enviar="${campo.dataset.control}"]`);
    const archivo = campo.files[0];
    vista.innerHTML = "";
    boton.disabled = !archivo;
    if (!archivo) return;
    if (archivo.size > TAMANO_MAXIMO) {
      vista.innerHTML = '<div class="alert error">La foto no puede superar 2 MB.</div>';
      boton.disabled = true;
      return;
    }
    const lector = new FileReader();
    lector.addEventListener("load", () => {
      vista.innerHTML = `<img src="${escaparHtml(String(lector.result))}" alt="Vista previa de la foto" class="miniatura-control">`;
    });
    lector.readAsDataURL(archivo);
  });

  contenido.addEventListener("click", async (evento) => {
    const boton = evento.target.closest("[data-enviar]");
    if (!boton) return;
    const id = boton.dataset.enviar;
    const campo = contenido.querySelector(`input[data-control="${id}"]`);
    const alerta = document.getElementById(`alerta-${id}`);
    if (!campo.files[0]) return;
    const datos = new FormData();
    datos.append("foto", campo.files[0]);
    boton.disabled = true;
    try {
      await api.post(`/seguimientos/${id}/foto`, datos);
      await cargar();
    } catch (error) {
      mostrarAlerta(alerta, error.message);
      boton.disabled = false;
    }
  });

  void cargar();
}

if (requiereSesion("adoptante")) iniciarPagina();
