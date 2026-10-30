/* global api, mostrarAlerta, paginaInicio, redirigirSiHaySesion, renderizarBarra, sesion */

if (!redirigirSiHaySesion()) {
  renderizarBarra();

  const formulario = document.getElementById("regForm");
  const alerta = document.getElementById("alertBox");
  const boton = formulario.querySelector("button[type=submit]");

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    alerta.innerHTML = "";
    const password = document.getElementById("password").value;
    const confirmacion = document.getElementById("password2").value;

    if (password.length < 8) {
      mostrarAlerta(alerta, "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      mostrarAlerta(alerta, "Las contraseñas no coinciden.");
      return;
    }

    boton.disabled = true;
    try {
      const datos = await api.post("/auth/registro", {
        nombre: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password,
        confirmacion,
      });
      sesion.guardar(datos);
      window.location.href = paginaInicio(datos.usuario);
    } catch (error) {
      mostrarAlerta(alerta, error.message);
      boton.disabled = false;
    }
  });
}
