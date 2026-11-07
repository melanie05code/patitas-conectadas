/* global api, claseEstado, escaparHtml, fechaLarga, formatearFecha, fotoMascota, horaCorta, mostrarAlerta, numeroSolicitud, renderizarBarra, requiereSesion */

function iniciarPagina() {
  renderizarBarra("admin");

  const estado = { tipos: [], mascotas: [], mascotaEditando: null, tipoEditando: null };

  const formMascota = document.getElementById("formMascota");
  const alertaMascotas = document.getElementById("alertaMascotas");
  const campos = {
    nombre: document.getElementById("m_nombre"),
    tipo: document.getElementById("m_tipo"),
    edad: document.getElementById("m_edad"),
    raza: document.getElementById("m_raza"),
    sexo: document.getElementById("m_sexo"),
    estado: document.getElementById("m_estado"),
    descripcion: document.getElementById("m_descripcion"),
    foto: document.getElementById("m_foto"),
    quitarFoto: document.getElementById("m_quitarFoto"),
  };
  const FORMATOS_FOTO = ["image/jpeg", "image/png", "image/webp"];
  const TAMANO_MAXIMO_FOTO = 2 * 1024 * 1024;

  function mostrarVistaPrevia(src, texto) {
    document.getElementById("vistaPrevia").classList.toggle("hidden", !src);
    if (src) document.getElementById("imgVistaPrevia").src = src;
    document.getElementById("textoVistaPrevia").textContent = texto || "";
  }

  campos.foto.addEventListener("change", () => {
    const archivo = campos.foto.files[0];
    const editando = estado.mascotaEditando;
    const restaurar = () => mostrarVistaPrevia(editando && editando.fotoUrl, editando && editando.fotoUrl ? "Foto actual" : "");
    if (!archivo) {
      restaurar();
      return;
    }
    if (!FORMATOS_FOTO.includes(archivo.type) || archivo.size > TAMANO_MAXIMO_FOTO) {
      mostrarAlerta(alertaMascotas, "La foto debe ser JPG, PNG o WEBP y pesar como máximo 2 MB.");
      campos.foto.value = "";
      restaurar();
      return;
    }
    alertaMascotas.innerHTML = "";
    campos.quitarFoto.checked = false;
    const lector = new FileReader();
    lector.addEventListener("load", () => mostrarVistaPrevia(lector.result, `Nueva foto: ${archivo.name}`));
    lector.readAsDataURL(archivo);
  });

  const formTipo = document.getElementById("formTipo");
  const alertaTipos = document.getElementById("alertaTipos");
  const nombreTipo = document.getElementById("t_nombre");

  function opcionesDeTipo(tipoActualId) {
    return estado.tipos
      .filter((t) => t.activo || t.id === tipoActualId)
      .map((t) => `<option value="${t.id}">${escaparHtml(t.nombre)}${t.activo ? "" : " (desactivado)"}</option>`)
      .join("");
  }

  function opcionesDeEstado(estadoActual) {
    const opciones = estadoActual === "En proceso" ? ["En proceso", "Disponible", "Adoptada"] : ["Disponible", "Adoptada"];
    return opciones.map((e) => `<option>${e}</option>`).join("");
  }

  function abrirFormularioMascota(mascota) {
    estado.mascotaEditando = mascota || null;
    alertaMascotas.innerHTML = "";
    formMascota.reset();
    document.getElementById("tituloFormMascota").textContent = mascota ? `Editar: ${mascota.nombre}` : "Nueva mascota";
    campos.tipo.innerHTML = opcionesDeTipo(mascota ? mascota.tipo.id : null);
    document.getElementById("campoEstado").classList.toggle("hidden", !mascota);
    if (mascota) {
      campos.nombre.value = mascota.nombre;
      campos.tipo.value = mascota.tipo.id;
      campos.edad.value = mascota.edad;
      campos.raza.value = mascota.raza;
      campos.sexo.value = mascota.sexo;
      campos.descripcion.value = mascota.descripcion;
      campos.estado.innerHTML = opcionesDeEstado(mascota.estado);
      campos.estado.value = mascota.estado;
    }
    mostrarVistaPrevia(mascota && mascota.fotoUrl, mascota && mascota.fotoUrl ? "Foto actual" : "");
    document.getElementById("campoQuitarFoto").classList.toggle("hidden", !(mascota && mascota.fotoUrl));
    formMascota.classList.remove("hidden");
    document.getElementById("btnNuevaMascota").classList.add("hidden");
    campos.nombre.focus();
  }

  function cerrarFormularioMascota() {
    estado.mascotaEditando = null;
    formMascota.classList.add("hidden");
    document.getElementById("btnNuevaMascota").classList.remove("hidden");
  }

  function renderizarMascotas() {
    const contenedor = document.getElementById("petList");
    if (estado.mascotas.length === 0) {
      contenedor.innerHTML = '<div class="empty-state">Todavía no hay mascotas registradas.</div>';
      return;
    }
    contenedor.innerHTML = `
      <table>
        <tr><th>Mascota</th><th>Tipo</th><th>Estado</th><th></th></tr>
        ${estado.mascotas.map((m) => `
          <tr>
            <td><span class="miniatura">${fotoMascota(m)}</span>${escaparHtml(m.nombre)}</td>
            <td>${escaparHtml(m.tipo.nombre)}</td>
            <td><span class="badge ${claseEstado(m.estado)}">${escaparHtml(m.estado)}</span></td>
            <td><button type="button" class="small" data-editar-mascota="${m.id}">Editar</button></td>
          </tr>`).join("")}
      </table>
    `;
  }

  function renderizarTipos() {
    const contenedor = document.getElementById("listaTipos");
    contenedor.innerHTML = `
      <table>
        <tr><th>Nombre</th><th>Mascotas</th><th>Estado</th><th></th></tr>
        ${estado.tipos.map((t) => `
          <tr>
            <td>${escaparHtml(t.nombre)}</td>
            <td>${t.totalMascotas}</td>
            <td><span class="badge ${t.activo ? "green" : "gray"}">${t.activo ? "Activo" : "Desactivado"}</span></td>
            <td class="acciones">
              <button type="button" class="small" data-editar-tipo="${t.id}">Editar</button>
              <button type="button" class="small ${t.activo ? "danger" : "secondary"}" data-alternar-tipo="${t.id}">${t.activo ? "Desactivar" : "Activar"}</button>
            </td>
          </tr>`).join("")}
      </table>
    `;
  }

  function filaSolicitud(solicitud) {
    return `
      <tr>
        <td>${numeroSolicitud(solicitud.id)}</td>
        <td><span class="miniatura">${fotoMascota(solicitud.mascota)}</span>${escaparHtml(solicitud.mascota.nombre)}</td>
        <td>${escaparHtml(solicitud.usuario.nombre)}</td>
        <td><span class="badge ${claseEstado(solicitud.estado)}">${escaparHtml(solicitud.estado)}</span></td>
        <td>${escaparHtml(formatearFecha(solicitud.fecha))}</td>
        <td><a class="btn small" href="admin-solicitud.html?id=${solicitud.id}">Ver detalle</a></td>
      </tr>`;
  }

  async function cargarSolicitudes() {
    const contenedor = document.getElementById("pendingList");
    try {
      const activas = await api.get(`/admin/solicitudes?estado=${encodeURIComponent("Solicitada,Entrevista programada,Entrevistada")}`);
      contenedor.innerHTML = activas.length
        ? `<div class="table-wrap"><table><tr><th>N.º</th><th>Mascota</th><th>Adoptante</th><th>Etapa</th><th>Fecha</th><th></th></tr>${activas.map(filaSolicitud).join("")}</table></div>`
        : '<div class="empty-state">No hay solicitudes en curso.</div>';
    } catch (error) {
      mostrarAlerta(document.getElementById("alertaSolicitudes"), error.message);
    }
  }

  async function cargarAgenda() {
    const contenedor = document.getElementById("agenda");
    try {
      const { desde, hasta, entrevistas } = await api.get("/admin/entrevistas");
      const porDia = new Map();
      for (const entrevista of entrevistas) {
        const dia = entrevista.fechaHora.slice(0, 10);
        if (!porDia.has(dia)) porDia.set(dia, []);
        porDia.get(dia).push(entrevista);
      }
      const rango = `<p class="subtitle">Del ${escaparHtml(fechaLarga(desde))} al ${escaparHtml(fechaLarga(hasta))}</p>`;
      contenedor.innerHTML = rango + (porDia.size
        ? [...porDia.entries()].map(([dia, citas]) => `
          <div class="agenda-dia">
            <h3>${escaparHtml(fechaLarga(dia))}</h3>
            ${citas.map((c) => `
              <div class="agenda-cita">
                <span class="hora">${escaparHtml(horaCorta(c.fechaHora))}</span>
                <span style="flex:1;">${escaparHtml(c.mascotaNombre)} · ${escaparHtml(c.adoptanteNombre)}</span>
                <span class="badge ${claseEstado(c.estadoSolicitud)}">${escaparHtml(c.estadoSolicitud)}</span>
                <a class="link-line" href="admin-solicitud.html?id=${c.solicitudId}">Ver solicitud</a>
              </div>`).join("")}
          </div>`).join("")
        : '<div class="empty-state">No hay entrevistas agendadas esta semana.</div>');
    } catch (error) {
      mostrarAlerta(document.getElementById("alertaAgenda"), error.message);
    }
  }

  const listaSeguimientos = document.getElementById("listaSeguimientos");
  const alertaSeguimientos = document.getElementById("alertaSeguimientos");

  async function cargarSeguimientos() {
    try {
      const enviados = await api.get(`/admin/seguimientos?estado=${encodeURIComponent("Enviado")}`);
      listaSeguimientos.innerHTML = enviados.length
        ? enviados.map((c) => `
          <div class="revision-control">
            <img src="${escaparHtml(c.fotoUrl)}" alt="Foto del control ${c.numero} de ${escaparHtml(c.mascotaNombre)}" loading="lazy">
            <div>
              <div style="font-weight:bold;">${escaparHtml(c.mascotaNombre)} · Control ${c.numero}</div>
              <div class="subtitle">Adoptante: ${escaparHtml(c.adoptanteNombre)} · Programado: ${escaparHtml(formatearFecha(c.fechaProgramada))} · Enviado: ${escaparHtml(formatearFecha(c.enviadoEn, true))}</div>
              <label for="comentario-${c.id}">Comentario para el adoptante</label>
              <textarea id="comentario-${c.id}" maxlength="500" placeholder="Ej. Se ve sana y bien cuidada"></textarea>
              <div class="acciones-etapa">
                <button type="button" data-revisar="${c.id}" data-resultado="Todo bien" style="background:var(--green);">Todo bien</button>
                <button type="button" data-revisar="${c.id}" data-resultado="Requiere atención" style="background:var(--orange);">Requiere atención</button>
                <a class="link-line" href="admin-solicitud.html?id=${c.solicitudId}">Ver solicitud</a>
              </div>
            </div>
          </div>`).join("")
        : '<div class="empty-state">No hay controles pendientes de revisión.</div>';
    } catch (error) {
      mostrarAlerta(alertaSeguimientos, error.message);
    }
  }

  listaSeguimientos.addEventListener("click", async (evento) => {
    const boton = evento.target.closest("[data-revisar]");
    if (!boton) return;
    const id = boton.dataset.revisar;
    const comentario = document.getElementById(`comentario-${id}`).value.trim();
    alertaSeguimientos.innerHTML = "";
    boton.disabled = true;
    try {
      await api.patch(`/admin/seguimientos/${id}`, { estado: boton.dataset.resultado, comentario });
      mostrarAlerta(alertaSeguimientos, `Control revisado como "${boton.dataset.resultado}". Se notificó al adoptante.`, "success");
      await cargarSeguimientos();
    } catch (error) {
      mostrarAlerta(alertaSeguimientos, error.message);
      boton.disabled = false;
    }
  });

  const formRefugio = document.getElementById("formRefugio");
  const alertaRefugio = document.getElementById("alertaRefugio");

  async function cargarRefugio() {
    try {
      const configuracion = await api.get("/admin/configuracion-refugio");
      document.getElementById("r_nombre").value = configuracion.nombre;
      document.getElementById("r_direccion").value = configuracion.direccion;
      document.getElementById("r_telefono").value = configuracion.telefono;
      document.getElementById("r_apertura").value = configuracion.horaApertura;
      document.getElementById("r_cierre").value = configuracion.horaCierre;
      document.getElementById("r_duracion").value = configuracion.duracionCitaMin;
      formRefugio.querySelectorAll("input[name=r_dia]").forEach((casilla) => { casilla.checked = configuracion.diasAtencion.includes(casilla.value); });
    } catch (error) {
      mostrarAlerta(alertaRefugio, error.message);
    }
  }

  formRefugio.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    alertaRefugio.innerHTML = "";
    const datos = {
      nombre: document.getElementById("r_nombre").value.trim(),
      direccion: document.getElementById("r_direccion").value.trim(),
      telefono: document.getElementById("r_telefono").value.trim(),
      horaApertura: document.getElementById("r_apertura").value,
      horaCierre: document.getElementById("r_cierre").value,
      duracionCitaMin: Number(document.getElementById("r_duracion").value),
      diasAtencion: [...formRefugio.querySelectorAll("input[name=r_dia]:checked")].map((casilla) => casilla.value),
    };
    try {
      await api.put("/admin/configuracion-refugio", datos);
      mostrarAlerta(alertaRefugio, "La configuración del refugio se guardó. Las próximas entrevistas usarán estos datos.", "success");
    } catch (error) {
      mostrarAlerta(alertaRefugio, error.message);
    }
  });

  async function cargarMascotas() {
    try {
      estado.mascotas = await api.get("/mascotas");
      renderizarMascotas();
    } catch (error) {
      mostrarAlerta(alertaMascotas, error.message);
    }
  }

  async function cargarTipos() {
    try {
      estado.tipos = await api.get("/tipos-mascota");
      renderizarTipos();
    } catch (error) {
      mostrarAlerta(alertaTipos, error.message);
    }
  }

  function limpiarFormularioTipo() {
    estado.tipoEditando = null;
    formTipo.reset();
    document.getElementById("etiquetaTipo").textContent = "Nuevo tipo";
    document.getElementById("btnGuardarTipo").textContent = "Agregar tipo";
    document.getElementById("btnCancelarTipo").classList.add("hidden");
  }

  async function guardarTipo(id, datos, mensaje) {
    alertaTipos.innerHTML = "";
    try {
      if (id) await api.put(`/tipos-mascota/${id}`, datos);
      else await api.post("/tipos-mascota", datos);
      limpiarFormularioTipo();
      await Promise.all([cargarTipos(), cargarMascotas()]);
      mostrarAlerta(alertaTipos, mensaje, "success");
    } catch (error) {
      mostrarAlerta(alertaTipos, error.message);
    }
  }

  document.getElementById("btnNuevaMascota").addEventListener("click", () => abrirFormularioMascota(null));
  document.getElementById("btnCancelarMascota").addEventListener("click", cerrarFormularioMascota);

  document.getElementById("petList").addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-editar-mascota]");
    if (!boton) return;
    const mascota = estado.mascotas.find((m) => m.id === Number(boton.dataset.editarMascota));
    if (mascota) abrirFormularioMascota(mascota);
  });

  formMascota.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    alertaMascotas.innerHTML = "";
    const datos = new FormData();
    datos.append("nombre", campos.nombre.value.trim());
    datos.append("tipoId", campos.tipo.value);
    datos.append("edad", campos.edad.value.trim());
    datos.append("raza", campos.raza.value.trim());
    datos.append("sexo", campos.sexo.value);
    datos.append("descripcion", campos.descripcion.value.trim());
    if (campos.foto.files[0]) datos.append("foto", campos.foto.files[0]);
    const editando = estado.mascotaEditando;
    if (editando) {
      datos.append("estado", campos.estado.value);
      if (campos.quitarFoto.checked) datos.append("quitarFoto", "true");
    }
    const boton = formMascota.querySelector("button[type=submit]");
    boton.disabled = true;
    try {
      const guardada = editando ? await api.put(`/mascotas/${editando.id}`, datos) : await api.post("/mascotas", datos);
      cerrarFormularioMascota();
      await Promise.all([cargarMascotas(), cargarTipos()]);
      mostrarAlerta(alertaMascotas, `${guardada.nombre} se guardó correctamente.`, "success");
    } catch (error) {
      mostrarAlerta(alertaMascotas, error.message);
    } finally {
      boton.disabled = false;
    }
  });

  document.getElementById("listaTipos").addEventListener("click", (evento) => {
    const editar = evento.target.closest("[data-editar-tipo]");
    const alternar = evento.target.closest("[data-alternar-tipo]");
    if (editar) {
      const tipo = estado.tipos.find((t) => t.id === Number(editar.dataset.editarTipo));
      estado.tipoEditando = tipo;
      nombreTipo.value = tipo.nombre;
      document.getElementById("etiquetaTipo").textContent = `Editar tipo: ${tipo.nombre}`;
      document.getElementById("btnGuardarTipo").textContent = "Guardar cambios";
      document.getElementById("btnCancelarTipo").classList.remove("hidden");
      nombreTipo.focus();
    }
    if (alternar) {
      const tipo = estado.tipos.find((t) => t.id === Number(alternar.dataset.alternarTipo));
      const activo = !tipo.activo;
      void guardarTipo(tipo.id, { nombre: tipo.nombre, activo }, `El tipo ${tipo.nombre} se ${activo ? "activó" : "desactivó"}.`);
    }
  });

  document.getElementById("btnCancelarTipo").addEventListener("click", limpiarFormularioTipo);

  formTipo.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = { nombre: nombreTipo.value.trim() };
    const editando = estado.tipoEditando;
    void guardarTipo(editando ? editando.id : null, datos, `El tipo ${datos.nombre} se guardó correctamente.`);
  });

  void cargarSolicitudes();
  void cargarAgenda();
  void cargarSeguimientos();
  void cargarRefugio();
  void cargarTipos();
  void cargarMascotas();
}

if (requiereSesion("admin")) iniciarPagina();
