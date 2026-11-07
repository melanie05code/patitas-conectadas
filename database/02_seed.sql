USE patitas_conectadas;

START TRANSACTION;

INSERT INTO tipos_mascota (id, nombre, icono) VALUES
  (1, 'Perro', '🐶'),
  (2, 'Gato', '🐱'),
  (3, 'Ave', '🦜'),
  (4, 'Conejo', '🐰'),
  (5, 'Cuyo', '🐹'),
  (6, 'Hámster', '🐹'),
  (7, 'Pez', '🐟'),
  (8, 'Tortuga', '🐢'),
  (9, 'Otro', '🐾');

INSERT INTO usuarios (id, nombre, email, password_hash, rol) VALUES
  (1, 'Administrador Refugio', 'admin@patitas.com', '@@SEED_ADMIN_PASSWORD@@', 'admin'),
  (2, 'Edwin Obando', 'edwin.obando@correo.com', '@@SEED_ADOPTANTE_PASSWORD@@', 'adoptante');

INSERT INTO mascotas (id, nombre, tipo_id, edad, raza, sexo, descripcion, estado, foto_url) VALUES
  (1, 'Mechudo', 1, '5 años', 'Yorkshire Terrier', 'Macho', 'Pequeño, cariñoso y muy apegado a las personas. Le encanta que lo carguen y usar su suéter en los días frescos. Ideal para apartamento.', 'En proceso', '/uploads/mascotas/mechudo.jpg'),
  (2, 'Cjotas', 1, '4 meses', 'Mestizo', 'Macho', 'Cachorro curioso de pelaje blanco con manchitas grises. Un poco tímido al principio, pero muy noble cuando toma confianza.', 'Disponible', '/uploads/mascotas/cjotas.jpg'),
  (3, 'El Hambriento', 1, '3 años', 'Mestizo', 'Macho', 'Grande, tranquilo y siempre pendiente de la hora de comer. Es leal y protector, ideal para una casa con patio.', 'Disponible', '/uploads/mascotas/el-hambriento.jpg'),
  (4, 'Encantador', 2, '2 años', 'Común atigrado', 'Macho', 'Gato atigrado muy sociable y juguetón. Se lleva bien con otros gatos y le encanta tomar el sol.', 'Adoptada', '/uploads/mascotas/encantador.jpg'),
  (5, 'Dormilona', 1, '6 meses', 'Mestiza', 'Hembra', 'Cachorra dulce y tranquila que ama dormir panza arriba en su camita. Perfecta para una familia que busque una compañera calmada.', 'Disponible', '/uploads/mascotas/dormilona.jpg'),
  (6, 'Vaquita', 1, '2 años', 'Mestiza', 'Hembra', 'Blanca con negro, de ahí su nombre. Muy cariñosa, le encanta que le rasquen la pancita y se lleva bien con niños.', 'Disponible', '/uploads/mascotas/vaquita.jpg'),
  (7, 'Calenturiento', 2, '1 año', 'Pelo largo atigrado', 'Macho', 'Gato de pelo largo con mucha personalidad y caras graciosas. Activo, curioso y muy expresivo.', 'Disponible', '/uploads/mascotas/calenturiento.jpg'),
  (8, 'Princesa Sucia', 1, '6 años', 'Poodle mestiza', 'Hembra', 'Pequeña de pelo rizado, tranquila y obediente. Le gusta jugar en el patio aunque termine llena de tierra. Necesita baños frecuentes.', 'Disponible', '/uploads/mascotas/princesa-sucia.jpg'),
  (9, 'Mordelona', 1, '3 años', 'Mestiza', 'Hembra', 'Juguetona y llena de energía; muerde suavecito cuando juega. Ideal para alguien activo con tiempo para paseos.', 'Disponible', '/uploads/mascotas/mordelona.jpg'),
  (10, 'Lara', 3, '4 años', 'Lora de frente roja', 'Hembra', 'Lora verde muy sociable que disfruta estar en el hombro de las personas. Requiere un adoptante con experiencia en aves.', 'Adoptada', '/uploads/mascotas/lara.jpg');

INSERT INTO solicitudes (id, mascota_id, usuario_id, telefono, direccion, motivo, estado, fecha, actualizado_en) VALUES
  (1, 1, 2, '8888-1234', 'Barrio Altamira, Managua', 'Vivo en un apartamento tranquilo y trabajo desde casa, así que Mechudo tendría compañía todo el día.', 'En revisión', '2026-10-20 10:15:00', '2026-10-20 10:15:00'),
  (2, 4, 2, '8888-1234', 'Barrio Altamira, Managua', 'Ya tengo una gata adulta muy sociable y quiero darle un compañero de juegos.', 'Aprobada', '2026-10-02 09:30:00', '2026-10-06 16:40:00'),
  (3, 8, 2, '8888-1234', 'Barrio Altamira, Managua', 'Me encantan los perros pequeños y tengo un patio donde puede jugar.', 'Rechazada', '2026-09-25 14:05:00', '2026-09-29 11:20:00'),
  (4, 10, 2, '8888-1234', 'Barrio Altamira, Managua', 'Crié loras durante años en casa de mis padres y tengo experiencia con su alimentación y cuidados.', 'Aprobada', '2026-09-10 08:45:00', '2026-09-15 10:00:00');

INSERT INTO notificaciones (id, usuario_id, solicitud_id, texto, leida, creado_en) VALUES
  (1, 2, 4, '¡Tu solicitud para Lara fue aprobada!', 1, '2026-09-15 10:00:00'),
  (2, 2, 3, 'Tu solicitud para Princesa Sucia fue rechazada.', 1, '2026-09-29 11:20:00'),
  (3, 2, 2, '¡Tu solicitud para Encantador fue aprobada!', 0, '2026-10-06 16:40:00'),
  (4, 2, 1, 'Tu solicitud para Mechudo está en revisión.', 0, '2026-10-20 10:15:00'),
  (5, 2, NULL, 'Nueva mascota disponible: Cjotas', 0, '2026-10-21 09:00:00');

COMMIT;
