USE patitas_conectadas;

START TRANSACTION;

INSERT INTO tipos_mascota (id, nombre) VALUES
  (1, 'Perro'),
  (2, 'Gato'),
  (3, 'Ave'),
  (4, 'Conejo'),
  (5, 'Cuyo'),
  (6, 'Hámster'),
  (7, 'Pez'),
  (8, 'Tortuga'),
  (9, 'Otro');

INSERT INTO usuarios (id, nombre, email, password_hash, rol) VALUES
  (1, 'Administrador Refugio', 'admin@patitas.com', '@@SEED_ADMIN_PASSWORD@@', 'admin'),
  (2, 'Edwin Obando', 'edwin.obando@correo.com', '@@SEED_ADOPTANTE_PASSWORD@@', 'adoptante'),
  (3, 'Ana Martínez', 'ana.martinez@correo.com', '@@SEED_ADOPTANTE2_PASSWORD@@', 'adoptante');

INSERT INTO perfiles_adoptante (usuario_id, tipo_vivienda, tiene_patio, personas_hogar, ingresos_estables, tiene_otras_mascotas, otras_mascotas_detalle, experiencia_previa, experiencia_detalle) VALUES
  (2, 'Apartamento', false, 2, true, true, 'Una gata adulta esterilizada y muy sociable.', true, 'Cuidé loras y gatos en casa de mis padres durante más de diez años.'),
  (3, 'Casa', true, 4, true, false, NULL, true, 'Crecí con perros en casa y hoy tengo tiempo para paseos diarios.');

INSERT INTO mascotas (id, nombre, tipo_id, edad, raza, sexo, descripcion, estado, foto_url) VALUES
  (1, 'Mechudo', 1, '5 años', 'Yorkshire Terrier', 'Macho', 'Pequeño, cariñoso y muy apegado a las personas. Le encanta que lo carguen y usar su suéter en los días frescos. Ideal para apartamento.', 'En proceso', '/uploads/mascotas/mechudo.jpg'),
  (2, 'Cjotas', 1, '4 meses', 'Mestizo', 'Macho', 'Cachorro curioso de pelaje blanco con manchitas grises. Un poco tímido al principio, pero muy noble cuando toma confianza.', 'Disponible', '/uploads/mascotas/cjotas.jpg'),
  (3, 'El Hambriento', 1, '3 años', 'Mestizo', 'Macho', 'Grande, tranquilo y siempre pendiente de la hora de comer. Es leal y protector, ideal para una casa con patio.', 'Disponible', '/uploads/mascotas/el-hambriento.jpg'),
  (4, 'Encantador', 2, '2 años', 'Común atigrado', 'Macho', 'Gato atigrado muy sociable y juguetón. Se lleva bien con otros gatos y le encanta tomar el sol.', 'Adoptada', '/uploads/mascotas/encantador.jpg'),
  (5, 'Dormilona', 1, '6 meses', 'Mestiza', 'Hembra', 'Cachorra dulce y tranquila que ama dormir panza arriba en su camita. Perfecta para una familia que busque una compañera calmada.', 'Disponible', '/uploads/mascotas/dormilona.jpg'),
  (6, 'Vaquita', 1, '2 años', 'Mestiza', 'Hembra', 'Blanca con negro, de ahí su nombre. Muy cariñosa, le encanta que le rasquen la pancita y se lleva bien con niños.', 'En proceso', '/uploads/mascotas/vaquita.jpg'),
  (7, 'Calenturiento', 2, '1 año', 'Pelo largo atigrado', 'Macho', 'Gato de pelo largo con mucha personalidad y caras graciosas. Activo, curioso y muy expresivo.', 'Disponible', '/uploads/mascotas/calenturiento.jpg'),
  (8, 'Princesa Sucia', 1, '6 años', 'Poodle mestiza', 'Hembra', 'Pequeña de pelo rizado, tranquila y obediente. Le gusta jugar en el patio aunque termine llena de tierra. Necesita baños frecuentes.', 'Disponible', '/uploads/mascotas/princesa-sucia.jpg'),
  (9, 'Mordelona', 1, '3 años', 'Mestiza', 'Hembra', 'Juguetona y llena de energía; muerde suavecito cuando juega. Ideal para alguien activo con tiempo para paseos.', 'Disponible', '/uploads/mascotas/mordelona.jpg'),
  (10, 'Lara', 3, '4 años', 'Lora de frente roja', 'Hembra', 'Lora verde muy sociable que disfruta estar en el hombro de las personas. Requiere un adoptante con experiencia en aves.', 'Adoptada', '/uploads/mascotas/lara.jpg');

INSERT INTO solicitudes (id, mascota_id, usuario_id, telefono, direccion, motivo, estado, fecha, respondida_en, actualizado_en) VALUES
  (1, 1, 2, '8888-1234', 'Barrio Altamira, Managua', 'Vivo en un apartamento tranquilo y trabajo desde casa, así que Mechudo tendría compañía todo el día.', 'Entrevista programada', TIMESTAMP(CURDATE() - INTERVAL 4 DAY, '10:15:00'), NULL, TIMESTAMP(CURDATE() - INTERVAL 2 DAY, '09:00:00')),
  (2, 4, 2, '8888-1234', 'Barrio Altamira, Managua', 'Ya tengo una gata adulta muy sociable y quiero darle un compañero de juegos.', 'Aprobada', TIMESTAMP(CURDATE() - INTERVAL 50 DAY, '09:30:00'), TIMESTAMP(CURDATE() - INTERVAL 44 DAY, '16:40:00'), TIMESTAMP(CURDATE() - INTERVAL 44 DAY, '16:40:00')),
  (3, 8, 2, '8888-1234', 'Barrio Altamira, Managua', 'Me encantan los perros pequeños y tengo un patio donde puede jugar.', 'Rechazada', TIMESTAMP(CURDATE() - INTERVAL 70 DAY, '14:05:00'), TIMESTAMP(CURDATE() - INTERVAL 64 DAY, '11:20:00'), TIMESTAMP(CURDATE() - INTERVAL 64 DAY, '11:20:00')),
  (4, 10, 2, '8888-1234', 'Barrio Altamira, Managua', 'Crié loras durante años en casa de mis padres y tengo experiencia con su alimentación y cuidados.', 'Aprobada', TIMESTAMP(CURDATE() - INTERVAL 215 DAY, '08:45:00'), TIMESTAMP(CURDATE() - INTERVAL 208 DAY, '10:00:00'), TIMESTAMP(CURDATE() - INTERVAL 208 DAY, '10:00:00')),
  (5, 6, 3, '8777-4321', 'Residencial Los Robles, Managua', 'Tenemos una casa con patio y dos niños que sueñan con una perrita cariñosa como Vaquita.', 'Solicitada', TIMESTAMP(CURDATE() - INTERVAL 1 DAY, '15:20:00'), NULL, TIMESTAMP(CURDATE() - INTERVAL 1 DAY, '15:20:00'));

INSERT INTO entrevistas (id, solicitud_id, fecha_hora, lugar, notas_admin, realizada_en, creado_en) VALUES
  (1, 1, TIMESTAMP(CURDATE() + INTERVAL 3 DAY + INTERVAL (DAYOFWEEK(CURDATE() + INTERVAL 3 DAY) = 1) DAY, '10:30:00'), 'Barrio Las Flores, de la iglesia 2 c. al lago, 1 c. arriba, Managua', NULL, NULL, TIMESTAMP(CURDATE() - INTERVAL 2 DAY, '09:00:00')),
  (2, 2, TIMESTAMP(CURDATE() - INTERVAL 45 DAY, '09:30:00'), 'Barrio Las Flores, de la iglesia 2 c. al lago, 1 c. arriba, Managua', 'Edwin conoce a Encantador y su gata convive bien con otros gatos. Se recomienda una presentación gradual.', TIMESTAMP(CURDATE() - INTERVAL 45 DAY, '10:05:00'), TIMESTAMP(CURDATE() - INTERVAL 48 DAY, '11:00:00')),
  (3, 3, TIMESTAMP(CURDATE() - INTERVAL 65 DAY, '14:00:00'), 'Barrio Las Flores, de la iglesia 2 c. al lago, 1 c. arriba, Managua', 'Se rechaza: el apartamento no tiene patio ni área exterior y Princesa Sucia necesita espacio para jugar todos los días.', TIMESTAMP(CURDATE() - INTERVAL 65 DAY, '14:40:00'), TIMESTAMP(CURDATE() - INTERVAL 68 DAY, '10:00:00')),
  (4, 4, TIMESTAMP(CURDATE() - INTERVAL 210 DAY, '11:00:00'), 'Barrio Las Flores, de la iglesia 2 c. al lago, 1 c. arriba, Managua', 'Experiencia comprobada con aves. Tiene jaula amplia y conoce la dieta de las loras.', TIMESTAMP(CURDATE() - INTERVAL 210 DAY, '11:45:00'), TIMESTAMP(CURDATE() - INTERVAL 213 DAY, '09:00:00'));

INSERT INTO seguimientos (id, solicitud_id, numero, fecha_programada, foto_url, enviado_en, estado, comentario_admin, revisado_en) VALUES
  (1, 2, 1, CURDATE() + INTERVAL 46 DAY, NULL, NULL, 'Pendiente', NULL, NULL),
  (2, 2, 2, CURDATE() + INTERVAL 136 DAY, NULL, NULL, 'Pendiente', NULL, NULL),
  (3, 2, 3, CURDATE() + INTERVAL 226 DAY, NULL, NULL, 'Pendiente', NULL, NULL),
  (4, 2, 4, CURDATE() + INTERVAL 316 DAY, NULL, NULL, 'Pendiente', NULL, NULL),
  (5, 4, 1, CURDATE() - INTERVAL 118 DAY, '/uploads/mascotas/lara-control-1.jpg', TIMESTAMP(CURDATE() - INTERVAL 116 DAY, '18:20:00'), 'Todo bien', 'Lara se ve sana, con buen plumaje y muy activa. Todo en orden, gracias por cuidarla.', TIMESTAMP(CURDATE() - INTERVAL 115 DAY, '09:10:00')),
  (6, 4, 2, CURDATE() - INTERVAL 28 DAY, NULL, NULL, 'Pendiente', NULL, NULL),
  (7, 4, 3, CURDATE() + INTERVAL 62 DAY, NULL, NULL, 'Pendiente', NULL, NULL),
  (8, 4, 4, CURDATE() + INTERVAL 152 DAY, NULL, NULL, 'Pendiente', NULL, NULL);

INSERT INTO notificaciones (id, usuario_id, solicitud_id, texto, leida, creado_en) VALUES
  (1, 2, 4, 'Tu entrevista para adoptar a Lara quedó agendada. Revisa la fecha y el lugar en tu seguimiento.', 1, TIMESTAMP(CURDATE() - INTERVAL 213 DAY, '09:00:00')),
  (2, 2, 4, 'Tu solicitud para Lara fue aprobada.', 1, TIMESTAMP(CURDATE() - INTERVAL 208 DAY, '10:00:00')),
  (3, 2, 3, 'Tu entrevista para adoptar a Princesa Sucia quedó agendada. Revisa la fecha y el lugar en tu seguimiento.', 1, TIMESTAMP(CURDATE() - INTERVAL 68 DAY, '10:00:00')),
  (4, 2, 3, 'Tu solicitud para Princesa Sucia fue rechazada.', 1, TIMESTAMP(CURDATE() - INTERVAL 64 DAY, '11:20:00')),
  (5, 2, 2, 'Tu entrevista para adoptar a Encantador quedó agendada. Revisa la fecha y el lugar en tu seguimiento.', 1, TIMESTAMP(CURDATE() - INTERVAL 48 DAY, '11:00:00')),
  (6, 2, 2, 'Tu solicitud para Encantador fue aprobada.', 0, TIMESTAMP(CURDATE() - INTERVAL 44 DAY, '16:40:00')),
  (7, 2, NULL, 'Nueva mascota disponible: Cjotas', 0, TIMESTAMP(CURDATE() - INTERVAL 6 DAY, '09:00:00')),
  (8, 2, 1, 'Recibimos tu solicitud para Mechudo. Te avisaremos cuando el refugio agende tu entrevista.', 1, TIMESTAMP(CURDATE() - INTERVAL 4 DAY, '10:15:00')),
  (9, 2, 1, 'Tu entrevista para adoptar a Mechudo quedó agendada. Revisa la fecha y el lugar en tu seguimiento.', 0, TIMESTAMP(CURDATE() - INTERVAL 2 DAY, '09:00:00')),
  (11, 2, 4, 'Revisamos el control 1 de Lara: Todo bien. Lara se ve sana, con buen plumaje y muy activa.', 1, TIMESTAMP(CURDATE() - INTERVAL 115 DAY, '09:10:00')),
  (10, 3, 5, 'Recibimos tu solicitud para Vaquita. Te avisaremos cuando el refugio agende tu entrevista.', 0, TIMESTAMP(CURDATE() - INTERVAL 1 DAY, '15:20:00'));

COMMIT;
