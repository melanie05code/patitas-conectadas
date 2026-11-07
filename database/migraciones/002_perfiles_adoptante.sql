CREATE TABLE perfiles_adoptante (
  usuario_id INT UNSIGNED NOT NULL,
  tipo_vivienda ENUM('Casa', 'Apartamento', 'Cuarto', 'Otro') NOT NULL,
  tiene_patio BOOLEAN NOT NULL,
  personas_hogar TINYINT UNSIGNED NOT NULL,
  ingresos_estables BOOLEAN NOT NULL,
  tiene_otras_mascotas BOOLEAN NOT NULL,
  otras_mascotas_detalle VARCHAR(200) NULL,
  experiencia_previa BOOLEAN NOT NULL,
  experiencia_detalle VARCHAR(300) NULL,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_perfiles_adoptante PRIMARY KEY (usuario_id),
  CONSTRAINT fk_perfiles_adoptante_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT ck_perfiles_personas_hogar CHECK (personas_hogar BETWEEN 1 AND 20),
  CONSTRAINT ck_perfiles_otras_mascotas CHECK (tiene_otras_mascotas = FALSE OR CHAR_LENGTH(TRIM(otras_mascotas_detalle)) >= 3),
  CONSTRAINT ck_perfiles_experiencia CHECK (experiencia_previa = FALSE OR CHAR_LENGTH(TRIM(experiencia_detalle)) >= 3)
) ENGINE = InnoDB;
