# 16. Producto final (`v1.0.0`)

> Estado del producto al cierre del III Parcial (2026-11-07). Cada funcionalidad indica su requisito y su evidencia; los resultados de las pruebas están en la [suite V&V](14_suite_vv_final.md).

## 16.1 Funcionalidades terminadas

| Funcionalidad | RF | Evidencia |
|---|---|---|
| Registro e inicio de sesión con bcrypt + JWT, límite de 5 intentos | RF-01, RF-02, RNF-02 | PR-01 a PR-06, E2E-01, E2E-09, E2E-10 |
| Catálogo público con búsqueda, filtro por tipo y vista "Ver adoptadas" | RF-03 | PR-07, PR-28, E2E-02 |
| Ficha de detalle pública con foto real | RF-04 | PR-08, E2E-02 |
| **Perfil del adoptante** obligatorio antes de solicitar | RF-11 | PR-34 a PR-36, E2E-01, E2E-11 |
| Solicitud de adopción con validación en el servidor y transacción | RF-06 | PR-14 a PR-16, PR-20, E2E-02, E2E-12 |
| **Seguimiento en 5 etapas** con línea de tiempo (horizontal en escritorio, vertical en celular) y tarjeta "Tu entrevista" | RF-05 | PR-21, PR-41, E2E-05, E2E-15 |
| Historial de solicitudes propias | RF-10 | PR-14, E2E-02 |
| Notificaciones internas con contador; textos para cada etapa | RF-07 | PR-22, PR-23, PR-41, PR-49 |
| **Agenda de entrevistas con calendario** propio, horarios libres u ocupados, reprogramación y marca de realizada | RF-12 | PR-37 a PR-44, E2E-04 |
| **Configuración del refugio** (dirección, horario, días, duración de la cita) | RF-12 | PR-44 |
| Decisión del admin: aprobar solo después de la entrevista, rechazar en cualquier etapa activa, todo en transacciones | RF-08 | PR-17 a PR-19, PR-40, PR-42, PR-46, E2E-06 |
| **Seguimiento post-adopción**: 4 controles cada 90 días (configurable), foto con vista previa y validación | RF-13 | PR-45 a PR-48, E2E-07 |
| **Revisión de controles**: "Todo bien" / "Requiere atención" con comentario y notificación | RF-14 | PR-49, E2E-08 |
| **Recordatorios** de controles vencidos sin duplicar (al iniciar sesión, al consultar notificaciones y con `npm run recordatorios`) | RF-15 | PR-50 |
| Gestión de mascotas con fotos y de tipos de mascota (desactivar en lugar de borrar) | RF-09 | PR-09 a PR-13, E2E-03, E2E-14 |
| Interfaz **sin emojis**: iconos SVG y texto (solo la huella del logo) | PB-18 | PR-32, búsqueda con regex en el PR #13 |
| Migración de datos del prototipo (localStorage) con respaldo, validación y rollback | — | PR-24 a PR-27, doc 08 |
| Migraciones numeradas del esquema (`npm run db:migrar`) | — | PR-32, PR-33 |
| Respaldo y restauración con `mysqldump` | — | VO-02, doc 18 |
| Pipeline de CI con SonarCloud, DeepSource y Snyk | — | doc 13, doc 04 §4.6 |

## 16.2 Funcionalidades parciales

| Funcionalidad | RF | Qué falta | Evidencia de lo que sí hay |
|---|---|---|---|
| Recordatorios de seguimiento | RF-15 | No hay un proceso programado: el aviso aparece cuando el adoptante entra o consulta sus notificaciones, o cuando alguien ejecuta `npm run recordatorios`. Si el adoptante no entra, no se entera fuera del sistema (no hay correo) | PR-50 |
| Agenda | RF-12 | Muestra solo la semana actual (7 días desde hoy), sin navegación a semanas siguientes; las citas futuras se ven desde el calendario de cada solicitud | PR-43, [B02](evidencias/final/manual/B02_agenda.png) |
| Revisión "Requiere atención" | RF-14 | No hay un flujo de seguimiento posterior (por ejemplo, pedir otra foto): el refugio contacta al adoptante por fuera del sistema | PR-49 |
| Accesibilidad | RNF-03 | Etiquetas asociadas, `aria-*` en la línea de tiempo y los iconos `aria-hidden`; no se hizo una auditoría completa con lector de pantalla | doc 13, doc 23 |

## 16.3 Funcionalidades excluidas

| Funcionalidad | Motivo |
|---|---|
| **Múltiples refugios** en una plataforma (PB-15) | El alcance es un solo refugio; `configuracion_refugio` tiene una única fila |
| **Pagos o donaciones** en línea | Fuera del alcance desde el Hito 1 |
| **Aplicación móvil** nativa | Se cubre con la web responsive (RNF-03) |
| **Envío real de correos** o SMS | Las notificaciones son internas (PB-09); los recordatorios no salen del sistema |
| Reportes de adopciones (PB-11) | Prioridad baja; queda como acción futura |
| Recuperación de contraseña y alta de administradores desde la interfaz | El admin se crea con el seed; queda como acción futura |
| Historial veterinario y chat en tiempo real | Fuera del alcance desde el Hito 1 |

## 16.4 Requisito → función real

| Req. | Pantalla | Endpoint | Servicio | Tabla(s) |
|---|---|---|---|---|
| RF-01 | `registro.html` | `POST /api/auth/registro` | `usuarios/servicio.registrar` | `usuarios` |
| RF-02 | `login.html` | `POST /api/auth/login` | `usuarios/servicio.iniciarSesion` | `usuarios` |
| RF-03 | `catalogo.html`, `catalogo-publico.html` | `GET /api/mascotas`, `GET /api/tipos-mascota` | `mascotas/servicio.listar`, `tipos/servicio.listar` | `mascotas`, `tipos_mascota` |
| RF-04 | `detalle.html` | `GET /api/mascotas/:id` | `mascotas/servicio.obtener` | `mascotas` |
| RF-05 | `seguimiento.html` | `GET /api/solicitudes/:id` | `solicitudes/servicio.obtener` | `solicitudes`, `entrevistas` |
| RF-06 | `solicitar.html` | `POST /api/solicitudes` | `solicitudes/servicio.crear` | `solicitudes`, `mascotas`, `notificaciones` |
| RF-07 | `notificaciones.html` | `GET /api/notificaciones`, `PATCH /api/notificaciones/:id/leida` | `notificaciones/servicio` | `notificaciones` |
| RF-08 | `admin.html`, `admin-solicitud.html` | `GET /api/admin/solicitudes/:id`, `PATCH /api/admin/solicitudes/:id/estado` | `solicitudes/servicio.obtenerDetalle`, `.responder` | `solicitudes`, `mascotas`, `seguimientos`, `notificaciones` |
| RF-09 | `admin.html` | `POST`/`PUT /api/mascotas`, `POST`/`PUT /api/tipos-mascota` | `mascotas/servicio`, `tipos/servicio` | `mascotas`, `tipos_mascota` |
| RF-10 | `mis-solicitudes.html` | `GET /api/solicitudes/mias` | `solicitudes/servicio.listarPropias` | `solicitudes` |
| RF-11 | `perfil.html` | `GET`/`PUT /api/perfil-adoptante` | `perfiles/servicio.obtener`, `.guardar`, `.exigirPerfil` | `perfiles_adoptante` |
| RF-12 | `admin-solicitud.html`, `admin.html` | `PATCH .../entrevista`, `PATCH .../entrevistada`, `GET /api/admin/entrevistas[/disponibilidad]`, `GET`/`PUT /api/admin/configuracion-refugio` | `solicitudes/servicio.agendarEntrevista`, `.marcarEntrevistada`, `entrevistas/servicio.disponibilidad`, `.validarHorario`, `.agenda` | `entrevistas`, `configuracion_refugio` |
| RF-13 | `seguimiento.html` | `GET /api/solicitudes/:id/seguimientos`, `POST /api/seguimientos/:id/foto` | `seguimientos/servicio.programar`, `.listarDeSolicitud`, `.subirFoto` | `seguimientos` |
| RF-14 | `admin.html` | `GET`/`PATCH /api/admin/seguimientos` | `seguimientos/servicio.revisar` | `seguimientos`, `notificaciones` |
| RF-15 | `notificaciones.html` | `GET /api/notificaciones`, `POST /api/auth/login` | `seguimientos/servicio.generarRecordatorios` | `notificaciones`, `seguimientos` |

## 16.5 Usuarios demo y datos semilla

Todos los datos de personas son **ficticios**. Las contraseñas **no están en el repositorio**: cada instalación las define en su `.env` (el instalador rechaza los valores `EJEMPLO_` de `.env.example`).

| Rol | Correo | Contraseña | Qué se puede probar |
|---|---|---|---|
| Administrador | `admin@patitas.com` | `SEED_ADMIN_PASSWORD` del `.env` | Panel completo: agendar la entrevista de Vaquita (Ana), marcar entrevistada y decidir la de Mechudo, revisar el control de Lara cuando Edwin lo envíe, configurar el refugio |
| Adoptante | `edwin.obando@correo.com` (Edwin Obando) | `SEED_ADOPTANTE_PASSWORD` | Entrevista de Mechudo en 3 días a las 10:30 a. m.; Encantador y Lara adoptados; control 2 de Lara vencido (recordatorio) para subir la foto; Princesa Sucia rechazada después de la entrevista |
| Adoptante | `ana.martinez@correo.com` (Ana Martínez) | `SEED_ADOPTANTE2_PASSWORD` | Solicitud de Vaquita en "Solicitada", esperando que el refugio agende la entrevista |

**Cómo se generan:** `database/datos-semilla.js` es la fuente única; `npm run db:seed` escribe `database/02_seed.sql` con marcadores de contraseña y fechas relativas (`CURDATE() - INTERVAL n DAY`), y `npm run db:instalar` aplica el esquema, las migraciones, el seed (calculando los hashes bcrypt en ese momento) y copia las fotos de `database/seed-fotos/` a `uploads/mascotas/`. Detalle por tabla en [`05_base_datos.md` §5.6](05_base_datos.md).

Las 10 mascotas y sus fotos son reales (fuente: `fotos-mascotas/mascotas.txt` del proyecto); antes de versionarlas se verificó que no tuvieran metadatos EXIF de ubicación.
