# 2. Alcance y requisitos actualizados

> Versión 3.0 — III Parcial (`v1.0.0`). Reemplaza la versión 2.0 del Segundo Parcial y la del Hito 1 (`docs/hito1/`).
> Estados verificados contra el código de `main` al 2026-11-07: cada "Implementado" o "Completado" tiene su archivo o su prueba como evidencia (matriz en [`19_matriz_trazabilidad_final.md`](19_matriz_trazabilidad_final.md)).

## 2.1 Alcance actualizado

**Objetivo general:** desarrollar una aplicación web que centralice el catálogo de mascotas disponibles para adopción, el envío de solicitudes y su seguimiento, mejorando la comunicación entre el refugio y los adoptantes.

**Cambio principal respecto al Hito 1:** el Hito 1 era un prototipo que simulaba los datos en el navegador (localStorage, "sin backend real todavía"). En esta etapa el sistema pasa a tener **backend real** (Node.js + Express), **base de datos relacional** (MySQL 8.0) y **autenticación segura** (contraseñas con hash bcrypt y token JWT).

### Dentro del alcance
- Registro e inicio de sesión de adoptantes con contraseñas cifradas (hash) y token de sesión.
- Catálogo público de mascotas con búsqueda por nombre y filtros por tipo, generados desde la base de datos.
- Ficha de detalle pública de cada mascota, con fotografía real o ícono según su tipo.
- Envío de solicitudes de adopción con validación en el navegador **y en el servidor**.
- Perfil del adoptante (vivienda, patio, personas en el hogar, ingresos, otras mascotas, experiencia), obligatorio antes de solicitar. *(Ampliación III Parcial, RF-11.)*
- Seguimiento del estado de la solicitud en cinco etapas (Solicitada → Entrevista programada → Entrevistada → Aprobada/Rechazada) e historial propio.
- Entrevista presencial en el refugio agendada por el administrador en un calendario con horarios disponibles. *(Ampliación III Parcial, RF-12.)*
- Seguimiento post-adopción: controles cada 3 meses durante 1 año con foto del adoptante y revisión del refugio, más recordatorios. *(Ampliación III Parcial, RF-13 a RF-15.)*
- Interfaz sin emojis: iconos SVG propios y texto (solo la huella del logo).
- Notificaciones **internas** guardadas en la base de datos, con contador de no leídas.
- Panel administrativo: responder solicitudes, gestionar mascotas (agregar, editar, cambiar estado, subir foto) y gestionar los tipos de mascota.
- Un único refugio administrando el sistema.
- Interfaz web responsive (computadora y móvil).
- Migración de los datos del prototipo (localStorage) hacia la base de datos.

### Fuera del alcance (por ahora)
- Notificaciones por correo electrónico (son notificaciones internas; ver PB-09).
- Pagos o donaciones en línea.
- Aplicación móvil nativa (Android/iOS).
- Múltiples refugios en una sola plataforma (PB-15).
- Historial médico/veterinario detallado.
- Chat en tiempo real entre adoptante y refugio.
- Reportes de adopciones (PB-11).

### Ampliación del alcance (III Parcial)

**Qué se agregó:** RF-11 a RF-15 y la actualización de RF-05, RF-07 y RF-08 (backlog PB-12 a PB-14, PB-17 a PB-19).

**Justificación:** en la visión original del sistema (Hito 1) la adopción no termina en un clic de "Aprobar". El refugio necesita conocer las condiciones del hogar (perfil), conversar en persona con el adoptante antes de decidir (entrevista) y confirmar después que la mascota está bien (seguimiento post-adopción). Esos pasos estaban en el backlog como PB-12 a PB-14 y en el II Parcial quedaron "fuera de alcance por ahora". Se incorporan en el III Parcial porque:
1. completan el proceso de adopción real del refugio, que es el objetivo general del sistema;
2. reutilizan la arquitectura existente (capas, transacciones, validación en el backend, subida segura de fotos y notificaciones) sin nuevas dependencias;
3. agregan reglas de negocio verificables (horarios, etapas, permisos, recordatorios sin duplicados) que fortalecen la suite de V&V.

**Qué sigue fuera:** varios refugios, pagos o donaciones, app móvil nativa y envío real de correos (ver [`16_producto_final.md`](16_producto_final.md)).

### Usuarios
| Rol | Descripción |
|---|---|
| Adoptante | Persona que se registra, consulta mascotas, solicita adopciones y da seguimiento |
| Administrador del refugio | Gestiona mascotas, tipos de mascota y la configuración del refugio; agenda entrevistas, decide las solicitudes y revisa los controles post-adopción |
| Visitante | Persona sin cuenta: puede ver el inicio, el catálogo y el detalle de las mascotas |

## 2.2 Requisitos funcionales

| Código | Descripción | Pantalla | Estado |
|---|---|---|---|
| RF-01 | El sistema debe permitir el registro de nuevos adoptantes | Registro | **Implementado** (`POST /api/auth/registro`) |
| RF-02 | El sistema debe permitir el inicio de sesión de adoptantes registrados | Login | **Implementado** (`POST /api/auth/login`, JWT) |
| RF-03 | El sistema debe mostrar el catálogo de mascotas disponibles | Catálogo | **Implementado** (`GET /api/mascotas`, filtros desde `GET /api/tipos-mascota`) |
| RF-04 | El sistema debe mostrar la ficha detallada de una mascota | Detalle | **Implementado** (`GET /api/mascotas/:id`, público) |
| RF-05 | El sistema debe permitir consultar el estado de una solicitud de adopción en sus cinco etapas (Solicitada, Entrevista programada, Entrevistada, Aprobada o Rechazada), con la fecha de cada una | Seguimiento | **Implementado** (`GET /api/solicitudes/:id`, solo dueño o admin; línea de tiempo) · *actualizado III Parcial* |
| RF-06 | El sistema debe permitir enviar una solicitud de adopción (con el perfil completo) | Solicitar adopción | **Implementado** (`POST /api/solicitudes`, transacción; 400 si falta el perfil) |
| RF-07 | El sistema debe notificar al adoptante: solicitud recibida, entrevista agendada, entrevista reprogramada, resultado, recordatorio de control pendiente y resultado de la revisión del control | Notificaciones | **Implementado** (notificaciones internas: `GET /api/notificaciones`, contador y `PATCH .../leida`) · *actualizado III Parcial* |
| RF-08 | El sistema debe permitir al administrador revisar la solicitud con el perfil del adoptante y decidirla: aprobar **solo después de la entrevista** y rechazar en cualquier etapa activa | Panel de Administración, Detalle de solicitud | **Implementado** (`GET /api/admin/solicitudes[/:id]`, `PATCH .../estado`, transacción) · *actualizado III Parcial* |
| RF-09 | El sistema debe permitir al administrador gestionar el catálogo de mascotas (agregar, editar, cambiar estado, gestionar tipos) | Panel de Administración | **Implementado** (`POST`/`PUT /api/mascotas`, `POST`/`PUT /api/tipos-mascota`) |
| RF-10 | El sistema debe permitir consultar el historial de solicitudes propias | Mis Solicitudes | **Implementado** (`GET /api/solicitudes/mias`) |
| RF-11 | El adoptante debe crear y editar su **perfil** (vivienda, patio, personas en el hogar, ingresos estables, otras mascotas, experiencia); es obligatorio y completo antes de solicitar | Mi perfil | **Implementado** (`GET`/`PUT /api/perfil-adoptante`) · *ampliación* |
| RF-12 | El administrador debe **agendar, reprogramar y marcar como realizada** la entrevista presencial en el refugio; el adoptante consulta día, hora y lugar | Detalle de solicitud (calendario), Agenda, Seguimiento | **Implementado** (`PATCH /api/admin/solicitudes/:id/entrevista` y `/entrevistada`, `GET /api/admin/entrevistas[/disponibilidad]`, `GET`/`PUT /api/admin/configuracion-refugio`) · *ampliación* |
| RF-13 | El adoptante debe **subir una foto** de la mascota en cada control post-adopción programado (cada 3 meses durante 1 año, configurable) | Seguimiento | **Implementado** (`GET /api/solicitudes/:id/seguimientos`, `POST /api/seguimientos/:id/foto`) · *ampliación* |
| RF-14 | El administrador debe **revisar** cada control y marcarlo "Todo bien" o "Requiere atención" con un comentario | Panel (Seguimientos post-adopción) | **Implementado** (`GET`/`PATCH /api/admin/seguimientos`) · *ampliación* |
| RF-15 | El sistema debe **recordar** al adoptante los controles pendientes o vencidos, sin duplicar avisos | Notificaciones | **Implementado** (al iniciar sesión y al consultar las notificaciones; `npm run recordatorios`) · *ampliación* |

## 2.3 Requisitos no funcionales

| Código | Descripción | Estado |
|---|---|---|
| RNF-01 | El sistema debe responder las consultas de seguimiento en menos de 2 segundos | **Cumple en la medición local**: PR-21 lo verifica en cada ejecución, y `npm run medir:tiempos` midió 7 rutas × 50 peticiones con un máximo de 86,7 ms ([evidencia](evidencias/final/rendimiento_rnf01.txt)). No se midió con concurrencia ni en un servidor de producción |
| RNF-02 | Las contraseñas de usuario deben almacenarse cifradas (hash) | **Cumple**: hash bcrypt (10 rondas) en MySQL; el navegador solo guarda el token |
| RNF-03 | La aplicación debe ser responsive (accesible desde móvil y escritorio) | **Cumple**: etiqueta `viewport`; línea de tiempo vertical en el celular y sin desplazamiento horizontal (E2E-15, después de corregir DEF-21) |
| RNF-04 | Solo un administrador autenticado puede modificar el catálogo o el estado de una solicitud | **Cumple**: `requiereAuth` + `requiereRol('admin')` protegen la gestión de mascotas, de tipos y la respuesta de solicitudes; un adoptante recibe 403 |

## 2.4 Backlog priorizado actualizado

| ID | Funcionalidad / Tarea | Prioridad | Estado | Evidencia |
|---|---|---|---|---|
| PB-01 | Registro y autenticación de adoptantes | Alta | **Completado** con backend | `src/modules/usuarios/`, `public/js/paginas/login.js`, `public/js/paginas/registro.js` |
| PB-02 | Catálogo de mascotas con filtros | Alta | **Completado** con backend | `src/modules/mascotas/`, `public/js/paginas/catalogo.js` |
| PB-03 | Solicitud y seguimiento de adopción | Alta | **Completado** con backend y transacciones | `src/modules/solicitudes/`, `public/js/paginas/solicitar.js`, `public/js/paginas/seguimiento.js` |
| PB-04 | Panel administrativo (aprobar/rechazar) | Alta | **Completado** con backend y transacciones | `src/modules/solicitudes/`, `public/js/paginas/admin.js` |
| PB-05 | Conexión a base de datos real (**MySQL**; antes MongoDB) | Alta | **Completado** (esquema, seed y pool de conexiones) | `database/01_schema.sql`, `src/config/db.js` |
| PB-06 | Backend real con Node.js + Express | Alta | **Completado**: módulos de usuarios, tipos, mascotas, solicitudes y notificaciones; el frontend ya no usa localStorage como base de datos | `src/app.js`, `src/modules/` |
| PB-07 | Autenticación segura (hash bcrypt de contraseñas y JWT) | Alta | **Completado** | `src/modules/usuarios/servicio.js`, `src/middlewares/autenticacion.js` |
| PB-08 | Validación de formato de teléfono | Media | **Completado** en el navegador, el servidor y la base de datos (hallazgo 5) | `public/js/paginas/solicitar.js`, `src/modules/solicitudes/validaciones.js` |
| PB-09 | Notificaciones de cambio de estado (**internas en BD**; el correo queda fuera de alcance) | Media | **Completado** como notificaciones internas con contador de no leídas; el envío por correo queda como mejora futura | `src/modules/notificaciones/`, `public/js/paginas/notificaciones.js` |
| PB-10 | Fotografías reales de las mascotas | Media | **Completado**: subida desde el panel (JPG, PNG o WEBP, máx. 2 MB) y fotos reales de las 10 mascotas en los datos semilla | `src/middlewares/subida.js`, `database/seed-fotos/` |
| PB-11 | Reportes de adopciones para el refugio | Baja | Pendiente (mejora futura) | — |
| PB-12 | Agendar cita de entrevista presencial tras la solicitud | Media | **Completado** (III Parcial): calendario, horarios disponibles y agenda | `src/modules/entrevistas/`, `public/js/calendario.js`, PR-37 a PR-44 |
| PB-13 | Registrar resultado de la entrevista y aprobación final | Media | **Completado** (III Parcial): marcar entrevistada; aprobar solo después | `src/modules/solicitudes/servicio.js`, PR-40, PR-41 |
| PB-14 | Seguimiento post-adopción con fotos periódicas (cada 3 meses) | Baja | **Completado** (III Parcial): controles, foto, revisión y recordatorios | `src/modules/seguimientos/`, PR-45 a PR-50 |
| PB-15 | Soporte para múltiples refugios en una sola plataforma (registro de refugios con aprobación) | Baja | Pendiente (mejora futura) | — |
| PB-16 | Tipos de mascota administrables (catálogo en BD en lugar de lista fija) | Media | **Completado** | `src/modules/tipos/`, `public/js/paginas/admin.js` |
| PB-17 | Perfil del adoptante obligatorio antes de solicitar | Alta | **Completado** (III Parcial) | `src/modules/perfiles/`, `public/perfil.html`, PR-34 a PR-36 |
| PB-18 | Interfaz sin emojis (iconos SVG y texto) y columna `icono` eliminada con migración | Media | **Completado** (III Parcial) | `database/migraciones/001_quitar_icono_tipos.sql`, `public/js/comun.js` (`iconoSvg`), PR-32 |
| PB-19 | Configuración del refugio editable (dirección, horario, días, duración de la cita) | Media | **Completado** (III Parcial) | `src/modules/configuracion/`, PR-44 |

## 2.5 Estado de los hallazgos de usabilidad

| Nº | Hallazgo | Estado Hito 1 | Estado actual | Evidencia |
|---|---|---|---|---|
| 1 | Tipografía distinta en el campo de texto largo | Corregido | Corregido | `public/css/styles.css` |
| 2 | Estado de la mascota desincronizado con la solicitud | Corregido | Corregido | `public/admin.html` |
| 3 | Menú autenticado visible en Registro/Login con sesión iniciada | Pendiente | **Corregido**: con sesión se redirige al catálogo o al panel; sin sesión solo se ve el menú público | `public/js/paginas/login.js`, `public/js/paginas/registro.js` (`redirigirSiHaySesion`) |
| 4 | Fotos de mascotas como ícono, no imágenes reales | Parcial | **Corregido**: catálogo, detalle, solicitudes y panel muestran la foto real; si una mascota no tiene foto se muestra una huella SVG | `public/js/comun.js` (`fotoMascota`), `public/js/paginas/catalogo.js` |
| 5 | Teléfono sin validación de formato | Corregido | Corregido en el navegador, en el servidor (400) y en la BD (`CHECK`) | `public/js/paginas/solicitar.js`, `src/modules/solicitudes/validaciones.js`, `database/01_schema.sql` |
| 6 | *(nuevo)* La ficha de detalle exigía sesión aunque el catálogo público enlazaba a ella | — | **Corregido**: detalle público, con botón para iniciar sesión | `public/detalle.html` |
| 7 | *(nuevo)* Datos de usuario insertados con `innerHTML` sin escapar (riesgo XSS) | — | **Corregido**: función `escaparHtml` | `public/js/comun.js` |
| 8 | *(nuevo)* Las páginas no tenían la etiqueta `viewport`, por lo que en móviles se veían con ancho de escritorio | — | **Corregido** | Todas las páginas de `public/` |
| 9 | *(nuevo)* Las notificaciones no indicaban cuáles eran nuevas ni se podían marcar como leídas | — | **Corregido**: contador en la barra, no leídas destacadas y opción de marcarlas | `public/js/paginas/notificaciones.js` |
| 10 | *(nuevo)* El catálogo se titula "Mascotas disponibles" pero mostraba también las mascotas adoptadas (Consistencia y estándares / Coincidencia entre el sistema y el mundo real) | — | **Corregido**: por defecto solo Disponibles y En proceso (estas al final); filtro *Ver adoptadas* con su propio título; el detalle de una adoptada no ofrece solicitarla | `public/js/paginas/catalogo.js`, [`PR-28_catalogo_sin_adoptadas.png`](evidencias/PR-28_catalogo_sin_adoptadas.png), [`PR-28_ver_adoptadas.png`](evidencias/PR-28_ver_adoptadas.png) |
| 11 | *(nuevo, III Parcial)* La barra de navegación del adoptante desbordaba en el celular | — | **Corregido** (DEF-21) | [`E2E-15_seguimiento_movil.png`](evidencias/final/e2e/E2E-15_seguimiento_movil.png) |

La evaluación heurística completa (Nielsen) del III Parcial, con severidad y ANTES → DESPUÉS, está en [`23_evaluacion_usabilidad.md`](23_evaluacion_usabilidad.md).

## 2.6 Criterios de aceptación (RF-01 a RF-15)

Formato: **Dado** (contexto) / **Cuando** (acción) / **Entonces** (resultado verificable).

### RF-01 — Registro de adoptantes
1. **Dado** un visitante sin cuenta, **cuando** envía nombre, correo válido y una contraseña de 8 caracteres o más que coincide con su confirmación, **entonces** la cuenta se crea con rol *adoptante*, la contraseña se guarda solo como hash bcrypt y se inicia la sesión.
2. **Dado** un correo ya registrado (sin importar mayúsculas), **cuando** se intenta registrar otra vez, **entonces** el sistema responde *"Ya existe una cuenta con ese correo"* (HTTP 409) y no crea otro usuario.
3. **Dado** un formulario con nombre vacío, correo sin formato válido o contraseña de menos de 8 caracteres, **cuando** se envía, **entonces** el sistema rechaza el registro (HTTP 400) y muestra el motivo, aunque la validación del navegador se haya saltado.

### RF-02 — Inicio de sesión
1. **Dado** un usuario registrado, **cuando** ingresa su correo y contraseña correctos, **entonces** recibe un token JWT con vencimiento y es enviado al catálogo (adoptante) o al panel (administrador).
2. **Dado** un correo inexistente o una contraseña incorrecta, **cuando** intenta ingresar, **entonces** ve el mensaje genérico *"Correo o contraseña incorrectos"* (HTTP 401), sin revelar cuál dato falló.
3. **Dado** que el usuario ya tiene sesión, **cuando** abre Login o Registro, **entonces** es redirigido a su pantalla principal (hallazgo 3).
4. **Dado** que el navegador guarda la sesión, **cuando** se revisa sessionStorage, **entonces** solo hay token y datos mínimos (id, nombre, rol), nunca la contraseña.

### RF-03 — Catálogo de mascotas
1. **Dado** cualquier visitante, **cuando** abre el catálogo ("Mascotas disponibles"), **entonces** ve solo las mascotas *Disponibles* y *En proceso*, con nombre, edad, tipo, estado y foto (o ícono del tipo); las *En proceso* aparecen al final con su etiqueta y **ninguna mascota adoptada aparece en esta vista**.
2. **Dado** el catálogo, **cuando** escribe parte del nombre o elige un tipo, **entonces** solo se muestran las mascotas que coinciden.
3. **Dado** que los tipos vienen de la base de datos, **cuando** el administrador agrega o desactiva un tipo, **entonces** los filtros del catálogo se actualizan sin cambiar código.
4. **Dado** una búsqueda sin coincidencias, **entonces** se muestra *"No se encontraron mascotas con ese criterio"*.
5. **Dado** el catálogo, **cuando** marca el filtro *Ver adoptadas*, **entonces** el título cambia a "Mascotas adoptadas", se muestran solo las mascotas *Adoptadas* con su etiqueta, los filtros de tipo muestran solo los tipos que tienen mascotas adoptadas, y no hay forma de solicitarlas; al desmarcarlo vuelve la vista de disponibles.

### RF-04 — Ficha de detalle
1. **Dado** cualquier visitante, **cuando** abre una mascota del catálogo, **entonces** ve su foto, raza, edad, sexo, descripción y estado.
2. **Dado** una mascota *Disponible* y un adoptante con sesión, **entonces** se muestra el botón *Solicitar adopción*; sin sesión, el botón invita a iniciar sesión.
3. **Dado** una mascota *En proceso*, **entonces** el botón aparece deshabilitado como *En proceso de adopción*; **dado** una mascota *Adoptada*, **entonces** se muestra el aviso *"Esta mascota ya encontró un hogar"* y ningún botón para solicitarla.
4. **Dado** un id inexistente, **entonces** se muestra *"Mascota no encontrada"* (HTTP 404).

### RF-05 — Seguimiento de solicitud
1. **Dado** un adoptante con una solicitud, **cuando** abre su seguimiento, **entonces** ve la línea de tiempo de cinco etapas (Solicitada → Entrevista programada → Entrevistada → Aprobada/Rechazada) con la fecha de cada etapa alcanzada: completadas en verde con marca de verificación, la actual resaltada, Rechazada en rojo y las futuras en gris (horizontal en escritorio, vertical en celular).
2. **Dado** una solicitud de otro usuario, **cuando** un adoptante intenta abrirla, **entonces** el sistema lo impide (HTTP 403 o 404).
3. **Dado** la consulta de seguimiento, **entonces** la respuesta llega en menos de 2 segundos (RNF-01).
4. **Dado** una entrevista agendada, **entonces** ve la tarjeta "Tu entrevista" con el día en texto ("martes 10 de noviembre"), la hora ("10:30 a. m.") y la dirección del refugio; las notas internas del refugio no se muestran.

### RF-06 — Enviar solicitud de adopción
1. **Dado** un adoptante con sesión, **con perfil completo** y una mascota *Disponible*, **cuando** envía teléfono con formato `8888-1234`, dirección y motivo, **entonces** la solicitud se guarda *Solicitada*, la mascota cambia a *En proceso* y la solicitud aparece en *Mis Solicitudes*.
2. **Dado** un campo obligatorio vacío o un teléfono con otro formato, **entonces** el servidor rechaza la solicitud (HTTP 400) con un mensaje claro.
3. **Dado** una mascota que ya no está *Disponible*, **cuando** se intenta solicitar, **entonces** el servidor responde HTTP 409 y no se crea la solicitud.
4. **Dado** que el adoptante ya tiene una solicitud activa para esa mascota, **entonces** no puede crear otra (HTTP 409).
5. **Dado** que dos personas solicitan la misma mascota al mismo tiempo, **entonces** solo una solicitud se guarda (transacción con bloqueo de fila y UNIQUE de solicitud activa).
6. **Dado** un adoptante **sin perfil**, **cuando** intenta solicitar, **entonces** la interfaz lo lleva a *Mi perfil* y la API responde 400 *"Completa tu perfil de adoptante antes de solicitar una adopción."*

### RF-07 — Notificaciones
1. **Dado** que el adoptante envía la solicitud, o el administrador agenda o reprograma la entrevista, aprueba o rechaza, o revisa un control, **entonces** el adoptante recibe una notificación interna con el texto correspondiente (la de la entrevista incluye día y hora en texto).
2. **Dado** notificaciones sin leer, **entonces** la barra de navegación muestra el contador de no leídas.
3. **Dado** una notificación, **cuando** el adoptante la marca como leída, **entonces** deja de contarse y solo el dueño puede marcarla.
4. El envío por correo electrónico queda fuera de alcance en esta versión.

### RF-08 — Revisar y responder solicitudes (administrador)
1. **Dado** un usuario con rol *administrador*, **cuando** abre el panel, **entonces** ve las solicitudes en curso (Solicitada, Entrevista programada, Entrevistada) y, en el detalle, el perfil del adoptante y la entrevista.
2. **Dado** una solicitud *Entrevistada*, **cuando** la aprueba, **entonces** la solicitud pasa a *Aprobada*, la mascota a *Adoptada*, se crean los controles post-adopción y la notificación, todo en una sola transacción.
3. **Dado** una solicitud en cualquier etapa activa, **cuando** la rechaza (con motivo opcional), **entonces** pasa a *Rechazada*, la mascota vuelve a *Disponible* y, si la entrevista no se había realizado, el horario queda libre.
4. **Dado** un adoptante, **cuando** intenta entrar al panel o llamar a la API de administración, **entonces** es redirigido y la API responde HTTP 403 (RNF-04).
5. **Dado** que falla cualquier paso de la aprobación (incluida la creación de los controles), **entonces** no queda guardado ningún cambio (rollback).
6. **Dado** una solicitud *Solicitada* o *Entrevista programada*, **cuando** intenta aprobarla, **entonces** el sistema responde 409 *"Solo se puede aprobar una solicitud después de realizar la entrevista."*

### RF-09 — Gestión del catálogo (administrador)
1. **Dado** el administrador, **cuando** agrega una mascota con nombre, tipo, edad, raza, sexo y descripción, **entonces** aparece en el catálogo como *Disponible*.
2. **Dado** una mascota existente, **cuando** el administrador edita sus datos, cambia su estado o sube una foto (JPG, PNG o WEBP de hasta 2 MB), **entonces** los cambios se ven en el catálogo y el detalle.
3. **Dado** el administrador, **cuando** agrega un tipo de mascota con un nombre que ya existe, **entonces** el sistema responde HTTP 409; si lo desactiva, deja de ofrecerse en los formularios y filtros.
4. **Dado** datos faltantes o un tipo inexistente, **entonces** el servidor responde HTTP 400.

### RF-10 — Historial de solicitudes propias
1. **Dado** un adoptante con sesión, **cuando** abre *Mis Solicitudes*, **entonces** ve solo sus solicitudes, de la más reciente a la más antigua, con mascota, fecha y estado.
2. **Dado** un adoptante sin solicitudes, **entonces** ve *"Aún no has enviado solicitudes"* con un enlace al catálogo.
3. **Dado** una solicitud del historial, **cuando** la selecciona, **entonces** abre su seguimiento (RF-05).

### RF-11 — Perfil del adoptante
1. **Dado** un adoptante, **cuando** guarda tipo de vivienda (Casa, Apartamento, Cuarto u Otro), patio, personas en el hogar (1 a 20), ingresos estables, otras mascotas y experiencia, **entonces** el perfil queda guardado y puede editarlo sin crear otro.
2. **Dado** que marca "Sí" en otras mascotas o en experiencia, **cuando** deja vacío el detalle, **entonces** el sistema lo rechaza (400) indicando qué falta.
3. **Dado** 0 o 21 personas, un decimal o un campo vacío, **entonces** el sistema responde 400; con 1 y con 20 lo acepta.
4. **Dado** un administrador, **cuando** intenta usar la API del perfil, **entonces** recibe 403.

### RF-12 — Gestión de entrevistas
1. **Dado** una solicitud *Solicitada*, **cuando** el administrador elige en el calendario un día de atención y un horario libre, **entonces** se crea la entrevista con la dirección vigente del refugio, la solicitud pasa a *Entrevista programada* y el adoptante recibe la notificación.
2. **Dado** el calendario, **entonces** los días pasados, los domingos y los días sin atención están deshabilitados, y al elegir un día los horarios ocupados o pasados aparecen bloqueados.
3. **Dado** una fecha pasada, un domingo, un horario fuera de atención o desalineado con la duración de la cita, **entonces** el backend responde 400 aunque se salte la interfaz; **dado** un horario ocupado (incluso si dos administradores lo eligen a la vez), responde 409.
4. **Dado** una entrevista programada, **cuando** el administrador la reprograma, **entonces** cambia la fecha y el adoptante recibe la notificación de reprogramación; **cuando** la marca como realizada (con notas opcionales), la solicitud pasa a *Entrevistada*.
5. **Dado** la Agenda del panel, **entonces** muestra las entrevistas de la semana agrupadas por día, con enlace a cada solicitud.

### RF-13 — Seguimiento post-adopción
1. **Dado** que una solicitud se aprueba, **entonces** se crean `SEGUIMIENTO_CANTIDAD` controles (4 por defecto) cada `SEGUIMIENTO_INTERVALO_DIAS` días (90 por defecto), todos *Pendientes*.
2. **Dado** un control *Pendiente* cuya fecha ya llegó, **cuando** su dueño sube una foto JPG, PNG o WEBP de hasta 2 MB (con vista previa), **entonces** el control pasa a *Enviado* ("En revisión").
3. **Dado** un control futuro, **entonces** se muestra como *Próximamente* sin botón y la API responde 409; **dado** un control ajeno, responde 403; **dado** un archivo de otro tipo o mayor a 2 MB, responde 400 sin guardar nada.

### RF-14 — Revisión de seguimientos
1. **Dado** un control *Enviado*, **cuando** el administrador lo marca *Todo bien* o *Requiere atención* con un comentario, **entonces** queda revisado y el adoptante recibe la notificación con el comentario.
2. **Dado** un comentario vacío o un estado distinto, **entonces** el sistema responde 400; **dado** un control no enviado o ya revisado, responde 409.
3. **Dado** la pantalla del adoptante, **entonces** *Todo bien* se ve en verde con la miniatura y el comentario, y *Requiere atención* en naranja con el comentario.

### RF-15 — Recordatorios de seguimiento
1. **Dado** un control *Pendiente* cuya fecha ya llegó, **cuando** el adoptante inicia sesión o consulta sus notificaciones (o se ejecuta `npm run recordatorios`), **entonces** se crea **un** recordatorio con enlace a su seguimiento.
2. **Dado** que ya existe el recordatorio de ese control, **entonces** no se crea otro aunque las consultas sean simultáneas (restricción UNIQUE).
