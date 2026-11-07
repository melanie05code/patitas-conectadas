const tipos = [
  { id: 1, nombre: "Perro" },
  { id: 2, nombre: "Gato" },
  { id: 3, nombre: "Ave" },
  { id: 4, nombre: "Conejo" },
  { id: 5, nombre: "Cuyo" },
  { id: 6, nombre: "Hámster" },
  { id: 7, nombre: "Pez" },
  { id: 8, nombre: "Tortuga" },
  { id: 9, nombre: "Otro" },
];

const mascotas = [
  { id: 1, nombre: "Mechudo", tipoId: 1, edad: "5 años", raza: "Yorkshire Terrier", sexo: "Macho", estado: "En proceso", foto: "mechudo.jpg", descripcion: "Pequeño, cariñoso y muy apegado a las personas. Le encanta que lo carguen y usar su suéter en los días frescos. Ideal para apartamento." },
  { id: 2, nombre: "Cjotas", tipoId: 1, edad: "4 meses", raza: "Mestizo", sexo: "Macho", estado: "Disponible", foto: "cjotas.jpg", descripcion: "Cachorro curioso de pelaje blanco con manchitas grises. Un poco tímido al principio, pero muy noble cuando toma confianza." },
  { id: 3, nombre: "El Hambriento", tipoId: 1, edad: "3 años", raza: "Mestizo", sexo: "Macho", estado: "Disponible", foto: "el-hambriento.jpg", descripcion: "Grande, tranquilo y siempre pendiente de la hora de comer. Es leal y protector, ideal para una casa con patio." },
  { id: 4, nombre: "Encantador", tipoId: 2, edad: "2 años", raza: "Común atigrado", sexo: "Macho", estado: "Adoptada", foto: "encantador.jpg", descripcion: "Gato atigrado muy sociable y juguetón. Se lleva bien con otros gatos y le encanta tomar el sol." },
  { id: 5, nombre: "Dormilona", tipoId: 1, edad: "6 meses", raza: "Mestiza", sexo: "Hembra", estado: "Disponible", foto: "dormilona.jpg", descripcion: "Cachorra dulce y tranquila que ama dormir panza arriba en su camita. Perfecta para una familia que busque una compañera calmada." },
  { id: 6, nombre: "Vaquita", tipoId: 1, edad: "2 años", raza: "Mestiza", sexo: "Hembra", estado: "En proceso", foto: "vaquita.jpg", descripcion: "Blanca con negro, de ahí su nombre. Muy cariñosa, le encanta que le rasquen la pancita y se lleva bien con niños." },
  { id: 7, nombre: "Calenturiento", tipoId: 2, edad: "1 año", raza: "Pelo largo atigrado", sexo: "Macho", estado: "Disponible", foto: "calenturiento.jpg", descripcion: "Gato de pelo largo con mucha personalidad y caras graciosas. Activo, curioso y muy expresivo." },
  { id: 8, nombre: "Princesa Sucia", tipoId: 1, edad: "6 años", raza: "Poodle mestiza", sexo: "Hembra", estado: "Disponible", foto: "princesa-sucia.jpg", descripcion: "Pequeña de pelo rizado, tranquila y obediente. Le gusta jugar en el patio aunque termine llena de tierra. Necesita baños frecuentes." },
  { id: 9, nombre: "Mordelona", tipoId: 1, edad: "3 años", raza: "Mestiza", sexo: "Hembra", estado: "Disponible", foto: "mordelona.jpg", descripcion: "Juguetona y llena de energía; muerde suavecito cuando juega. Ideal para alguien activo con tiempo para paseos." },
  { id: 10, nombre: "Lara", tipoId: 3, edad: "4 años", raza: "Lora de frente roja", sexo: "Hembra", estado: "Adoptada", foto: "lara.jpg", descripcion: "Lora verde muy sociable que disfruta estar en el hombro de las personas. Requiere un adoptante con experiencia en aves." },
];


function sqlCrudo(expresion) {
  return { toSqlString: () => expresion };
}

function haceDias(dias, hora) {
  return sqlCrudo(`TIMESTAMP(CURDATE() - INTERVAL ${dias} DAY, '${hora}')`);
}

function enDiasHabiles(dias, hora) {
  const base = `CURDATE() + INTERVAL ${dias} DAY`;
  return sqlCrudo(`TIMESTAMP(${base} + INTERVAL (DAYOFWEEK(${base}) = 1) DAY, '${hora}')`);
}

const DIRECCION_REFUGIO = "Barrio Las Flores, de la iglesia 2 c. al lago, 1 c. arriba, Managua";

const usuarios = [
  { id: 1, nombre: "Administrador Refugio", email: "admin@patitas.com", variableContrasena: "SEED_ADMIN_PASSWORD", rol: "admin" },
  { id: 2, nombre: "Edwin Obando", email: "edwin.obando@correo.com", variableContrasena: "SEED_ADOPTANTE_PASSWORD", rol: "adoptante" },
  { id: 3, nombre: "Ana Martínez", email: "ana.martinez@correo.com", variableContrasena: "SEED_ADOPTANTE2_PASSWORD", rol: "adoptante" },
];

const perfiles = [
  { usuarioId: 2, tipoVivienda: "Apartamento", tienePatio: false, personasHogar: 2, ingresosEstables: true, tieneOtrasMascotas: true, otrasMascotasDetalle: "Una gata adulta esterilizada y muy sociable.", experienciaPrevia: true, experienciaDetalle: "Cuidé loras y gatos en casa de mis padres durante más de diez años." },
  { usuarioId: 3, tipoVivienda: "Casa", tienePatio: true, personasHogar: 4, ingresosEstables: true, tieneOtrasMascotas: false, otrasMascotasDetalle: null, experienciaPrevia: true, experienciaDetalle: "Crecí con perros en casa y hoy tengo tiempo para paseos diarios." },
];

const solicitudes = [
  { id: 1, mascotaId: 1, usuarioId: 2, telefono: "8888-1234", direccion: "Barrio Altamira, Managua", motivo: "Vivo en un apartamento tranquilo y trabajo desde casa, así que Mechudo tendría compañía todo el día.", estado: "Entrevista programada", fecha: haceDias(4, "10:15:00"), respondidaEn: null, actualizadoEn: haceDias(2, "09:00:00") },
  { id: 2, mascotaId: 4, usuarioId: 2, telefono: "8888-1234", direccion: "Barrio Altamira, Managua", motivo: "Ya tengo una gata adulta muy sociable y quiero darle un compañero de juegos.", estado: "Aprobada", fecha: haceDias(50, "09:30:00"), respondidaEn: haceDias(44, "16:40:00"), actualizadoEn: haceDias(44, "16:40:00") },
  { id: 3, mascotaId: 8, usuarioId: 2, telefono: "8888-1234", direccion: "Barrio Altamira, Managua", motivo: "Me encantan los perros pequeños y tengo un patio donde puede jugar.", estado: "Rechazada", fecha: haceDias(70, "14:05:00"), respondidaEn: haceDias(64, "11:20:00"), actualizadoEn: haceDias(64, "11:20:00") },
  { id: 4, mascotaId: 10, usuarioId: 2, telefono: "8888-1234", direccion: "Barrio Altamira, Managua", motivo: "Crié loras durante años en casa de mis padres y tengo experiencia con su alimentación y cuidados.", estado: "Aprobada", fecha: haceDias(215, "08:45:00"), respondidaEn: haceDias(208, "10:00:00"), actualizadoEn: haceDias(208, "10:00:00") },
  { id: 5, mascotaId: 6, usuarioId: 3, telefono: "8777-4321", direccion: "Residencial Los Robles, Managua", motivo: "Tenemos una casa con patio y dos niños que sueñan con una perrita cariñosa como Vaquita.", estado: "Solicitada", fecha: haceDias(1, "15:20:00"), respondidaEn: null, actualizadoEn: haceDias(1, "15:20:00") },
];

const entrevistas = [
  { id: 1, solicitudId: 1, fechaHora: enDiasHabiles(3, "10:30:00"), lugar: DIRECCION_REFUGIO, notasAdmin: null, realizadaEn: null, creadoEn: haceDias(2, "09:00:00") },
  { id: 2, solicitudId: 2, fechaHora: haceDias(45, "09:30:00"), lugar: DIRECCION_REFUGIO, notasAdmin: "Edwin conoce a Encantador y su gata convive bien con otros gatos. Se recomienda una presentación gradual.", realizadaEn: haceDias(45, "10:05:00"), creadoEn: haceDias(48, "11:00:00") },
  { id: 3, solicitudId: 3, fechaHora: haceDias(65, "14:00:00"), lugar: DIRECCION_REFUGIO, notasAdmin: "Se rechaza: el apartamento no tiene patio ni área exterior y Princesa Sucia necesita espacio para jugar todos los días.", realizadaEn: haceDias(65, "14:40:00"), creadoEn: haceDias(68, "10:00:00") },
  { id: 4, solicitudId: 4, fechaHora: haceDias(210, "11:00:00"), lugar: DIRECCION_REFUGIO, notasAdmin: "Experiencia comprobada con aves. Tiene jaula amplia y conoce la dieta de las loras.", realizadaEn: haceDias(210, "11:45:00"), creadoEn: haceDias(213, "09:00:00") },
];

function diaRelativo(dias) {
  return sqlCrudo(dias < 0 ? `CURDATE() - INTERVAL ${-dias} DAY` : `CURDATE() + INTERVAL ${dias} DAY`);
}

const seguimientos = [
  { id: 1, solicitudId: 2, numero: 1, fechaProgramada: diaRelativo(46), fotoUrl: null, enviadoEn: null, estado: "Pendiente", comentarioAdmin: null, revisadoEn: null },
  { id: 2, solicitudId: 2, numero: 2, fechaProgramada: diaRelativo(136), fotoUrl: null, enviadoEn: null, estado: "Pendiente", comentarioAdmin: null, revisadoEn: null },
  { id: 3, solicitudId: 2, numero: 3, fechaProgramada: diaRelativo(226), fotoUrl: null, enviadoEn: null, estado: "Pendiente", comentarioAdmin: null, revisadoEn: null },
  { id: 4, solicitudId: 2, numero: 4, fechaProgramada: diaRelativo(316), fotoUrl: null, enviadoEn: null, estado: "Pendiente", comentarioAdmin: null, revisadoEn: null },
  { id: 5, solicitudId: 4, numero: 1, fechaProgramada: diaRelativo(-118), fotoUrl: "/uploads/mascotas/lara-control-1.jpg", enviadoEn: haceDias(116, "18:20:00"), estado: "Todo bien", comentarioAdmin: "Lara se ve sana, con buen plumaje y muy activa. Todo en orden, gracias por cuidarla.", revisadoEn: haceDias(115, "09:10:00") },
  { id: 6, solicitudId: 4, numero: 2, fechaProgramada: diaRelativo(-28), fotoUrl: null, enviadoEn: null, estado: "Pendiente", comentarioAdmin: null, revisadoEn: null },
  { id: 7, solicitudId: 4, numero: 3, fechaProgramada: diaRelativo(62), fotoUrl: null, enviadoEn: null, estado: "Pendiente", comentarioAdmin: null, revisadoEn: null },
  { id: 8, solicitudId: 4, numero: 4, fechaProgramada: diaRelativo(152), fotoUrl: null, enviadoEn: null, estado: "Pendiente", comentarioAdmin: null, revisadoEn: null },
];

const notificaciones = [
  { id: 1, usuarioId: 2, solicitudId: 4, texto: "Tu entrevista para adoptar a Lara quedó agendada. Revisa la fecha y el lugar en tu seguimiento.", leida: 1, creadoEn: haceDias(213, "09:00:00") },
  { id: 2, usuarioId: 2, solicitudId: 4, texto: "Tu solicitud para Lara fue aprobada.", leida: 1, creadoEn: haceDias(208, "10:00:00") },
  { id: 3, usuarioId: 2, solicitudId: 3, texto: "Tu entrevista para adoptar a Princesa Sucia quedó agendada. Revisa la fecha y el lugar en tu seguimiento.", leida: 1, creadoEn: haceDias(68, "10:00:00") },
  { id: 4, usuarioId: 2, solicitudId: 3, texto: "Tu solicitud para Princesa Sucia fue rechazada.", leida: 1, creadoEn: haceDias(64, "11:20:00") },
  { id: 5, usuarioId: 2, solicitudId: 2, texto: "Tu entrevista para adoptar a Encantador quedó agendada. Revisa la fecha y el lugar en tu seguimiento.", leida: 1, creadoEn: haceDias(48, "11:00:00") },
  { id: 6, usuarioId: 2, solicitudId: 2, texto: "Tu solicitud para Encantador fue aprobada.", leida: 0, creadoEn: haceDias(44, "16:40:00") },
  { id: 7, usuarioId: 2, solicitudId: null, texto: "Nueva mascota disponible: Cjotas", leida: 0, creadoEn: haceDias(6, "09:00:00") },
  { id: 8, usuarioId: 2, solicitudId: 1, texto: "Recibimos tu solicitud para Mechudo. Te avisaremos cuando el refugio agende tu entrevista.", leida: 1, creadoEn: haceDias(4, "10:15:00") },
  { id: 9, usuarioId: 2, solicitudId: 1, texto: "Tu entrevista para adoptar a Mechudo quedó agendada. Revisa la fecha y el lugar en tu seguimiento.", leida: 0, creadoEn: haceDias(2, "09:00:00") },
  { id: 11, usuarioId: 2, solicitudId: 4, texto: "Revisamos el control 1 de Lara: Todo bien. Lara se ve sana, con buen plumaje y muy activa.", leida: 1, creadoEn: haceDias(115, "09:10:00") },
  { id: 10, usuarioId: 3, solicitudId: 5, texto: "Recibimos tu solicitud para Vaquita. Te avisaremos cuando el refugio agende tu entrevista.", leida: 0, creadoEn: haceDias(1, "15:20:00") },
];

function marcadorContrasena(variable) {
  return `@@${variable}@@`;
}

module.exports = { tipos, usuarios, perfiles, mascotas, solicitudes, entrevistas, seguimientos, notificaciones, marcadorContrasena };
