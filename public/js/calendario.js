/* global escaparHtml, MESES_LARGOS */
/* exported crearCalendario */

const NOMBRES_DIAS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const ENCABEZADO_DIAS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function fechaComoTexto(fecha) {
  const dos = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

function crearCalendario(contenedor, { diasAtencion, alElegirDia, seleccionInicial = null, diasConCita = new Set() }) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicial = seleccionInicial ? new Date(`${seleccionInicial}T00:00:00`) : hoy;
  const estado = { anio: inicial.getFullYear(), mes: inicial.getMonth(), seleccion: seleccionInicial };

  function habilitado(fecha) {
    return fecha >= hoy && diasAtencion.includes(NOMBRES_DIAS[fecha.getDay()]);
  }

  function dibujar() {
    const primero = new Date(estado.anio, estado.mes, 1);
    const diasDelMes = new Date(estado.anio, estado.mes + 1, 0).getDate();
    const desplazamiento = (primero.getDay() + 6) % 7;
    const esMesActual = estado.anio === hoy.getFullYear() && estado.mes === hoy.getMonth();
    const celdas = [];
    for (let i = 0; i < desplazamiento; i++) celdas.push("<span></span>");
    for (let dia = 1; dia <= diasDelMes; dia++) {
      const fecha = new Date(estado.anio, estado.mes, dia);
      const texto = fechaComoTexto(fecha);
      const clases = [texto === estado.seleccion ? "seleccionado" : "", diasConCita.has(texto) ? "con-cita" : ""].join(" ").trim();
      celdas.push(`<button type="button" data-dia="${texto}" class="${clases}" ${habilitado(fecha) ? "" : "disabled"} aria-label="${dia} de ${MESES_LARGOS[estado.mes]}">${dia}</button>`);
    }
    contenedor.innerHTML = `
      <div class="calendario" role="group" aria-label="Calendario de entrevistas">
        <div class="calendario-cabecera">
          <button type="button" class="small secondary" data-mover="-1" ${esMesActual ? "disabled" : ""} aria-label="Mes anterior">&lt;</button>
          <strong>${escaparHtml(MESES_LARGOS[estado.mes])} ${estado.anio}</strong>
          <button type="button" class="small secondary" data-mover="1" aria-label="Mes siguiente">&gt;</button>
        </div>
        <div class="calendario-dias">
          ${ENCABEZADO_DIAS.map((d) => `<span class="nombre-dia">${d}</span>`).join("")}
          ${celdas.join("")}
        </div>
      </div>`;
  }

  contenedor.addEventListener("click", (evento) => {
    const mover = evento.target.closest("[data-mover]");
    const dia = evento.target.closest("[data-dia]");
    if (mover && !mover.disabled) {
      const nuevo = new Date(estado.anio, estado.mes + Number(mover.dataset.mover), 1);
      estado.anio = nuevo.getFullYear();
      estado.mes = nuevo.getMonth();
      dibujar();
    }
    if (dia && !dia.disabled) {
      estado.seleccion = dia.dataset.dia;
      dibujar();
      alElegirDia(estado.seleccion);
    }
  });

  dibujar();
  return { redibujar: dibujar };
}
