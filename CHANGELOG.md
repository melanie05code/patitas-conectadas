# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Las fechas son las de integración en `main` según GitHub (UTC).

## [v1.0.0] — 2026-11-07 · Entrega final del III Parcial

Primera versión estable: proceso de adopción completo, verificado y documentado.

### Agregado
- Suite final de V&V: 50 casos Jest + Supertest (PR-01 a PR-50), **16 casos E2E con Playwright** (`npm run test:e2e`) y 3 verificaciones operativas, con 69/69 aprobados el 2026-11-07 ([doc 14](docs/14_suite_vv_final.md)).
- Medición de tiempos de respuesta (`npm run medir:tiempos`) para RNF-01.
- Capturas del manual (`npm run capturas:manual`).
- Documentación de cierre: suite V&V (14), bitácora de defectos (15), producto final (16), manual de usuario (17), respaldo y recuperación con ejecución real (18), matriz de trazabilidad (19), matriz de correcciones (20), informe final de calidad (21), autoverificación con la rúbrica (22) y evaluación heurística de usabilidad (23).
- El CI también se ejecuta al actualizar `main`.

### Corregido
- La barra de navegación desbordaba en el celular (DEF-21).
- El instalador aceptaba las contraseñas `EJEMPLO_` de `.env.example` (DEF-22).
- README: `npm ci`, variables nuevas y migraciones, verificados con una instalación desde cero.

### Seguridad
- `respaldos/` excluido de Git.

## [Proceso de adopción completo] — 2026-11-07 · PR #14, #16 y #17

### Agregado
- **Perfil del adoptante** obligatorio antes de solicitar (RF-11): `GET`/`PUT /api/perfil-adoptante`, página *Mi perfil* y migración `002`.
- **Etapas de la solicitud:** Solicitada → Entrevista programada → Entrevistada → Aprobada / Rechazada (RF-05, RF-08), con línea de tiempo de 5 etapas en el seguimiento.
- **Entrevistas** (RF-12): calendario mensual propio, horarios libres u ocupados, reprogramación, marca de realizada, agenda semanal y configuración del refugio (migración `003`).
- **Seguimiento post-adopción** (RF-13, RF-14): controles cada 90 días durante 1 año (configurables), foto con vista previa, revisión "Todo bien" / "Requiere atención" con comentario (migración `004`).
- **Recordatorios** idempotentes de controles vencidos (RF-15), sin cron, y `npm run recordatorios`.
- Notificaciones de entrevista agendada o reprogramada, resultado, recordatorio y revisión (RF-07).
- Seed con fechas relativas al día de la instalación y una segunda adoptante ficticia.

### Cambiado
- Aprobar exige la entrevista realizada; rechazar se permite en cualquier etapa activa y libera el horario.
- El ETL convierte "En revisión" en "Solicitada".

### Corregido
- DEF-19 (ETL) y DEF-20 (autoasignación en la migración 003, SonarCloud).

## [Interfaz sin emojis] — 2026-11-07 · PR #13

### Cambiado
- Todos los emojis de la interfaz, los mensajes y los datos semilla se reemplazaron por texto o iconos SVG en línea con la paleta del sitio; solo queda la huella del logo.

### Eliminado
- Columna `tipos_mascota.icono`, con la migración `001`.

### Agregado
- Migraciones numeradas del esquema (`database/migraciones/`, `npm run db:migrar`) y las pruebas PR-32 y PR-33.

## [Calidad y seguridad] — 2026-11-07 · PR #12

### Agregado
- Pipeline de GitHub Actions con Jest + cobertura, SonarCloud, DeepSource y Snyk ([doc 13](docs/13_calidad_seguridad.md)).
- Pruebas PR-29 a PR-31.

### Seguridad
- Contraseñas y hashes demo fuera del repositorio (variables `SEED_*`).
- Path Traversal en el borrado de fotos, ReDoS en la validación del correo, dependencia `qs` actualizada.
- Fallos inyectados a propósito para validar las herramientas (command injection, código duplicado, lodash vulnerable), detectados y corregidos.

### Corregido
- Promesas sin manejar, etiquetas sin `for`, funciones en bloques anidados y variables sin usar.

## [II Parcial — Backend real] — 2026-10-25 · PR #1 a #11

### Agregado
- Backend Node.js + Express 5 en capas, MySQL 8.0 con integridad referencial y transacciones, autenticación bcrypt + JWT.
- Catálogo con tipos administrables, solicitudes con transacciones, notificaciones internas, subida de fotos y fotos reales.
- 28 pruebas Jest + Supertest, migración ETL desde el localStorage del prototipo y documentación 00 a 12.

### Corregido
- Observaciones del I Parcial: contraseñas en texto plano, validación solo en el navegador, criterios de aceptación incompletos, hallazgos de usabilidad 3 y 4 ([doc 20](docs/20_matriz_correcciones.md)).

## [Hito 1 — Prototipo] — 2026-08-22

### Agregado
- Prototipo HTML/CSS/JavaScript con datos en el `localStorage` del navegador: catálogo, solicitud, seguimiento, notificaciones y panel administrativo simulados.
- Documentos de alcance, requisitos, arquitectura propuesta y evaluación heurística ([`docs/hito1/`](docs/hito1/)).
