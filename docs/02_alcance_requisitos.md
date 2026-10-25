# 2. Alcance y requisitos actualizados

> Versión 2.0 — Segundo Parcial. Reemplaza la sección de alcance y requisitos del Hito 1 (`docs/hito1/`).
> Los estados de esta sección se actualizan al cerrar cada fase para que coincidan con el código de la rama `main`.

## 2.1 Alcance actualizado

**Objetivo general:** desarrollar una aplicación web que centralice el catálogo de mascotas disponibles para adopción, el envío de solicitudes y su seguimiento, mejorando la comunicación entre el refugio y los adoptantes.

**Cambio principal respecto al Hito 1:** el Hito 1 era un prototipo que simulaba los datos en el navegador (localStorage, "sin backend real todavía"). En esta etapa el sistema pasa a tener **backend real** (Node.js + Express), **base de datos relacional** (MySQL 8.0) y **autenticación segura** (contraseñas con hash bcrypt y token JWT).

### Dentro del alcance
- Registro e inicio de sesión de adoptantes con contraseñas cifradas (hash) y token de sesión.
- Catálogo público de mascotas con búsqueda por nombre y filtros por tipo, generados desde la base de datos.
- Ficha de detalle pública de cada mascota, con fotografía real o ícono según su tipo.
- Envío de solicitudes de adopción con validación en el navegador **y en el servidor**.
- Seguimiento del estado de la solicitud (Solicitada → En revisión → Aprobada/Rechazada) e historial propio.
- Notificaciones **internas** guardadas en la base de datos, con contador de no leídas.
- Panel administrativo: responder solicitudes, gestionar mascotas (agregar, editar, cambiar estado, subir foto) y gestionar los tipos de mascota.
- Un único refugio administrando el sistema.
- Interfaz web responsive (computadora y móvil).
- Migración de los datos del prototipo (localStorage) hacia la base de datos.

### Fuera del alcance (por ahora)
- Notificaciones por correo electrónico (quedan simuladas como notificaciones internas; ver PB-09).
- Pagos o donaciones en línea.
- Aplicación móvil nativa (Android/iOS).
- Múltiples refugios en una sola plataforma (PB-15).
- Historial médico/veterinario detallado.
- Chat en tiempo real entre adoptante y refugio.
- Entrevista presencial y seguimiento post-adopción (PB-12 a PB-14).

### Usuarios
| Rol | Descripción |
|---|---|
| Adoptante | Persona que se registra, consulta mascotas, solicita adopciones y da seguimiento |
| Administrador del refugio | Gestiona mascotas, tipos de mascota y responde las solicitudes |
| Visitante | Persona sin cuenta: puede ver el inicio, el catálogo y el detalle de las mascotas |

## 2.2 Requisitos funcionales

| Código | Descripción | Pantalla | Estado |
|---|---|---|---|
| RF-01 | El sistema debe permitir el registro de nuevos adoptantes | Registro | **Implementado** (`POST /api/auth/registro`) |
| RF-02 | El sistema debe permitir el inicio de sesión de adoptantes registrados | Login | **Implementado** (`POST /api/auth/login`, JWT) |
| RF-03 | El sistema debe mostrar el catálogo de mascotas disponibles | Catálogo | **Implementado** (`GET /api/mascotas`, filtros desde `GET /api/tipos-mascota`) |
| RF-04 | El sistema debe mostrar la ficha detallada de una mascota | Detalle | **Implementado** (`GET /api/mascotas/:id`, público) |
| RF-05 | El sistema debe permitir consultar el estado de una solicitud de adopción | Seguimiento | **Implementado** (`GET /api/solicitudes/:id`, solo dueño o admin) |
| RF-06 | El sistema debe permitir enviar una solicitud de adopción | Solicitar adopción | **Implementado** (`POST /api/solicitudes`, transacción) |
| RF-07 | El sistema debe notificar al adoptante cuando cambie el estado de su solicitud | Notificaciones | Prototipo (localStorage) |
| RF-08 | El sistema debe permitir al administrador revisar y responder solicitudes | Panel de Administración | **Implementado** (`GET`/`PATCH /api/admin/solicitudes`, transacción) |
| RF-09 | El sistema debe permitir al administrador gestionar el catálogo de mascotas (agregar, editar, cambiar estado, gestionar tipos) | Panel de Administración | **Implementado** (`POST`/`PUT /api/mascotas`, `POST`/`PUT /api/tipos-mascota`) |
| RF-10 | El sistema debe permitir consultar el historial de solicitudes propias | Mis Solicitudes | **Implementado** (`GET /api/solicitudes/mias`) |

## 2.3 Requisitos no funcionales

| Código | Descripción | Estado |
|---|---|---|
| RNF-01 | El sistema debe responder las consultas de seguimiento en menos de 2 segundos | **Cumple** en la medición local (≈12 ms); se formaliza como prueba automática en la fase de pruebas |
| RNF-02 | Las contraseñas de usuario deben almacenarse cifradas (hash) | **Cumple**: hash bcrypt (10 rondas) en MySQL; el navegador solo guarda el token |
| RNF-03 | La aplicación debe ser responsive (accesible desde móvil y escritorio) | **Cumple**: se agregó la etiqueta `viewport`, que faltaba en el prototipo (sin ella el CSS responsive no se aplicaba en móviles) |
| RNF-04 | Solo un administrador autenticado puede modificar el catálogo o el estado de una solicitud | **Cumple**: `requiereAuth` + `requiereRol('admin')` protegen la gestión de mascotas, de tipos y la respuesta de solicitudes; un adoptante recibe 403 |

## 2.4 Backlog priorizado actualizado

| ID | Funcionalidad / Tarea | Prioridad | Estado | Evidencia |
|---|---|---|---|---|
| PB-01 | Registro y autenticación de adoptantes | Alta | **Completado** con backend | `src/modules/usuarios/`, `public/js/paginas/login.js`, `public/js/paginas/registro.js` |
| PB-02 | Catálogo de mascotas con filtros | Alta | **Completado** con backend | `src/modules/mascotas/`, `public/js/paginas/catalogo.js` |
| PB-03 | Solicitud y seguimiento de adopción | Alta | **Completado** con backend y transacciones | `src/modules/solicitudes/`, `public/js/paginas/solicitar.js`, `public/js/paginas/seguimiento.js` |
| PB-04 | Panel administrativo (aprobar/rechazar) | Alta | **Completado** con backend y transacciones | `src/modules/solicitudes/`, `public/js/paginas/admin.js` |
| PB-05 | Conexión a base de datos real (**MySQL**; antes MongoDB) | Alta | **Completado** (esquema, seed y pool de conexiones) | `database/01_schema.sql`, `src/config/db.js` |
| PB-06 | Backend real con Node.js + Express | Alta | En progreso: usuarios, tipos, mascotas y solicitudes listos; falta la consulta de notificaciones | `src/app.js`, `src/modules/` |
| PB-07 | Autenticación segura (hash bcrypt de contraseñas y JWT) | Alta | **Completado** | `src/modules/usuarios/servicio.js`, `src/middlewares/autenticacion.js` |
| PB-08 | Validación de formato de teléfono | Media | **Completado** en el navegador, el servidor y la base de datos (hallazgo 5) | `public/js/paginas/solicitar.js`, `src/modules/solicitudes/validaciones.js` |
| PB-09 | Notificaciones de cambio de estado (**internas en BD**; el correo queda fuera de alcance) | Media | Pendiente | — |
| PB-10 | Fotografías reales de las mascotas | Media | Pendiente | — |
| PB-11 | Reportes de adopciones para el refugio | Baja | Pendiente (mejora futura) | — |
| PB-12 | Agendar cita de entrevista presencial tras la solicitud | Media | Pendiente (mejora futura) | — |
| PB-13 | Registrar resultado de la entrevista y aprobación final | Media | Pendiente (mejora futura) | — |
| PB-14 | Seguimiento post-adopción con fotos periódicas (cada 3 meses) | Baja | Pendiente (mejora futura) | — |
| PB-15 | Soporte para múltiples refugios en una sola plataforma (registro de refugios con aprobación) | Baja | Pendiente (mejora futura) | — |
| PB-16 | Tipos de mascota administrables (catálogo en BD en lugar de lista fija) | Media | **Completado** | `src/modules/tipos/`, `public/js/paginas/admin.js` |

## 2.5 Estado de los hallazgos de usabilidad

| Nº | Hallazgo | Estado Hito 1 | Estado actual | Evidencia |
|---|---|---|---|---|
| 1 | Tipografía distinta en el campo de texto largo | Corregido | Corregido | `public/css/styles.css` |
| 2 | Estado de la mascota desincronizado con la solicitud | Corregido | Corregido | `public/admin.html` |
| 3 | Menú autenticado visible en Registro/Login con sesión iniciada | Pendiente | **Corregido**: con sesión se redirige al catálogo o al panel; sin sesión solo se ve el menú público | `public/login.html`, `public/registro.html`, `public/js/app.js` |
| 4 | Fotos de mascotas como ícono, no imágenes reales | Parcial | Parcial (se cierra con PB-10) | — |
| 5 | Teléfono sin validación de formato | Corregido | Corregido en el navegador, en el servidor (400) y en la BD (`CHECK`) | `public/js/paginas/solicitar.js`, `src/modules/solicitudes/validaciones.js`, `database/01_schema.sql` |
| 6 | *(nuevo)* La ficha de detalle exigía sesión aunque el catálogo público enlazaba a ella | — | **Corregido**: detalle público, con botón para iniciar sesión | `public/detalle.html` |
| 7 | *(nuevo)* Datos de usuario insertados con `innerHTML` sin escapar (riesgo XSS) | — | **Corregido**: función `escaparHtml` | `public/js/comun.js` |
| 8 | *(nuevo)* Las páginas no tenían la etiqueta `viewport`, por lo que en móviles se veían con ancho de escritorio | — | **Corregido** | Todas las páginas de `public/` |

## 2.6 Criterios de aceptación (RF-01 a RF-10)

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
1. **Dado** cualquier visitante, **cuando** abre el catálogo, **entonces** ve las mascotas con nombre, edad, tipo, estado y foto (o ícono del tipo).
2. **Dado** el catálogo, **cuando** escribe parte del nombre o elige un tipo, **entonces** solo se muestran las mascotas que coinciden.
3. **Dado** que los tipos vienen de la base de datos, **cuando** el administrador agrega o desactiva un tipo, **entonces** los filtros del catálogo se actualizan sin cambiar código.
4. **Dado** una búsqueda sin coincidencias, **entonces** se muestra *"No se encontraron mascotas con ese criterio"*.

### RF-04 — Ficha de detalle
1. **Dado** cualquier visitante, **cuando** abre una mascota del catálogo, **entonces** ve su foto, raza, edad, sexo, descripción y estado.
2. **Dado** una mascota *Disponible* y un adoptante con sesión, **entonces** se muestra el botón *Solicitar adopción*; sin sesión, el botón invita a iniciar sesión.
3. **Dado** una mascota *En proceso* o *Adoptada*, **entonces** el botón aparece deshabilitado como *Ya no disponible*.
4. **Dado** un id inexistente, **entonces** se muestra *"Mascota no encontrada"* (HTTP 404).

### RF-05 — Seguimiento de solicitud
1. **Dado** un adoptante con una solicitud, **cuando** abre su seguimiento, **entonces** ve la línea de tiempo Solicitada → En revisión → Aprobada/Rechazada con el paso actual resaltado y la fecha.
2. **Dado** una solicitud de otro usuario, **cuando** un adoptante intenta abrirla, **entonces** el sistema lo impide (HTTP 403 o 404).
3. **Dado** la consulta de seguimiento, **entonces** la respuesta llega en menos de 2 segundos (RNF-01).

### RF-06 — Enviar solicitud de adopción
1. **Dado** un adoptante con sesión y una mascota *Disponible*, **cuando** envía teléfono con formato `8888-1234`, dirección y motivo, **entonces** la solicitud se guarda *En revisión*, la mascota cambia a *En proceso* y la solicitud aparece en *Mis Solicitudes*.
2. **Dado** un campo obligatorio vacío o un teléfono con otro formato, **entonces** el servidor rechaza la solicitud (HTTP 400) con un mensaje claro.
3. **Dado** una mascota que ya no está *Disponible*, **cuando** se intenta solicitar, **entonces** el servidor responde HTTP 409 y no se crea la solicitud.
4. **Dado** que el adoptante ya tiene una solicitud activa para esa mascota, **entonces** no puede crear otra (HTTP 409).
5. **Dado** que dos personas solicitan la misma mascota al mismo tiempo, **entonces** solo una solicitud se guarda (transacción con bloqueo de fila).

### RF-07 — Notificaciones
1. **Dado** que el administrador aprueba o rechaza una solicitud, **entonces** el adoptante recibe una notificación interna con el resultado.
2. **Dado** notificaciones sin leer, **entonces** la barra de navegación muestra el contador de no leídas.
3. **Dado** una notificación, **cuando** el adoptante la marca como leída, **entonces** deja de contarse y solo el dueño puede marcarla.
4. El envío por correo electrónico queda fuera de alcance en esta versión.

### RF-08 — Revisar y responder solicitudes (administrador)
1. **Dado** un usuario con rol *administrador*, **cuando** abre el panel, **entonces** ve las solicitudes *En revisión* con la mascota y el solicitante.
2. **Dado** una solicitud pendiente, **cuando** la aprueba, **entonces** la solicitud pasa a *Aprobada*, la mascota a *Adoptada* y se crea la notificación, todo en una sola transacción.
3. **Dado** una solicitud pendiente, **cuando** la rechaza, **entonces** la solicitud pasa a *Rechazada* y la mascota vuelve a *Disponible*.
4. **Dado** un adoptante, **cuando** intenta entrar al panel o llamar a la API de administración, **entonces** es redirigido y la API responde HTTP 403 (RNF-04).
5. **Dado** que falla cualquier paso de la aprobación, **entonces** no queda guardado ningún cambio (rollback).

### RF-09 — Gestión del catálogo (administrador)
1. **Dado** el administrador, **cuando** agrega una mascota con nombre, tipo, edad, raza, sexo y descripción, **entonces** aparece en el catálogo como *Disponible*.
2. **Dado** una mascota existente, **cuando** el administrador edita sus datos, cambia su estado o sube una foto (JPG, PNG o WEBP de hasta 2 MB), **entonces** los cambios se ven en el catálogo y el detalle.
3. **Dado** el administrador, **cuando** agrega un tipo de mascota con un nombre que ya existe, **entonces** el sistema responde HTTP 409; si lo desactiva, deja de ofrecerse en los formularios y filtros.
4. **Dado** datos faltantes o un tipo inexistente, **entonces** el servidor responde HTTP 400.

### RF-10 — Historial de solicitudes propias
1. **Dado** un adoptante con sesión, **cuando** abre *Mis Solicitudes*, **entonces** ve solo sus solicitudes, de la más reciente a la más antigua, con mascota, fecha y estado.
2. **Dado** un adoptante sin solicitudes, **entonces** ve *"Aún no has enviado solicitudes"* con un enlace al catálogo.
3. **Dado** una solicitud del historial, **cuando** la selecciona, **entonces** abre su seguimiento (RF-05).
