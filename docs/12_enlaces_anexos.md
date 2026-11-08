# 12. Enlaces y anexos

## 12.1 Enlaces

| Recurso | Enlace |
|---|---|
| Repositorio en GitHub | https://github.com/melanie05code/patitas-conectadas |
| **Release `v1.0.0` (entrega final)** | https://github.com/melanie05code/patitas-conectadas/releases/tag/v1.0.0 |
| **Video de defensa** | (pendiente) |
| Pull Requests integrados (#1 a #17 y el de cierre) | https://github.com/melanie05code/patitas-conectadas/pulls?q=is%3Apr+is%3Amerged |
| Integración continua (GitHub Actions) | https://github.com/melanie05code/patitas-conectadas/actions/workflows/ci.yml |
| SonarCloud | https://sonarcloud.io/summary/new_code?id=melanie05code_patitas-conectadas |
| Historial de commits | https://github.com/melanie05code/patitas-conectadas/commits/main |
| Sistema ejecutable | Por ahora **no está desplegado en internet**: se ejecuta localmente siguiendo el [README](../README.md) (`npm ci` → `.env` → `npm run db:instalar` → `npm start` → http://localhost:3000). El target-host propuesto está en [`10_estrategia_implementacion.md`](10_estrategia_implementacion.md) |

## 12.2 Usuarios de demostración

Se crean con `npm run db:instalar`. Son **ficticios**. Las contraseñas no están en el repositorio: cada instalación las define en su `.env` (el instalador rechaza los valores `EJEMPLO_` de `.env.example`) y se guardan con hash bcrypt. **No deben existir en producción.**

| Rol | Correo | Contraseña | Qué puede hacer |
|---|---|---|---|
| Administrador del refugio | `admin@patitas.com` | `SEED_ADMIN_PASSWORD` del `.env` | Panel: solicitudes en curso, calendario de entrevistas, decisión, revisión de controles, agenda, configuración del refugio, mascotas y tipos |
| Adoptante | `edwin.obando@correo.com` (Edwin Obando) | `SEED_ADOPTANTE_PASSWORD` del `.env` | Entrevista de Mechudo agendada; Encantador y Lara adoptados (control 2 de Lara vencido, para subir la foto); Princesa Sucia rechazada |
| Adoptante | `ana.martinez@correo.com` (Ana Martínez) | `SEED_ADOPTANTE2_PASSWORD` del `.env` | Solicitud de Vaquita en *Solicitada*, esperando la entrevista |

También se puede crear una cuenta nueva de adoptante desde *Registrarse*.

## 12.3 Anexos

| Anexo | Ubicación |
|---|---|
| Documentos del Hito 1 (alcance, requisitos, arquitectura, componentes, trazabilidad y prototipo v1) | [`docs/hito1/`](hito1/) |
| Script de la base de datos (`CREATE TABLE`, PK, FK, UNIQUE, CHECK, índices) y migraciones 001 a 004 | [`database/01_schema.sql`](../database/01_schema.sql), [`database/migraciones/`](../database/migraciones/) |
| Datos semilla (sin contraseñas ni hashes; se calculan al instalar) y su generador | [`database/02_seed.sql`](../database/02_seed.sql), [`database/generar-seed.js`](../database/generar-seed.js) |
| Fotos reales de las mascotas | [`database/seed-fotos/`](../database/seed-fotos/) |
| Migración de datos (exportador, ETL y respaldo de ejemplo) | [`database/migracion/`](../database/migracion/) |
| Pruebas automáticas (Jest + Supertest) y E2E (Playwright) | [`tests/`](../tests/), [`tests/e2e/`](../tests/e2e/) |
| **Salida final de `npm test` con cobertura (50/50, 2026-11-07)** | [`evidencias/final/npm-test-cobertura.txt`](evidencias/final/npm-test-cobertura.txt) |
| **Resultados E2E (16/16) y capturas** | [`evidencias/final/e2e/`](evidencias/final/e2e/) |
| Instalación desde cero, respaldo y recuperación, tiempos de respuesta | [`evidencias/final/`](evidencias/final/) |
| Capturas del manual de usuario | [`evidencias/final/manual/`](evidencias/final/manual/) |
| Capturas ANTES de la evaluación de usabilidad | [`evidencias/final/usabilidad/`](evidencias/final/usabilidad/) |
| Salida de `npm test` del II Parcial (28/28, histórico) | [`evidencias/npm-test.txt`](evidencias/npm-test.txt) |
| Reportes de la migración de prueba (aceptada y con rollback) | [`evidencias/migracion.txt`](evidencias/migracion.txt), [`evidencias/migracion_rollback.txt`](evidencias/migracion_rollback.txt) |
| Capturas de pantalla (pruebas `PR-xx_*.png` y pantallas generales `pantalla_*.png`) | [`evidencias/`](evidencias/) |
| Scripts que generan las capturas y las mediciones | [`scripts/`](../scripts/) (`capturas.js`, `capturas-manual.js`, `medir-tiempos.js`) |

### Índice de capturas

| Captura | Muestra |
|---|---|
| [`pantalla_inicio.png`](evidencias/pantalla_inicio.png) | Página de inicio con estadísticas reales |
| [`pantalla_catalogo_publico.png`](evidencias/pantalla_catalogo_publico.png) | Catálogo público con fotos (solo disponibles y en proceso) |
| [`PR-28_ver_adoptadas.png`](evidencias/PR-28_ver_adoptadas.png) | Filtro *Ver adoptadas* |
| [`PR-08_detalle_mascota.png`](evidencias/PR-08_detalle_mascota.png) | Ficha de una mascota adoptada (sin botón de solicitar) |
| [`PR-01_registro_exitoso.png`](evidencias/PR-01_registro_exitoso.png) / [`PR-02_registro_correo_duplicado.png`](evidencias/PR-02_registro_correo_duplicado.png) | Registro correcto y correo duplicado |
| [`PR-04_login_valido_admin.png`](evidencias/PR-04_login_valido_admin.png) / [`PR-05_login_error.png`](evidencias/PR-05_login_error.png) | Inicio de sesión correcto e incorrecto |
| [`PR-14_solicitud_enviada.png`](evidencias/PR-14_solicitud_enviada.png) / [`PR-15_telefono_invalido.png`](evidencias/PR-15_telefono_invalido.png) / [`PR-16_mascota_no_disponible.png`](evidencias/PR-16_mascota_no_disponible.png) | Solicitud enviada, teléfono inválido y mascota no disponible |
| [`PR-21_seguimiento_solicitada.png`](evidencias/PR-21_seguimiento_solicitada.png) / [`PR-18_seguimiento_aprobada.png`](evidencias/PR-18_seguimiento_aprobada.png) | Seguimiento antes y después de la aprobación |
| [`PR-41_entrevista_agendada.png`](evidencias/PR-41_entrevista_agendada.png) | Detalle de la solicitud con la entrevista agendada |
| [`PR-18_solicitud_aprobada.png`](evidencias/PR-18_solicitud_aprobada.png) | Detalle: solicitud aprobada después de la entrevista |
| [`PR-22_notificaciones.png`](evidencias/PR-22_notificaciones.png) | Notificaciones con contador de no leídas |
| [`PR-09_tipo_duplicado.png`](evidencias/PR-09_tipo_duplicado.png) / [`PR-13_tipo_desactivado.png`](evidencias/PR-13_tipo_desactivado.png) | Gestión de tipos de mascota |
| [`PR-11_formulario_con_vista_previa.png`](evidencias/PR-11_formulario_con_vista_previa.png) / [`PR-11_mascota_con_foto.png`](evidencias/PR-11_mascota_con_foto.png) / [`PR-12_foto_invalida.png`](evidencias/PR-12_foto_invalida.png) | Subida de fotos válida e inválida |
| [`pantalla_panel_admin.png`](evidencias/pantalla_panel_admin.png) | Panel de administración completo |
| [`pantalla_movil_catalogo.png`](evidencias/pantalla_movil_catalogo.png) / [`pantalla_movil_detalle.png`](evidencias/pantalla_movil_detalle.png) | Vista en celular (RNF-03) |
