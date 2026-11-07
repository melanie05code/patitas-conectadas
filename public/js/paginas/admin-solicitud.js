/* global api, claseEstado, crearCalendario, escaparHtml, fechaLarga, formatearFecha, fotoMascota, horaCorta, iconoSvg, mostrarAlerta, numeroSolicitud, parametroId, renderizarBarra, requiereSesion */

const ACTIVAS = ["Solicitada", "Entrevista programada", "Entrevistada"];
const TITULOS_HORARIO = { libre: "Disponible", ocupado: "Ocupado", pasado: "Ya pasó" };

function siNo(valor) {
  return valor ? "Sí" : "No";
}

function bloquePerfil(perfil) {
  if (!perfil) return '<div class="alert error">El adoptante no tiene perfil registrado.</div>';
  return `
    <div class="perfil-lista">
      <div><strong>Vivienda</strong>${escaparHtml(perfil.tipoVivienda)}</div>
      <div><strong>Patio</strong>${siNo(perfil.tienePatio)}</div>
      <div><strong>Personas en el hogar</strong>${perfil.personasHogar}</div>
      <div><strong>Ingresos estables</strong>${siNo(perfil.ingresosEstables)}</div>
      <div><strong>Otras mascotas</strong>${perfil.tieneOtrasMascotas ? escaparHtml(perfil.otrasMascotasDetalle) : "No"}</div>
      <div><strong>Experiencia previa</strong>${perfil.experienciaPrevia ? escaparHtml(perfil.experienciaDetalle) : "No"}</div>
    </div>`;
}

function bloqueEntrevista(entrevista) {
  if (!entrevista) return '<p class="subtitle">Todavía no hay entrevista agendada.</p>';
  let estado = "Programada";
  if (entrevista.canceladaEn) estado = "Cancelada";
  else if (entrevista.realizadaEn) estado = `Realizada el ${formatearFecha(entrevista.realizadaEn, true)}`;
  return `
    <div class="dato-entrevista">${iconoSvg("calendario")}<div><strong>Día y hora</strong>${escaparHtml(fechaLarga(entrevista.fechaHora))}, ${escaparHtml(horaCorta(entrevista.fechaHora))}</div></div>
    <div class="dato-entrevista">${iconoSvg("ubicacion")}<div><strong>Lugar</strong>${escaparHtml(entrevista.lugar)}</div></div>
    <div class="dato-entrevista">${iconoSvg("reloj")}<div><strong>Estado</strong>${escaparHtml(estado)}</div></div>
    ${entrevista.notasAdmin ? `<div class="dato-entrevista">${iconoSvg("alerta")}<div><strong>Notas del refugio</strong><span style="white-space:pre-line;">${escaparHtml(entrevista.notasAdmin)}</span></div></div>` : ""}`;
}

function iniciarPagina() {
  renderizarBarra("admin");
  const id = parametroId();
  const contenedor = document.getElementById("detalle");
  const alerta = document.getElementById("alertBox");
  const estado = { solicitud: null, configuracion: null, horaElegida: null, diaElegido: null };

  async function mostrarHorarios(fecha) {
    estado.diaElegido = fecha;
    estado.horaElegida = null;
    const zona = document.getElementById("horarios");
    const confirmar = document.getElementById("btnConfirmarEntrevista");
    confirmar.disabled = true;
    zona.innerHTML = '<p class="subtitle">Cargando horarios...</p>';
    try {
      const disponibilidad = await api.get(`/admin/entrevistas/disponibilidad?fecha=${encodeURIComponent(fecha)}`);
      if (!disponibilidad.atiende) {
        zona.innerHTML = '<p class="subtitle">El refugio no atiende ese día.</p>';
        return;
      }
      zona.innerHTML = `
        <p style="font-weight:bold; margin-top:8px;">Horarios del ${escaparHtml(fechaLarga(fecha))}</p>
        <div class="horarios">${disponibilidad.horarios.map((h) => `
          <button type="button" data-hora="${h.hora}" ${h.estado === "libre" ? "" : "disabled"} title="${TITULOS_HORARIO[h.estado]}">${escaparHtml(horaCorta(`${fecha} ${h.hora}`))}</button>`).join("")}
        </div>`;
    } catch (error) {
      zona.innerHTML = "";
      mostrarAlerta(alerta, error.message);
    }
  }

  function bloqueAgenda(solicitud) {
    if (!["Solicitada", "Entrevista programada"].includes(solicitud.estado)) return "";
    const reprogramar = solicitud.estado === "Entrevista programada";
    return `
      <div class="card">
        <h2>${reprogramar ? "Reprogramar entrevista" : "Agendar entrevista"}</h2>
        <p class="subtitle">Lugar: ${escaparHtml(estado.configuracion.direccion)}. Atención de ${escaparHtml(estado.configuracion.horaApertura)} a ${escaparHtml(estado.configuracion.horaCierre)}, citas de ${estado.configuracion.duracionCitaMin} minutos.</p>
        <div class="agenda-calendario">
          <div id="calendario"></div>
          <div>
            <div id="horarios"><p class="subtitle">Elige un día en el calendario para ver los horarios disponibles.</p></div>
            <button type="button" id="btnConfirmarEntrevista" style="margin-top:14px;" disabled>${reprogramar ? "Confirmar nueva fecha" : "Agendar entrevista"}</button>
          </div>
        </div>
      </div>`;
  }

  function bloqueAcciones(solicitud) {
    if (!ACTIVAS.includes(solicitud.estado)) return "";
    const entrevistada = solicitud.estado === "Entrevistada";
    return `
      <div class="card">
        <h2>Decisión</h2>
        <label for="notasAdmin">${solicitud.estado === "Entrevista programada" ? "Notas de la entrevista" : "Motivo o comentario (opcional)"}</label>
        <textarea id="notasAdmin" maxlength="1000" placeholder="Observaciones del refugio"></textarea>
        <div class="acciones-etapa">
          ${solicitud.estado === "Entrevista programada" ? `<button type="button" data-accion="entrevistada">${iconoSvg("check")} Marcar como entrevistada</button>` : ""}
          <button type="button" data-accion="aprobar" style="background:var(--green);" ${entrevistada ? "" : 'disabled title="Primero debe realizarse la entrevista"'}>${iconoSvg("check")} Aprobar</button>
          <button type="button" data-accion="rechazar" class="danger">${iconoSvg("equis")} Rechazar</button>
        </div>
        ${entrevistada ? "" : '<p class="subtitle" style="margin-top:8px;">Solo se puede aprobar después de marcar la entrevista como realizada.</p>'}
      </div>`;
  }

  function dibujar() {
    const s = estado.solicitud;
    document.title = `Solicitud ${numeroSolicitud(s.id)} — Patitas Conectadas`;
    contenedor.innerHTML = `
      <div class="card">
        <div class="row-flex" style="align-items:flex-start;">
          <div class="row-flex" style="justify-content:flex-start;">
            <div class="avatar" style="width:64px; height:64px;">${fotoMascota(s.mascota)}</div>
            <div>
              <h1 style="margin-bottom:2px;">${escaparHtml(s.mascota.nombre)}</h1>
              <div class="subtitle">Solicitud ${numeroSolicitud(s.id)} · ${escaparHtml(formatearFecha(s.fecha, true))}</div>
            </div>
          </div>
          <span class="badge ${claseEstado(s.estado)}">${escaparHtml(s.estado)}</span>
        </div>
        <div class="perfil-lista" style="margin-top:14px;">
          <div><strong>Adoptante</strong>${escaparHtml(s.usuario.nombre)}</div>
          <div><strong>Correo</strong>${escaparHtml(s.usuario.email)}</div>
          <div><strong>Teléfono</strong>${escaparHtml(s.telefono)}</div>
          <div><strong>Dirección</strong>${escaparHtml(s.direccion)}</div>
        </div>
        <div style="margin-top:10px;"><strong style="font-size:0.78rem; color:var(--gray); text-transform:uppercase;">Motivo</strong><p style="overflow-wrap:anywhere;">${escaparHtml(s.motivo)}</p></div>
      </div>
      <div class="card"><h2>Perfil del adoptante</h2>${bloquePerfil(s.perfil)}</div>
      <div class="card"><h2>Entrevista</h2>${bloqueEntrevista(s.entrevista)}</div>
      ${bloqueAgenda(s)}
      ${bloqueAcciones(s)}`;
    const zonaCalendario = document.getElementById("calendario");
    if (zonaCalendario) {
      const inicial = s.entrevista && !s.entrevista.canceladaEn ? s.entrevista.fechaHora.slice(0, 10) : null;
      crearCalendario(zonaCalendario, { diasAtencion: estado.configuracion.diasAtencion, alElegirDia: (fecha) => void mostrarHorarios(fecha), seleccionInicial: inicial });
      if (inicial) void mostrarHorarios(inicial);
    }
  }

  async function cargar() {
    try {
      if (!id) throw new Error("Solicitud no encontrada.");
      const [solicitud, configuracion] = await Promise.all([api.get(`/admin/solicitudes/${id}`), api.get("/admin/configuracion-refugio")]);
      estado.solicitud = solicitud;
      estado.configuracion = configuracion;
      dibujar();
    } catch (error) {
      mostrarAlerta(alerta, error.message);
    }
  }

  async function ejecutar(promesa, mensaje) {
    alerta.innerHTML = "";
    contenedor.querySelectorAll("button").forEach((b) => { b.disabled = true; });
    try {
      estado.solicitud = await promesa;
      dibujar();
      mostrarAlerta(alerta, mensaje, "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      mostrarAlerta(alerta, error.message);
      dibujar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  contenedor.addEventListener("click", (evento) => {
    const hora = evento.target.closest("[data-hora]");
    if (hora && !hora.disabled) {
      estado.horaElegida = hora.dataset.hora;
      contenedor.querySelectorAll("[data-hora]").forEach((b) => b.classList.toggle("seleccionado", b === hora));
      document.getElementById("btnConfirmarEntrevista").disabled = false;
      return;
    }
    if (evento.target.closest("#btnConfirmarEntrevista") && estado.horaElegida) {
      const fechaHora = `${estado.diaElegido} ${estado.horaElegida}`;
      void ejecutar(
        api.patch(`/admin/solicitudes/${id}/entrevista`, { fechaHora }),
        `Se notificó a ${estado.solicitud.usuario.nombre}: entrevista el ${fechaLarga(fechaHora)} a las ${horaCorta(fechaHora)}`
      );
      return;
    }
    const accion = evento.target.closest("[data-accion]");
    if (!accion || accion.disabled) return;
    const notas = document.getElementById("notasAdmin").value.trim();
    const nombre = estado.solicitud.mascota.nombre;
    if (accion.dataset.accion === "entrevistada") {
      void ejecutar(api.patch(`/admin/solicitudes/${id}/entrevistada`, { notas }), "La entrevista quedó marcada como realizada.");
    }
    if (accion.dataset.accion === "aprobar" && window.confirm(`¿Aprobar la adopción de ${nombre}?`)) {
      void ejecutar(api.patch(`/admin/solicitudes/${id}/estado`, { estado: "Aprobada", motivo: notas }), `Solicitud aprobada: ${nombre} ahora está Adoptada y se programaron los controles post-adopción.`);
    }
    if (accion.dataset.accion === "rechazar" && window.confirm(`¿Rechazar la solicitud para ${nombre}?`)) {
      void ejecutar(api.patch(`/admin/solicitudes/${id}/estado`, { estado: "Rechazada", motivo: notas }), `Solicitud rechazada: ${nombre} vuelve a estar Disponible.`);
    }
  });

  void cargar();
}

if (requiereSesion("admin")) iniciarPagina();
