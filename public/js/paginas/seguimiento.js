/* global api, escaparHtml, formatearFecha, iconoMascota, numeroSolicitud, parametroId, renderizarBarra, requiereSesion */

function iniciarPagina() {
  renderizarBarra("solicitudes");

  const contenido = document.getElementById("content");

  function pasos(estado) {
    const final = estado === "En revisión" ? "Aprobada / Rechazada" : estado;
    const estados = estado === "En revisión" ? ["done", "current", "pending"] : ["done", "done", "current"];
    return ["Solicitada", "En revisión", final].map((etiqueta, i) => {
      const icono = estados[i] === "done" ? "✔" : estados[i] === "current" ? "●" : "○";
      return `<div class="step ${estados[i]}"><div class="dot">${icono}</div><div style="font-weight:bold;">${escaparHtml(etiqueta)}</div></div>`;
    }).join("");
  }

  function dato(titulo, valor) {
    return `
      <div style="margin-top:10px;">
        <div style="font-size:0.85rem; font-weight:bold; color:#555;">${titulo}</div>
        <div style="overflow-wrap:anywhere;">${escaparHtml(valor)}</div>
      </div>
    `;
  }

  async function cargar() {
    const id = parametroId();
    try {
      if (!id) throw new Error("Solicitud no encontrada.");
      const solicitud = await api.get(`/solicitudes/${id}`);
      const respondida = solicitud.estado !== "En revisión";
      contenido.innerHTML = `
        <div style="background:var(--orange-light); padding:14px 16px; border-radius:8px; margin-bottom:18px;">
          <div style="font-size:0.85rem; color:var(--orange-text);">Solicitud ${numeroSolicitud(solicitud.id)}</div>
          <div style="font-weight:bold; font-size:1.1rem; color:var(--orange-text);">${iconoMascota(solicitud.mascota)} ${escaparHtml(solicitud.mascota.nombre)}</div>
        </div>
        <div class="timeline">${pasos(solicitud.estado)}</div>
        <div class="card" style="background:var(--gray-light); box-shadow:none; margin-top:16px;">
          ${dato("Fecha de la solicitud", formatearFecha(solicitud.fecha, true))}
          ${respondida ? dato("Fecha de la respuesta", formatearFecha(solicitud.actualizadoEn, true)) : ""}
          ${dato("Teléfono de contacto", solicitud.telefono)}
          ${dato("Dirección", solicitud.direccion)}
          ${dato("Motivo", solicitud.motivo)}
        </div>
        <a class="link-line" href="mis-solicitudes.html" style="display:block; margin-top:14px;">← Volver a mis solicitudes</a>
      `;
    } catch (error) {
      contenido.innerHTML = `<div class="empty-state">${escaparHtml(error.message)} <a href="mis-solicitudes.html">Volver a mis solicitudes</a></div>`;
    }
  }

  void cargar();
}

if (requiereSesion("adoptante")) iniciarPagina();
