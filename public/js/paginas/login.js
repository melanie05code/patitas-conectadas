if (!redirigirSiHaySesion()) {
  renderizarBarra();

  const formulario = document.getElementById("loginForm");
  const alerta = document.getElementById("alertBox");
  const boton = formulario.querySelector("button[type=submit]");

  if (new URLSearchParams(window.location.search).has("expirada")) {
    mostrarAlerta(alerta, "Tu sesión expiró. Inicia sesión de nuevo.");
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    alerta.innerHTML = "";
    boton.disabled = true;
    try {
      const datos = await api.post("/auth/login", {
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
      });
      sesion.guardar(datos);
      window.location.href = paginaInicio(datos.usuario);
    } catch (error) {
      mostrarAlerta(alerta, error.message);
      boton.disabled = false;
    }
  });
}
