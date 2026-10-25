const esPrivado = document.body.dataset.privado === "true";

if (!esPrivado || requiereSesion()) {
  renderizarBarra("catalogo");

  const buscador = document.getElementById("search");
  const contenedorFiltros = document.getElementById("filtros");
  const grilla = document.getElementById("petGrid");
  let tipoActual = null;
  let consultaEnCurso = 0;
  let temporizador;

  function tarjeta(mascota) {
    return `
      <a class="pet-card" href="detalle.html?id=${mascota.id}">
        <div class="pet-photo">${fotoMascota(mascota)}</div>
        <div class="pet-info">
          <div class="name">${escaparHtml(mascota.nombre)}</div>
          <div class="age">${escaparHtml(mascota.edad)} · ${escaparHtml(mascota.tipo.nombre)}</div>
          <span class="badge ${claseEstado(mascota.estado)}" style="margin-top:8px;">${escaparHtml(mascota.estado)}</span>
        </div>
      </a>
    `;
  }

  async function cargarMascotas() {
    const numero = ++consultaEnCurso;
    const parametros = new URLSearchParams();
    const busqueda = buscador.value.trim();
    if (busqueda) parametros.set("q", busqueda);
    if (tipoActual) parametros.set("tipoId", tipoActual);
    try {
      const mascotas = await api.get(`/mascotas?${parametros}`);
      if (numero !== consultaEnCurso) return;
      grilla.innerHTML = mascotas.length
        ? mascotas.map(tarjeta).join("")
        : '<div class="empty-state">No se encontraron mascotas con ese criterio.</div>';
    } catch (error) {
      grilla.innerHTML = `<div class="empty-state">${escaparHtml(error.message)}</div>`;
    }
  }

  function seleccionarFiltro(chip) {
    contenedorFiltros.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    tipoActual = chip.dataset.tipo ? Number(chip.dataset.tipo) : null;
    cargarMascotas();
  }

  async function cargarFiltros() {
    let tipos = [];
    try {
      tipos = await api.get("/tipos-mascota?activos=1&conMascotas=1");
    } catch {
      tipos = [];
    }
    contenedorFiltros.innerHTML = '<div class="filter-chip active" data-tipo="">Todos</div>'
      + tipos.map((t) => `<div class="filter-chip" data-tipo="${t.id}">${escaparHtml(t.icono)} ${escaparHtml(t.nombre)}</div>`).join("");
    contenedorFiltros.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => seleccionarFiltro(chip));
    });
  }

  buscador.addEventListener("input", () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(cargarMascotas, 250);
  });

  cargarFiltros();
  cargarMascotas();
}
