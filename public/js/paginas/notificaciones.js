/* global actualizarContadorNotificaciones, api, escaparHtml, fechaRelativa, formatearFecha, mostrarAlerta, renderizarBarra, requiereSesion */

if (requiereSesion("adoptante")) {
  renderizarBarra("notificaciones");

  const lista = document.getElementById("list");
  const alerta = document.getElementById("alertBox");
  const botonTodas = document.getElementById("btnMarcarTodas");

  function tarjeta(notificacion) {
    const enlace = notificacion.solicitudId
      ? `<a href="seguimiento.html?id=${notificacion.solicitudId}" class="link-line" style="font-size:0.82rem;">Ver solicitud</a>`
      : "";
    const boton = notificacion.leida
      ? ""
      : `<button type="button" class="small secondary" data-leer="${notificacion.id}">Marcar como leída</button>`;
    return `
      <div class="notif card ${notificacion.leida ? "" : "no-leida"}">
        <div class="avatar">🔔</div>
        <div class="cuerpo-notif">
          <div class="texto-notif">${escaparHtml(notificacion.texto)}</div>
          <small title="${escaparHtml(formatearFecha(notificacion.creadoEn, true))}">${escaparHtml(fechaRelativa(notificacion.creadoEn))}</small>
          ${enlace}
        </div>
        ${boton}
      </div>
    `;
  }

  async function cargar() {
    try {
      const notificaciones = await api.get("/notificaciones");
      lista.innerHTML = notificaciones.length
        ? notificaciones.map(tarjeta).join("")
        : '<div class="empty-state">No tienes notificaciones todavía.</div>';
      botonTodas.classList.toggle("hidden", !notificaciones.some((n) => !n.leida));
    } catch (error) {
      mostrarAlerta(alerta, error.message);
    }
  }

  lista.addEventListener("click", async (evento) => {
    const boton = evento.target.closest("[data-leer]");
    if (!boton) return;
    boton.disabled = true;
    try {
      await api.patch(`/notificaciones/${boton.dataset.leer}/leida`);
      await Promise.all([cargar(), actualizarContadorNotificaciones()]);
    } catch (error) {
      mostrarAlerta(alerta, error.message);
      boton.disabled = false;
    }
  });

  botonTodas.addEventListener("click", async () => {
    botonTodas.disabled = true;
    try {
      await api.patch("/notificaciones/leidas");
      await Promise.all([cargar(), actualizarContadorNotificaciones()]);
    } catch (error) {
      mostrarAlerta(alerta, error.message);
    } finally {
      botonTodas.disabled = false;
    }
  });

  void cargar();
}
