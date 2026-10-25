# 12. Enlaces y anexos

## 12.1 Enlaces

| Recurso | Enlace |
|---|---|
| Repositorio en GitHub | https://github.com/melanie05code/patitas-conectadas |
| Pull Requests del Segundo Parcial | https://github.com/melanie05code/patitas-conectadas/pulls?q=is%3Apr+is%3Amerged |
| Historial de commits | https://github.com/melanie05code/patitas-conectadas/commits/main |
| Sistema ejecutable | Por ahora **no está desplegado en internet**: se ejecuta localmente siguiendo el [README](../README.md) (`npm install` → `npm run db:instalar` → `npm run dev` → http://localhost:3000). El target-host propuesto está en [`10_estrategia_implementacion.md`](10_estrategia_implementacion.md) |

## 12.2 Usuarios de demostración

Se crean con `npm run db:instalar`. Las contraseñas se guardan con hash bcrypt; se publican aquí solo para la revisión del proyecto y **no deben usarse en producción**.

| Rol | Correo | Contraseña | Qué puede hacer |
|---|---|---|---|
| Administrador del refugio | `admin@patitas.com` | `Admin2026` | Panel: responder solicitudes, gestionar mascotas, fotos y tipos |
| Adoptante | `edwin.obando@correo.com` | `Edwin2026` | Solicitar adopciones, seguimiento, historial y notificaciones (tiene 4 solicitudes de ejemplo) |

También se puede crear una cuenta nueva de adoptante desde *Registrarse*.

## 12.3 Anexos

| Anexo | Ubicación |
|---|---|
| Documentos del Hito 1 (alcance, requisitos, arquitectura, componentes, trazabilidad y prototipo v1) | [`docs/hito1/`](hito1/) |
| Script de la base de datos (`CREATE TABLE`, PK, FK, UNIQUE, CHECK, índices) | [`database/01_schema.sql`](../database/01_schema.sql) |
| Datos semilla (con contraseñas hasheadas) y su generador | [`database/02_seed.sql`](../database/02_seed.sql), [`database/generar-seed.js`](../database/generar-seed.js) |
| Fotos reales de las mascotas | [`database/seed-fotos/`](../database/seed-fotos/) |
| Migración de datos (exportador, ETL y respaldo de ejemplo) | [`database/migracion/`](../database/migracion/) |
| Pruebas automáticas (Jest + Supertest) | [`tests/`](../tests/) |
| Salida de `npm test` (28/28) | [`evidencias/npm-test.txt`](evidencias/npm-test.txt) |
| Reportes de la migración de prueba (aceptada y con rollback) | [`evidencias/migracion.txt`](evidencias/migracion.txt), [`evidencias/migracion_rollback.txt`](evidencias/migracion_rollback.txt) |
| Capturas de pantalla (pruebas `PR-xx_*.png` y pantallas generales `pantalla_*.png`) | [`evidencias/`](evidencias/) |
| Script que genera las capturas | [`scripts/capturas.js`](../scripts/capturas.js) |

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
| [`PR-21_seguimiento_en_revision.png`](evidencias/PR-21_seguimiento_en_revision.png) / [`PR-18_seguimiento_aprobada.png`](evidencias/PR-18_seguimiento_aprobada.png) | Seguimiento antes y después de la aprobación |
| [`PR-18_solicitud_aprobada.png`](evidencias/PR-18_solicitud_aprobada.png) | Panel: solicitud aprobada |
| [`PR-22_notificaciones.png`](evidencias/PR-22_notificaciones.png) | Notificaciones con contador de no leídas |
| [`PR-09_tipo_duplicado.png`](evidencias/PR-09_tipo_duplicado.png) / [`PR-13_tipo_desactivado.png`](evidencias/PR-13_tipo_desactivado.png) | Gestión de tipos de mascota |
| [`PR-11_formulario_con_vista_previa.png`](evidencias/PR-11_formulario_con_vista_previa.png) / [`PR-11_mascota_con_foto.png`](evidencias/PR-11_mascota_con_foto.png) / [`PR-12_foto_invalida.png`](evidencias/PR-12_foto_invalida.png) | Subida de fotos válida e inválida |
| [`pantalla_panel_admin.png`](evidencias/pantalla_panel_admin.png) | Panel de administración completo |
| [`pantalla_movil_catalogo.png`](evidencias/pantalla_movil_catalogo.png) / [`pantalla_movil_detalle.png`](evidencias/pantalla_movil_detalle.png) | Vista en celular (RNF-03) |
