const { app, request, USUARIOS, MASCOTAS, reiniciarBaseDatos, iniciarSesion, consultarUna, cerrarConexiones } = require("./ayudantes");

const SOLICITUD_MECHUDO = 1;
const SOLICITUD_VAQUITA = 5;
const VAQUITA = 6;

let tokenAdmin;

function admin(metodo, ruta) {
  return request(app)[metodo](`/api/admin${ruta}`).set("Authorization", `Bearer ${tokenAdmin}`);
}

function fechaSql(fecha) {
  const dos = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

function diaHabil(desplazamiento) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + desplazamiento);
  if (fecha.getDay() === 0) fecha.setDate(fecha.getDate() + 1);
  return fechaSql(fecha);
}

function proximoDomingo() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + ((7 - fecha.getDay()) % 7 || 7));
  return fechaSql(fecha);
}

function agendar(id, fechaHora) {
  return admin("patch", `/solicitudes/${id}/entrevista`).send({ fechaHora });
}

beforeEach(async () => {
  await reiniciarBaseDatos();
  tokenAdmin = await iniciarSesion(USUARIOS.admin);
});
afterAll(cerrarConexiones);

describe("Entrevistas y etapas de la solicitud (RF-05, RF-08, RF-12)", () => {
  test("PR-37 agendar una entrevista en una fecha pasada responde 400", async () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const respuesta = await agendar(SOLICITUD_VAQUITA, `${fechaSql(ayer)} 10:00`);
    const invalida = await agendar(SOLICITUD_VAQUITA, "2026-02-30 10:00");

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toBe("La entrevista debe agendarse en una fecha y hora futuras.");
    expect(invalida.status).toBe(400);
    expect((await consultarUna("SELECT estado FROM solicitudes WHERE id = ?", [SOLICITUD_VAQUITA])).estado).toBe("Solicitada");
  });

  test("PR-38 domingo o fuera del horario de atención responde 400; los límites 09:00 y 15:30 se aceptan", async () => {
    const dia = diaHabil(6);
    const domingo = await agendar(SOLICITUD_VAQUITA, `${proximoDomingo()} 10:00`);
    const temprano = await agendar(SOLICITUD_VAQUITA, `${dia} 08:30`);
    const alCierre = await agendar(SOLICITUD_VAQUITA, `${dia} 16:00`);
    const desalineado = await agendar(SOLICITUD_VAQUITA, `${dia} 10:15`);
    const primera = await agendar(SOLICITUD_VAQUITA, `${dia} 09:00`);
    const ultima = await agendar(SOLICITUD_VAQUITA, `${dia} 15:30`);

    expect(domingo.status).toBe(400);
    expect(domingo.body.error).toContain("no atiende ese día");
    expect([temprano.status, alCierre.status, desalineado.status]).toEqual([400, 400, 400]);
    expect(alCierre.body.error).toContain("fuera del horario de atención");
    expect(primera.status).toBe(200);
    expect(ultima.status).toBe(200);
    expect(ultima.body.entrevista).toMatchObject({ fechaHora: `${dia} 15:30:00`, lugar: expect.stringContaining("Barrio Las Flores") });
  });

  test("PR-39 un horario ocupado responde 409 y la disponibilidad lo marca como ocupado", async () => {
    const { fechaHora } = await consultarUna("SELECT DATE_FORMAT(fecha_hora, '%Y-%m-%d %H:%i') AS fechaHora FROM entrevistas WHERE solicitud_id = ?", [SOLICITUD_MECHUDO]);
    const [fecha, hora] = fechaHora.split(" ");
    const ocupado = await agendar(SOLICITUD_VAQUITA, fechaHora);
    const disponibilidad = await admin("get", "/entrevistas/disponibilidad").query({ fecha });
    const simultaneas = await Promise.all([agendar(SOLICITUD_VAQUITA, `${fecha} 14:00`), agendar(SOLICITUD_MECHUDO, `${fecha} 14:00`)]);

    expect(ocupado.status).toBe(409);
    expect(ocupado.body.error).toBe("Ese horario ya está ocupado. Elige otro.");
    expect(disponibilidad.status).toBe(200);
    expect(disponibilidad.body.horarios).toHaveLength(14);
    expect(disponibilidad.body.horarios.find((h) => h.hora === hora).estado).toBe("ocupado");
    expect(simultaneas.map((r) => r.status).sort()).toEqual([200, 409]);
  });

  test("PR-40 aprobar sin entrevista realizada responde 409 y no cambia nada", async () => {
    const sinEntrevista = await admin("patch", `/solicitudes/${SOLICITUD_VAQUITA}/estado`).send({ estado: "Aprobada" });
    const programada = await admin("patch", `/solicitudes/${SOLICITUD_MECHUDO}/estado`).send({ estado: "Aprobada" });
    const entrevistadaAntes = await admin("patch", `/solicitudes/${SOLICITUD_VAQUITA}/entrevistada`).send({});

    expect(sinEntrevista.status).toBe(409);
    expect(sinEntrevista.body.error).toBe("Solo se puede aprobar una solicitud después de realizar la entrevista.");
    expect(programada.status).toBe(409);
    expect(entrevistadaAntes.status).toBe(409);
    expect((await consultarUna("SELECT estado FROM mascotas WHERE id = ?", [VAQUITA])).estado).toBe("En proceso");
  });

  test("PR-41 flujo completo Solicitada → Entrevista programada → Entrevistada → Aprobada con notificaciones", async () => {
    const dia = diaHabil(5);
    const agendada = await agendar(SOLICITUD_VAQUITA, `${dia}T11:00`);
    const reprogramada = await agendar(SOLICITUD_VAQUITA, `${dia} 11:30`);
    const entrevistada = await admin("patch", `/solicitudes/${SOLICITUD_VAQUITA}/entrevistada`).send({ notas: "Familia preparada, patio cercado." });
    const aprobada = await admin("patch", `/solicitudes/${SOLICITUD_VAQUITA}/estado`).send({ estado: "Aprobada" });

    expect(agendada.body.estado).toBe("Entrevista programada");
    expect(reprogramada.body.entrevista.fechaHora).toBe(`${dia} 11:30:00`);
    expect(entrevistada.body).toMatchObject({ estado: "Entrevistada", entrevista: { notasAdmin: "Familia preparada, patio cercado." } });
    expect(entrevistada.body.entrevista.realizadaEn).toBeTruthy();
    expect(aprobada.body).toMatchObject({ estado: "Aprobada", mascota: { estado: "Adoptada" }, perfil: { tipoVivienda: "Casa" } });
    expect(aprobada.body.respondidaEn).toBeTruthy();
    const { total } = await consultarUna("SELECT COUNT(*) AS total FROM entrevistas WHERE solicitud_id = ?", [SOLICITUD_VAQUITA]);
    expect(total).toBe(1);
    const textos = (await request(app).get("/api/notificaciones").set("Authorization", `Bearer ${await iniciarSesion(USUARIOS.ana)}`)).body.map((n) => n.texto);
    expect(textos.some((texto) => texto.startsWith("Tu entrevista para adoptar a Vaquita quedó agendada para el"))).toBe(true);
    expect(textos.some((texto) => /se reprogramó para el .* a las 11:30 a\. m\./.test(texto))).toBe(true);
    expect(textos[0]).toContain("Tu solicitud para Vaquita fue aprobada");
  });

  test("PR-42 rechazar en cualquier etapa activa devuelve la mascota a Disponible y libera el horario", async () => {
    const { fechaHora } = await consultarUna("SELECT DATE_FORMAT(fecha_hora, '%Y-%m-%d %H:%i') AS fechaHora FROM entrevistas WHERE solicitud_id = ?", [SOLICITUD_MECHUDO]);
    const rechazo = await admin("patch", `/solicitudes/${SOLICITUD_MECHUDO}/estado`).send({ estado: "Rechazada", motivo: "No asistió a la entrevista." });
    const rechazoSolicitada = await admin("patch", `/solicitudes/${SOLICITUD_VAQUITA}/estado`).send({ estado: "Rechazada" });
    const liberado = await admin("get", "/entrevistas/disponibilidad").query({ fecha: fechaHora.slice(0, 10) });
    const repetido = await admin("patch", `/solicitudes/${SOLICITUD_MECHUDO}/estado`).send({ estado: "Rechazada" });

    expect(rechazo.status).toBe(200);
    expect(rechazo.body).toMatchObject({ estado: "Rechazada", mascota: { estado: "Disponible" } });
    expect(rechazo.body.entrevista.canceladaEn).toBeTruthy();
    expect(rechazo.body.entrevista.notasAdmin).toContain("No asistió a la entrevista.");
    expect(rechazoSolicitada.body.mascota.estado).toBe("Disponible");
    expect(liberado.body.horarios.find((h) => h.hora === fechaHora.slice(11)).estado).toBe("libre");
    expect(repetido.status).toBe(409);
  });

  test("PR-43 el detalle para el admin incluye perfil y entrevista; la agenda lista las entrevistas de la semana", async () => {
    const detalle = await admin("get", `/solicitudes/${SOLICITUD_MECHUDO}`);
    const agenda = await admin("get", "/entrevistas");
    const filtradas = await admin("get", "/solicitudes").query({ estado: "Solicitada,Entrevista programada,Entrevistada" });
    const filtroInvalido = await admin("get", "/solicitudes").query({ estado: "En revisión" });
    const tokenEdwin = await iniciarSesion(USUARIOS.edwin);
    const adoptante = await request(app).get("/api/admin/entrevistas").set("Authorization", `Bearer ${tokenEdwin}`);

    expect(detalle.body).toMatchObject({ estado: "Entrevista programada", perfil: { tipoVivienda: "Apartamento", personasHogar: 2 }, entrevista: { lugar: expect.stringContaining("Managua") } });
    expect(agenda.status).toBe(200);
    expect(agenda.body.entrevistas.map((e) => e.mascotaNombre)).toEqual(["Mechudo"]);
    expect(filtradas.body.map((s) => s.id)).toEqual([1, 5]);
    expect(filtroInvalido.status).toBe(400);
    expect(adoptante.status).toBe(403);
  });

  test("PR-44 la configuración del refugio la edita solo el admin, con validación, y el lugar nuevo se copia al agendar", async () => {
    const actual = await admin("get", "/configuracion-refugio");
    const invalida = await admin("put", "/configuracion-refugio").send({ ...actual.body, horaApertura: "17:00", diasAtencion: ["feriado"], duracionCitaMin: 5 });
    const nueva = { ...actual.body, direccion: "Km 5 carretera a Masaya, Managua", horaCierre: "12:00" };
    const guardada = await admin("put", "/configuracion-refugio").send(nueva);
    const fueraDelNuevoHorario = await agendar(SOLICITUD_VAQUITA, `${diaHabil(4)} 13:00`);
    const agendada = await agendar(SOLICITUD_VAQUITA, `${diaHabil(4)} 11:30`);
    const tokenEdwin = await iniciarSesion(USUARIOS.edwin);
    const adoptante = await request(app).get("/api/admin/configuracion-refugio").set("Authorization", `Bearer ${tokenEdwin}`);

    expect(actual.body).toMatchObject({ nombre: "Refugio Patitas Conectadas", horaApertura: "09:00", horaCierre: "16:00", duracionCitaMin: 30 });
    expect(actual.body.diasAtencion).toEqual(["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]);
    expect(invalida.status).toBe(400);
    expect(invalida.body.error).toContain("apertura debe ser anterior");
    expect(guardada.body.horaCierre).toBe("12:00");
    expect(fueraDelNuevoHorario.status).toBe(400);
    expect(agendada.body.entrevista.lugar).toBe("Km 5 carretera a Masaya, Managua");
    expect(adoptante.status).toBe(403);
  });
});
