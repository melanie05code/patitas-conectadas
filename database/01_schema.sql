CREATE DATABASE IF NOT EXISTS patitas_conectadas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE patitas_conectadas;

DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS solicitudes;
DROP TABLE IF EXISTS mascotas;
DROP TABLE IF EXISTS tipos_mascota;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash CHAR(60) NOT NULL,
  rol ENUM('adoptante', 'admin') NOT NULL DEFAULT 'adoptante',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_usuarios PRIMARY KEY (id),
  CONSTRAINT uq_usuarios_email UNIQUE (email),
  CONSTRAINT ck_usuarios_nombre CHECK (CHAR_LENGTH(TRIM(nombre)) >= 2),
  CONSTRAINT ck_usuarios_email CHECK (email REGEXP '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$')
) ENGINE = InnoDB;

CREATE TABLE tipos_mascota (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(40) NOT NULL,
  icono VARCHAR(16) NOT NULL DEFAULT '🐾',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_tipos_mascota PRIMARY KEY (id),
  CONSTRAINT uq_tipos_mascota_nombre UNIQUE (nombre),
  CONSTRAINT ck_tipos_mascota_nombre CHECK (CHAR_LENGTH(TRIM(nombre)) >= 2)
) ENGINE = InnoDB;

CREATE TABLE mascotas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(60) NOT NULL,
  tipo_id INT UNSIGNED NOT NULL,
  edad VARCHAR(30) NOT NULL,
  raza VARCHAR(80) NOT NULL,
  sexo ENUM('Macho', 'Hembra') NOT NULL,
  descripcion TEXT NOT NULL,
  estado ENUM('Disponible', 'En proceso', 'Adoptada') NOT NULL DEFAULT 'Disponible',
  foto_url VARCHAR(255) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_mascotas PRIMARY KEY (id),
  CONSTRAINT fk_mascotas_tipo FOREIGN KEY (tipo_id)
    REFERENCES tipos_mascota (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT ck_mascotas_nombre CHECK (CHAR_LENGTH(TRIM(nombre)) >= 1),
  INDEX ix_mascotas_estado_tipo (estado, tipo_id),
  INDEX ix_mascotas_nombre (nombre)
) ENGINE = InnoDB;

CREATE TABLE solicitudes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  mascota_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  telefono CHAR(9) NOT NULL,
  direccion VARCHAR(200) NOT NULL,
  motivo VARCHAR(1000) NOT NULL,
  estado ENUM('En revisión', 'Aprobada', 'Rechazada') NOT NULL DEFAULT 'En revisión',
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  mascota_en_revision INT UNSIGNED
    GENERATED ALWAYS AS (IF(estado = 'En revisión', mascota_id, NULL)) STORED,
  mascota_aprobada INT UNSIGNED
    GENERATED ALWAYS AS (IF(estado = 'Aprobada', mascota_id, NULL)) STORED,
  CONSTRAINT pk_solicitudes PRIMARY KEY (id),
  CONSTRAINT fk_solicitudes_mascota FOREIGN KEY (mascota_id)
    REFERENCES mascotas (id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT fk_solicitudes_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT uq_solicitudes_una_en_revision UNIQUE (mascota_en_revision),
  CONSTRAINT uq_solicitudes_una_aprobada UNIQUE (mascota_aprobada),
  CONSTRAINT ck_solicitudes_telefono CHECK (telefono REGEXP '^[0-9]{4}-[0-9]{4}$'),
  CONSTRAINT ck_solicitudes_direccion CHECK (CHAR_LENGTH(TRIM(direccion)) >= 5),
  CONSTRAINT ck_solicitudes_motivo CHECK (CHAR_LENGTH(TRIM(motivo)) >= 10),
  INDEX ix_solicitudes_usuario (usuario_id, fecha),
  INDEX ix_solicitudes_estado (estado)
) ENGINE = InnoDB;

CREATE TABLE notificaciones (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NOT NULL,
  solicitud_id INT UNSIGNED NULL,
  texto VARCHAR(255) NOT NULL,
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_notificaciones PRIMARY KEY (id),
  CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_notificaciones_solicitud FOREIGN KEY (solicitud_id)
    REFERENCES solicitudes (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  INDEX ix_notificaciones_usuario_leida (usuario_id, leida, creado_en)
) ENGINE = InnoDB;
