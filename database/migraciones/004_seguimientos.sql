CREATE TABLE seguimientos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  solicitud_id INT UNSIGNED NOT NULL,
  numero TINYINT UNSIGNED NOT NULL,
  fecha_programada DATE NOT NULL,
  foto_url VARCHAR(255) NULL,
  enviado_en DATETIME NULL,
  estado ENUM('Pendiente', 'Enviado', 'Todo bien', 'Requiere atención') NOT NULL DEFAULT 'Pendiente',
  comentario_admin VARCHAR(500) NULL,
  revisado_en DATETIME NULL,
  CONSTRAINT pk_seguimientos PRIMARY KEY (id),
  CONSTRAINT uq_seguimientos_solicitud_numero UNIQUE (solicitud_id, numero),
  CONSTRAINT fk_seguimientos_solicitud FOREIGN KEY (solicitud_id)
    REFERENCES solicitudes (id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT ck_seguimientos_numero CHECK (numero BETWEEN 1 AND 24),
  CONSTRAINT ck_seguimientos_foto CHECK (estado = 'Pendiente' OR foto_url IS NOT NULL),
  CONSTRAINT ck_seguimientos_revision CHECK (estado NOT IN ('Todo bien', 'Requiere atención') OR CHAR_LENGTH(TRIM(comentario_admin)) >= 3),
  INDEX ix_seguimientos_estado_fecha (estado, fecha_programada)
) ENGINE = InnoDB;

ALTER TABLE notificaciones
  ADD COLUMN recordatorio_seguimiento_id INT UNSIGNED NULL,
  ADD CONSTRAINT uq_notificaciones_recordatorio UNIQUE (recordatorio_seguimiento_id),
  ADD CONSTRAINT fk_notificaciones_recordatorio FOREIGN KEY (recordatorio_seguimiento_id)
    REFERENCES seguimientos (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
