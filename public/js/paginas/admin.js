/* global api, claseEstado, escaparHtml, formatearFecha, fotoMascota, iconoMascota, mostrarAlerta, numeroSolicitud, renderizarBarra, requiereSesion */

if (requiereSesion("admin")) {
  renderizarBarra("admin");

  const estado = { tipos: [], mascotas: [], pendientes: [], mascotaEditando: null, tipoEditando: null };

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
  const iconoTipo = document.getElementById("t_icono");

  function opcionesDeTipo(tipoActualId) {
    return estado.tipos
      .filter((t) => t.activo || t.id === tipoActualId)
      .map((t) => `<option value="${t.id}">${escaparHtml(t.icono)} ${escaparHtml(t.nombre)}${t.activo ? "" : " (desactivado)"}</option>`)
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
            <td>${iconoMascota(m)} ${escaparHtml(m.tipo.nombre)}</td>
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
        <tr><th>Ícono</th><th>Nombre</th><th>Mascotas</th><th>Estado</th><th></th></tr>
        ${estado.tipos.map((t) => `
          <tr>
            <td>${escaparHtml(t.icono)}</td>
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

  function tarjetaSolicitud(solicitud) {
    return `
      <div class="row-flex" style="padding:12px 0; border-bottom:1px solid #eee; align-items:flex-start;">
        <div class="avatar">${fotoMascota(solicitud.mascota)}</div>
        <div style="flex:1; min-width:200px;">
          <div style="font-weight:bold;">${escaparHtml(solicitud.mascota.nombre)} <span style="color:var(--gray); font-weight:normal; font-size:0.85rem;">· Solicitud ${numeroSolicitud(solicitud.id)} · ${escaparHtml(formatearFecha(solicitud.fecha))}</span></div>
          <div style="color:var(--gray); font-size:0.85rem;">Solicitante: ${escaparHtml(solicitud.usuario.nombre)} (${escaparHtml(solicitud.usuario.email)}) · Tel. ${escaparHtml(solicitud.telefono)}</div>
          <div style="color:#555; font-size:0.88rem; margin-top:4px; overflow-wrap:anywhere;">“${escaparHtml(solicitud.motivo)}”</div>
        </div>
        <div class="acciones">
          <button type="button" data-responder="${solicitud.id}" data-estado="Aprobada" style="background:var(--green);">✔ Aprobar</button>
          <button type="button" data-responder="${solicitud.id}" data-estado="Rechazada" class="danger">✕ Rechazar</button>
        </div>
      </div>
    `;
  }

  async function cargarSolicitudes() {
    const contenedor = document.getElementById("pendingList");
    try {
      const pendientes = await api.get(`/admin/solicitudes?estado=${encodeURIComponent("En revisión")}`);
      estado.pendientes = pendientes;
      contenedor.innerHTML = pendientes.length
        ? pendientes.map(tarjetaSolicitud).join("")
        : '<div class="empty-state">No hay solicitudes pendientes.</div>';
    } catch (error) {
      mostrarAlerta(document.getElementById("alertaSolicitudes"), error.message);
    }
  }

  document.getElementById("pendingList").addEventListener("click", async (evento) => {
    const boton = evento.target.closest("[data-responder]");
    if (!boton) return;
    const alerta = document.getElementById("alertaSolicitudes");
    const solicitud = estado.pendientes.find((s) => s.id === Number(boton.dataset.responder));
    const respuesta = boton.dataset.estado;
    const verbo = respuesta === "Aprobada" ? "aprobar" : "rechazar";
    if (!window.confirm(`¿Seguro que quieres ${verbo} la solicitud de ${solicitud.usuario.nombre} para ${solicitud.mascota.nombre}?`)) return;
    alerta.innerHTML = "";
    boton.closest(".acciones").querySelectorAll("button").forEach((b) => { b.disabled = true; });
    try {
      await api.patch(`/admin/solicitudes/${solicitud.id}`, { estado: respuesta });
      await Promise.all([cargarSolicitudes(), cargarMascotas()]);
      const resultado = respuesta === "Aprobada" ? `${solicitud.mascota.nombre} ahora está Adoptada` : `${solicitud.mascota.nombre} vuelve a estar Disponible`;
      mostrarAlerta(alerta, `Solicitud ${respuesta.toLowerCase()}: ${resultado} y se notificó a ${solicitud.usuario.nombre}.`, "success");
    } catch (error) {
      mostrarAlerta(alerta, error.message);
      await cargarSolicitudes();
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
      iconoTipo.value = tipo.icono;
      document.getElementById("etiquetaTipo").textContent = `Editar tipo: ${tipo.nombre}`;
      document.getElementById("btnGuardarTipo").textContent = "Guardar cambios";
      document.getElementById("btnCancelarTipo").classList.remove("hidden");
      nombreTipo.focus();
    }
    if (alternar) {
      const tipo = estado.tipos.find((t) => t.id === Number(alternar.dataset.alternarTipo));
      const activo = !tipo.activo;
      guardarTipo(tipo.id, { nombre: tipo.nombre, icono: tipo.icono, activo }, `El tipo ${tipo.nombre} se ${activo ? "activó" : "desactivó"}.`);
    }
  });

  document.getElementById("btnCancelarTipo").addEventListener("click", limpiarFormularioTipo);

  formTipo.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = { nombre: nombreTipo.value.trim(), icono: iconoTipo.value.trim() };
    const editando = estado.tipoEditando;
    guardarTipo(editando ? editando.id : null, datos, `El tipo ${datos.nombre} se guardó correctamente.`);
  });

  cargarSolicitudes();
  cargarTipos();
  cargarMascotas();
}
