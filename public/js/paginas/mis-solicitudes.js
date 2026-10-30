/* global api, claseEstado, escaparHtml, formatearFecha, fotoMascota, mostrarAlerta, numeroSolicitud, renderizarBarra, requiereSesion */

if (requiereSesion("adoptante")) {
  renderizarBarra("solicitudes");

  const lista = document.getElementById("list");

  if (new URLSearchParams(window.location.search).has("enviada")) {
    mostrarAlerta(document.getElementById("alertBox"), "¡Tu solicitud fue enviada! El refugio la revisará pronto.", "success");
  }

  function tarjeta(solicitud) {
    return `
      <a class="card row-flex" href="seguimiento.html?id=${solicitud.id}" style="text-decoration:none; color:inherit;">
        <div class="avatar">${fotoMascota(solicitud.mascota)}</div>
        <div style="flex:1;">
          <div style="font-weight:bold;">${escaparHtml(solicitud.mascota.nombre)}</div>
          <div style="color:var(--gray); font-size:0.85rem;">Solicitud ${numeroSolicitud(solicitud.id)} · ${escaparHtml(formatearFecha(solicitud.fecha))}</div>
        </div>
        <span class="badge ${claseEstado(solicitud.estado)}">${escaparHtml(solicitud.estado)}</span>
      </a>
    `;
  }

  api.get("/solicitudes/mias")
    .then((solicitudes) => {
      lista.innerHTML = solicitudes.length
        ? solicitudes.map(tarjeta).join("")
        : '<div class="empty-state">Aún no has enviado solicitudes. <a href="catalogo.html">Explora el catálogo</a></div>';
    })
    .catch((error) => {
      lista.innerHTML = `<div class="empty-state">${escaparHtml(error.message)}</div>`;
    });
}
