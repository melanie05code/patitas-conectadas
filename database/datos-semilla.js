const tipos = [
  { id: 1, nombre: "Perro", icono: "🐶" },
  { id: 2, nombre: "Gato", icono: "🐱" },
  { id: 3, nombre: "Ave", icono: "🦜" },
  { id: 4, nombre: "Conejo", icono: "🐰" },
  { id: 5, nombre: "Cuyo", icono: "🐹" },
  { id: 6, nombre: "Hámster", icono: "🐹" },
  { id: 7, nombre: "Pez", icono: "🐟" },
  { id: 8, nombre: "Tortuga", icono: "🐢" },
  { id: 9, nombre: "Otro", icono: "🐾" },
];

const usuarios = [
  { id: 1, nombre: "Administrador Refugio", email: "admin@patitas.com", password: "Admin2026", rol: "admin" },
  { id: 2, nombre: "Edwin Obando", email: "edwin.obando@correo.com", password: "Edwin2026", rol: "adoptante" },
];

const mascotas = [
  { id: 1, nombre: "Mechudo", tipoId: 1, edad: "5 años", raza: "Yorkshire Terrier", sexo: "Macho", estado: "En proceso", foto: "mechudo.jpg", descripcion: "Pequeño, cariñoso y muy apegado a las personas. Le encanta que lo carguen y usar su suéter en los días frescos. Ideal para apartamento." },
  { id: 2, nombre: "Cjotas", tipoId: 1, edad: "4 meses", raza: "Mestizo", sexo: "Macho", estado: "Disponible", foto: "cjotas.jpg", descripcion: "Cachorro curioso de pelaje blanco con manchitas grises. Un poco tímido al principio, pero muy noble cuando toma confianza." },
  { id: 3, nombre: "El Hambriento", tipoId: 1, edad: "3 años", raza: "Mestizo", sexo: "Macho", estado: "Disponible", foto: "el-hambriento.jpg", descripcion: "Grande, tranquilo y siempre pendiente de la hora de comer. Es leal y protector, ideal para una casa con patio." },
  { id: 4, nombre: "Encantador", tipoId: 2, edad: "2 años", raza: "Común atigrado", sexo: "Macho", estado: "Adoptada", foto: "encantador.jpg", descripcion: "Gato atigrado muy sociable y juguetón. Se lleva bien con otros gatos y le encanta tomar el sol." },
  { id: 5, nombre: "Dormilona", tipoId: 1, edad: "6 meses", raza: "Mestiza", sexo: "Hembra", estado: "Disponible", foto: "dormilona.jpg", descripcion: "Cachorra dulce y tranquila que ama dormir panza arriba en su camita. Perfecta para una familia que busque una compañera calmada." },
  { id: 6, nombre: "Vaquita", tipoId: 1, edad: "2 años", raza: "Mestiza", sexo: "Hembra", estado: "Disponible", foto: "vaquita.jpg", descripcion: "Blanca con negro, de ahí su nombre. Muy cariñosa, le encanta que le rasquen la pancita y se lleva bien con niños." },
  { id: 7, nombre: "Calenturiento", tipoId: 2, edad: "1 año", raza: "Pelo largo atigrado", sexo: "Macho", estado: "Disponible", foto: "calenturiento.jpg", descripcion: "Gato de pelo largo con mucha personalidad y caras graciosas. Activo, curioso y muy expresivo." },
  { id: 8, nombre: "Princesa Sucia", tipoId: 1, edad: "6 años", raza: "Poodle mestiza", sexo: "Hembra", estado: "Disponible", foto: "princesa-sucia.jpg", descripcion: "Pequeña de pelo rizado, tranquila y obediente. Le gusta jugar en el patio aunque termine llena de tierra. Necesita baños frecuentes." },
  { id: 9, nombre: "Mordelona", tipoId: 1, edad: "3 años", raza: "Mestiza", sexo: "Hembra", estado: "Disponible", foto: "mordelona.jpg", descripcion: "Juguetona y llena de energía; muerde suavecito cuando juega. Ideal para alguien activo con tiempo para paseos." },
  { id: 10, nombre: "Lara", tipoId: 3, edad: "4 años", raza: "Lora de frente roja", sexo: "Hembra", estado: "Adoptada", foto: "lara.jpg", descripcion: "Lora verde muy sociable que disfruta estar en el hombro de las personas. Requiere un adoptante con experiencia en aves." },
];

const solicitudes = [
  { id: 1, mascotaId: 1, usuarioId: 2, telefono: "8888-1234", direccion: "Barrio Altamira, Managua", motivo: "Vivo en un apartamento tranquilo y trabajo desde casa, así que Mechudo tendría compañía todo el día.", estado: "En revisión", fecha: "2026-10-20 10:15:00", actualizadoEn: "2026-10-20 10:15:00" },
  { id: 2, mascotaId: 4, usuarioId: 2, telefono: "8888-1234", direccion: "Barrio Altamira, Managua", motivo: "Ya tengo una gata adulta muy sociable y quiero darle un compañero de juegos.", estado: "Aprobada", fecha: "2026-10-02 09:30:00", actualizadoEn: "2026-10-06 16:40:00" },
  { id: 3, mascotaId: 8, usuarioId: 2, telefono: "8888-1234", direccion: "Barrio Altamira, Managua", motivo: "Me encantan los perros pequeños y tengo un patio donde puede jugar.", estado: "Rechazada", fecha: "2026-09-25 14:05:00", actualizadoEn: "2026-09-29 11:20:00" },
  { id: 4, mascotaId: 10, usuarioId: 2, telefono: "8888-1234", direccion: "Barrio Altamira, Managua", motivo: "Crié loras durante años en casa de mis padres y tengo experiencia con su alimentación y cuidados.", estado: "Aprobada", fecha: "2026-09-10 08:45:00", actualizadoEn: "2026-09-15 10:00:00" },
];

const notificaciones = [
  { id: 1, usuarioId: 2, solicitudId: 4, texto: "¡Tu solicitud para Lara fue aprobada!", leida: 1, creadoEn: "2026-09-15 10:00:00" },
  { id: 2, usuarioId: 2, solicitudId: 3, texto: "Tu solicitud para Princesa Sucia fue rechazada.", leida: 1, creadoEn: "2026-09-29 11:20:00" },
  { id: 3, usuarioId: 2, solicitudId: 2, texto: "¡Tu solicitud para Encantador fue aprobada!", leida: 0, creadoEn: "2026-10-06 16:40:00" },
  { id: 4, usuarioId: 2, solicitudId: 1, texto: "Tu solicitud para Mechudo está en revisión.", leida: 0, creadoEn: "2026-10-20 10:15:00" },
  { id: 5, usuarioId: 2, solicitudId: null, texto: "Nueva mascota disponible: Cjotas", leida: 0, creadoEn: "2026-10-21 09:00:00" },
];

module.exports = { tipos, usuarios, mascotas, solicitudes, notificaciones };
