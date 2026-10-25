if (requiereSesion("adoptante")) {
  renderizarBarra("catalogo");

  const formulario = document.getElementById("reqForm");
  const alerta = document.getElementById("alertBox");
  const banner = document.getElementById("petBanner");
  const boton = formulario.querySelector("button[type=submit]");
  const mascotaId = parametroId();
  const PATRON_TELEFONO = /^[0-9]{4}-[0-9]{4}$/;

  function bloquearFormulario(mensaje) {
    mostrarAlerta(alerta, mensaje);
    formulario.querySelectorAll("input, textarea, button").forEach((campo) => { campo.disabled = true; });
  }

  async function cargarMascota() {
    if (!mascotaId) {
      bloquearFormulario("No se indicó la mascota. Vuelve al catálogo y elige una.");
      return;
    }
    try {
      const mascota = await api.get(`/mascotas/${mascotaId}`);
      banner.innerHTML = `
        <div class="row-flex" style="background:var(--orange-light); padding:12px 16px; border-radius:8px; margin-bottom:6px;">
          <div class="avatar" style="background:#F4D9A8; color:var(--orange-text);">${iconoMascota(mascota)}</div>
          <div style="flex:1; font-weight:bold; color:var(--orange-text);">Adoptando a: ${escaparHtml(mascota.nombre)}</div>
        </div>
      `;
      if (mascota.estado !== "Disponible") bloquearFormulario(`${mascota.nombre} ya no está disponible para adopción.`);
    } catch (error) {
      bloquearFormulario(error.message);
    }
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    alerta.innerHTML = "";
    const datos = {
      mascotaId,
      telefono: document.getElementById("phone").value.trim(),
      direccion: document.getElementById("address").value.trim(),
      motivo: document.getElementById("reason").value.trim(),
    };
    if (!PATRON_TELEFONO.test(datos.telefono)) {
      mostrarAlerta(alerta, "El teléfono debe tener el formato 8888-1234.");
      return;
    }
    boton.disabled = true;
    try {
      await api.post("/solicitudes", datos);
      window.location.href = "mis-solicitudes.html?enviada=1";
    } catch (error) {
      mostrarAlerta(alerta, error.message);
      boton.disabled = false;
    }
  });

  cargarMascota();
}
