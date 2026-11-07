/* global api, renderizarBarra */

renderizarBarra();

api.get("/mascotas/estadisticas")
  .then((estadisticas) => {
    document.getElementById("statAvailable").textContent = estadisticas.disponibles;
    document.getElementById("statAdopted").textContent = estadisticas.adoptadas;
  })
  .catch(() => {
    document.getElementById("statAvailable").textContent = "—";
    document.getElementById("statAdopted").textContent = "—";
  });
