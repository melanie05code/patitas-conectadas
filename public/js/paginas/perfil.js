/* global api, mostrarAlerta, renderizarBarra, requiereSesion */

function iniciarPagina() {
  renderizarBarra("perfil");

  const formulario = document.getElementById("formPerfil");
  const alerta = document.getElementById("alertBox");
  const boton = document.getElementById("btnGuardarPerfil");
  const volver = new URLSearchParams(window.location.search).get("volver");
  const destinoSeguro = volver && /^solicitar\.html\?id=[0-9]+$/.test(volver) ? volver : null;

  function radio(nombre) {
    const marcado = formulario.querySelector(`input[name="${nombre}"]:checked`);
    return marcado ? marcado.value === "si" : null;
  }

  function marcarRadio(nombre, valor) {
    const opcion = formulario.querySelector(`input[name="${nombre}"][value="${valor ? "si" : "no"}"]`);
    if (opcion) opcion.checked = true;
  }

  function actualizarDetalles() {
    document.getElementById("bloqueOtras").classList.toggle("hidden", radio("p_otras") !== true);
    document.getElementById("bloqueExperiencia").classList.toggle("hidden", radio("p_experiencia") !== true);
  }

  async function cargar() {
    if (destinoSeguro) mostrarAlerta(alerta, "Completa tu perfil para continuar con la solicitud de adopción.", "info");
    try {
      const perfil = await api.get("/perfil-adoptante");
      document.getElementById("p_vivienda").value = perfil.tipoVivienda;
      document.getElementById("p_personas").value = perfil.personasHogar;
      marcarRadio("p_patio", perfil.tienePatio);
      marcarRadio("p_ingresos", perfil.ingresosEstables);
      marcarRadio("p_otras", perfil.tieneOtrasMascotas);
      marcarRadio("p_experiencia", perfil.experienciaPrevia);
      document.getElementById("p_otras_detalle").value = perfil.otrasMascotasDetalle || "";
      document.getElementById("p_experiencia_detalle").value = perfil.experienciaDetalle || "";
    } catch (error) {
      if (error.status !== 404) mostrarAlerta(alerta, error.message);
    }
    actualizarDetalles();
  }

  formulario.addEventListener("change", actualizarDetalles);

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    alerta.innerHTML = "";
    const personas = document.getElementById("p_personas").value.trim();
    const datos = {
      tipoVivienda: document.getElementById("p_vivienda").value,
      personasHogar: personas === "" ? "" : Number(personas),
      tienePatio: radio("p_patio"),
      ingresosEstables: radio("p_ingresos"),
      tieneOtrasMascotas: radio("p_otras"),
      otrasMascotasDetalle: document.getElementById("p_otras_detalle").value.trim(),
      experienciaPrevia: radio("p_experiencia"),
      experienciaDetalle: document.getElementById("p_experiencia_detalle").value.trim(),
    };
    boton.disabled = true;
    try {
      await api.put("/perfil-adoptante", datos);
      if (destinoSeguro) {
        window.location.href = destinoSeguro;
        return;
      }
      mostrarAlerta(alerta, "Tu perfil se guardó correctamente.", "success");
    } catch (error) {
      mostrarAlerta(alerta, error.message);
    } finally {
      boton.disabled = false;
    }
  });

  void cargar();
}

if (requiereSesion("adoptante")) iniciarPagina();
