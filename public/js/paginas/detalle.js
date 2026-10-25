renderizarBarra("catalogo");

const usuario = sesion.obtener();
const urlCatalogo = usuario ? "catalogo.html" : "catalogo-publico.html";
const tarjeta = document.getElementById("detailCard");

function botonDeAccion(mascota) {
  if (mascota.estado === "Adoptada") {
    return '<div class="alert success" style="margin-top:20px;">🏡 Esta mascota ya encontró un hogar.</div>';
  }
  if (mascota.estado !== "Disponible") {
    return '<button class="full" disabled style="background:#ccc;">En proceso de adopción</button>';
  }
  if (!usuario) {
    return '<a class="btn full" href="login.html" style="margin-top:20px; display:block;">Inicia sesión para solicitar la adopción</a>';
  }
  if (usuario.rol !== "adoptante") return "";
  return `<a class="btn full" href="solicitar.html?id=${mascota.id}" style="margin-top:20px; display:block;">🐾 Solicitar Adopción</a>`;
}

async function cargarDetalle() {
  const id = parametroId();
  try {
    if (!id) throw new Error("Mascota no encontrada.");
    const mascota = await api.get(`/mascotas/${id}`);
    document.title = `${mascota.nombre} — Patitas Conectadas`;
    tarjeta.innerHTML = `
      <div class="detail-photo ${mascota.fotoUrl ? "con-foto" : ""}">
        ${fotoMascota(mascota)}
        <span class="badge ${claseEstado(mascota.estado)}">${escaparHtml(mascota.estado)}</span>
      </div>
      <h1>${escaparHtml(mascota.nombre)}</h1>
      <p class="subtitle">${escaparHtml(mascota.tipo.nombre)} · ${escaparHtml(mascota.raza)} · ${escaparHtml(mascota.edad)} · ${escaparHtml(mascota.sexo)}</p>
      <h2 style="margin-top:10px;">Sobre mí</h2>
      <p style="color:#555; line-height:1.5;">${escaparHtml(mascota.descripcion)}</p>
      ${botonDeAccion(mascota)}
      <a class="link-line" href="${urlCatalogo}" style="display:block; margin-top:14px;">← Volver al catálogo</a>
    `;
  } catch (error) {
    tarjeta.innerHTML = `<div class="empty-state">${escaparHtml(error.message)} <a href="${urlCatalogo}">Volver al catálogo</a></div>`;
  }
}

cargarDetalle();
