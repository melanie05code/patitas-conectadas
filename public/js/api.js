async function llamarApi(metodo, ruta, cuerpo) {
  const actual = sesion.obtener();
  const esFormulario = cuerpo instanceof FormData;
  const cabeceras = { Accept: "application/json" };
  if (cuerpo !== undefined && !esFormulario) cabeceras["Content-Type"] = "application/json";
  if (actual) cabeceras.Authorization = `Bearer ${actual.token}`;

  let respuesta;
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined || esFormulario ? cuerpo : JSON.stringify(cuerpo),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
  }

  const datos = respuesta.status === 204 ? null : await respuesta.json().catch(() => null);

  if (respuesta.status === 401 && actual) {
    sesion.cerrar();
    window.location.replace("login.html?expirada=1");
  }
  if (!respuesta.ok) {
    const error = new Error((datos && datos.error) || `Ocurrió un error inesperado (${respuesta.status}).`);
    error.status = respuesta.status;
    throw error;
  }
  return datos;
}

const api = {
  get: (ruta) => llamarApi("GET", ruta),
  post: (ruta, cuerpo) => llamarApi("POST", ruta, cuerpo ?? {}),
  put: (ruta, cuerpo) => llamarApi("PUT", ruta, cuerpo ?? {}),
  patch: (ruta, cuerpo) => llamarApi("PATCH", ruta, cuerpo ?? {}),
};
