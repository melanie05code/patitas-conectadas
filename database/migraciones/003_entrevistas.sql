ALTER TABLE solicitudes
  DROP INDEX uq_solicitudes_una_en_revision,
  DROP COLUMN mascota_en_revision;

ALTER TABLE solicitudes
  MODIFY estado ENUM('En revisión', 'Solicitada', 'Entrevista programada', 'Entrevistada', 'Aprobada', 'Rechazada') NOT NULL DEFAULT 'Solicitada';

UPDATE solicitudes SET estado = 'Solicitada' WHERE estado = 'En revisión';

ALTER TABLE solicitudes
  MODIFY estado ENUM('Solicitada', 'Entrevista programada', 'Entrevistada', 'Aprobada', 'Rechazada') NOT NULL DEFAULT 'Solicitada',
  ADD COLUMN respondida_en DATETIME NULL AFTER fecha,
  ADD COLUMN mascota_activa INT UNSIGNED
    GENERATED ALWAYS AS (IF(estado IN ('Solicitada', 'Entrevista programada', 'Entrevistada'), mascota_id, NULL)) STORED,
  ADD CONSTRAINT uq_solicitudes_una_activa UNIQUE (mascota_activa);

UPDATE solicitudes SET respondida_en = actualizado_en, actualizado_en = actualizado_en WHERE estado IN ('Aprobada', 'Rechazada');

CREATE TABLE configuracion_refugio (
  id TINYINT UNSIGNED NOT NULL DEFAULT 1,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  hora_apertura TIME NOT NULL,
  hora_cierre TIME NOT NULL,
  dias_atencion SET('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo') NOT NULL,
  duracion_cita_min SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_configuracion_refugio PRIMARY KEY (id),
  CONSTRAINT ck_configuracion_refugio_unica CHECK (id = 1),
  CONSTRAINT ck_configuracion_refugio_horario CHECK (hora_apertura < hora_cierre),
  CONSTRAINT ck_configuracion_refugio_duracion CHECK (duracion_cita_min BETWEEN 15 AND 240),
  CONSTRAINT ck_configuracion_refugio_direccion CHECK (CHAR_LENGTH(TRIM(direccion)) >= 5)
) ENGINE = InnoDB;

INSERT INTO configuracion_refugio (id, nombre, direccion, telefono, hora_apertura, hora_cierre, dias_atencion, duracion_cita_min)
VALUES (
  1,
  'Refugio Patitas Conectadas',
  'Barrio Las Flores, de la iglesia 2 c. al lago, 1 c. arriba, Managua',
  '+505 8888-0000',
  '09:00:00',
  '16:00:00',
  'lunes,martes,miercoles,jueves,viernes,sabado',
  30
);

CREATE TABLE entrevistas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  solicitud_id INT UNSIGNED NOT NULL,
  fecha_hora DATETIME NOT NULL,
  lugar VARCHAR(255) NOT NULL,
  notas_admin TEXT NULL,
  realizada_en DATETIME NULL,
  cancelada_en DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  horario_ocupado DATETIME
    GENERATED ALWAYS AS (IF(cancelada_en IS NULL, fecha_hora, NULL)) STORED,
  CONSTRAINT pk_entrevistas PRIMARY KEY (id),
  CONSTRAINT uq_entrevistas_solicitud UNIQUE (solicitud_id),
  CONSTRAINT uq_entrevistas_horario UNIQUE (horario_ocupado),
  CONSTRAINT fk_entrevistas_solicitud FOREIGN KEY (solicitud_id)
    REFERENCES solicitudes (id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT ck_entrevistas_lugar CHECK (CHAR_LENGTH(TRIM(lugar)) >= 5),
  INDEX ix_entrevistas_fecha (fecha_hora)
) ENGINE = InnoDB;
