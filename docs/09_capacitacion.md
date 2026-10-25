# 9. Plan de capacitación

La capacitación es breve y práctica: micro-módulos de 10 a 20 minutos sobre el sistema real (o su entorno de pruebas), con una guía rápida ilustrada con las capturas de [`docs/evidencias/`](evidencias/). Se organiza por rol, porque el administrador del refugio y el adoptante usan pantallas y tareas distintas.

| Aspecto | Administrador del refugio | Adoptante |
|---|---|---|
| Modalidad | Presencial o videollamada, con el sistema abierto | Autoaprendizaje: guía rápida dentro del sitio o en PDF de una página |
| Duración total | ≈ 75 minutos | ≈ 25 minutos |
| Entorno | Datos de prueba (`patitas_test` o usuarios demo) para practicar sin afectar datos reales | El sitio real; los pasos no requieren conocimientos técnicos |

## 9.1 Rol: Administrador del refugio

**Usuario objetivo:** voluntarios o personal del refugio que publican mascotas y responden solicitudes. Uso básico de computadora y celular; sin conocimientos técnicos.

**Objetivo:** que gestione de forma autónoma el catálogo (mascotas, fotos y tipos) y responda las solicitudes de adopción en el panel, entendiendo qué cambia en el sistema con cada acción.

| Micro-módulo | Contenido | Duración | Material |
|---|---|---|---|
| A1. Ingreso y panel | Iniciar sesión, recorrido por las tres secciones del panel, cerrar sesión | 10 min | [`PR-04_login_valido_admin.png`](evidencias/PR-04_login_valido_admin.png), [`pantalla_panel_admin.png`](evidencias/pantalla_panel_admin.png) |
| A2. Publicar y editar mascotas | Agregar una mascota con foto (JPG, PNG o WEBP de hasta 2 MB), editar datos, quitar o reemplazar la foto, marcar como adoptada una mascota entregada fuera del sistema | 20 min | [`PR-11_formulario_con_vista_previa.png`](evidencias/PR-11_formulario_con_vista_previa.png), [`PR-11_mascota_con_foto.png`](evidencias/PR-11_mascota_con_foto.png), [`PR-12_foto_invalida.png`](evidencias/PR-12_foto_invalida.png) |
| A3. Tipos de mascota | Agregar un tipo nuevo (por ejemplo, Hurón), corregir su ícono y desactivarlo en lugar de borrarlo; efecto en los filtros del catálogo | 10 min | [`PR-09_tipo_duplicado.png`](evidencias/PR-09_tipo_duplicado.png), [`PR-13_tipo_desactivado.png`](evidencias/PR-13_tipo_desactivado.png) |
| A4. Responder solicitudes | Leer solicitante, teléfono y motivo; aprobar o rechazar; qué pasa con la mascota (*Adoptada* o *Disponible*) y con la notificación del adoptante | 20 min | [`PR-18_solicitud_aprobada.png`](evidencias/PR-18_solicitud_aprobada.png), [`03_funcionalidades.md` §3.12](03_funcionalidades.md) |
| A5. Reglas y mensajes del sistema | Por qué no se puede cambiar el estado de una mascota con solicitud en revisión, qué significa cada mensaje de error y a quién reportar un problema | 15 min | Tabla de mensajes de [`03_funcionalidades.md`](03_funcionalidades.md) |

**Guía rápida (una página)**
1. Entra a `login.html` con tu correo de administrador y llegarás al panel.
2. **Solicitudes pendientes:** revisa el motivo y el teléfono, y presiona *Aprobar* o *Rechazar* (el sistema pide confirmación).
3. **Gestión de mascotas:** *+ Agregar mascota* → completa los datos → elige una foto → *Guardar*. Para cambiar algo, usa *Editar*.
4. **Tipos de mascota:** escribe el nombre y un emoji → *Agregar tipo*. Si ya no se usa, *Desactivar*.
5. Lee siempre el mensaje verde (éxito) o rojo (qué corregir) que aparece en cada sección.

**Ejercicio práctico (en el entorno de pruebas)**
1. Publica a "Tigrillo" (Gato, 8 meses) con una foto.
2. Intenta crear el tipo "perro" y explica el mensaje.
3. Crea el tipo "Hurón" y desactívalo.
4. Aprueba la solicitud de Mechudo y comprueba en el catálogo que ya no aparece entre las disponibles, sino con *Ver adoptadas*.
5. Intenta subir un archivo `.txt` como foto.

**Evaluación básica (tarea verificable y preguntas)**
- *Tarea:* al terminar el ejercicio, Tigrillo aparece en el catálogo con su foto, Hurón figura como "Desactivado" y Mechudo está *Adoptada*. El instructor lo verifica en el panel.
- *Preguntas:*
  1. ¿Qué le pasa a la mascota cuando apruebas una solicitud? ¿Y cuando la rechazas?
  2. ¿Por qué el sistema no te deja poner "Disponible" a una mascota con una solicitud en revisión?
  3. ¿Qué formatos y qué tamaño máximo acepta la foto?
  4. ¿Por qué conviene desactivar un tipo en lugar de borrarlo?
- *Criterio de aprobación:* tarea completa y al menos 3 de 4 respuestas correctas.

## 9.2 Rol: Adoptante

**Usuario objetivo:** personas interesadas en adoptar, de cualquier edad, que usan el sitio principalmente desde el celular.

**Objetivo:** que encuentre una mascota, envíe una solicitud correcta y sepa dónde consultar el resultado sin necesidad de contactar al refugio.

| Micro-módulo | Contenido | Duración | Material |
|---|---|---|---|
| B1. Explorar el catálogo | Buscar por nombre, filtrar por tipo, entender las etiquetas *Disponible* y *En proceso*, ver las adoptadas | 5 min | [`pantalla_catalogo_publico.png`](evidencias/pantalla_catalogo_publico.png), [`PR-28_ver_adoptadas.png`](evidencias/PR-28_ver_adoptadas.png), [`pantalla_movil_catalogo.png`](evidencias/pantalla_movil_catalogo.png) |
| B2. Crear cuenta e ingresar | Registro (contraseña de 8 caracteres o más), inicio de sesión y qué hacer si aparece "Correo o contraseña incorrectos" | 5 min | [`PR-01_registro_exitoso.png`](evidencias/PR-01_registro_exitoso.png), [`PR-02_registro_correo_duplicado.png`](evidencias/PR-02_registro_correo_duplicado.png), [`PR-05_login_error.png`](evidencias/PR-05_login_error.png) |
| B3. Enviar una solicitud | Ficha de la mascota → *Solicitar adopción* → teléfono con formato `8888-1234`, dirección y motivo | 7 min | [`PR-08_detalle_mascota.png`](evidencias/PR-08_detalle_mascota.png), [`PR-15_telefono_invalido.png`](evidencias/PR-15_telefono_invalido.png), [`PR-14_solicitud_enviada.png`](evidencias/PR-14_solicitud_enviada.png) |
| B4. Seguimiento y notificaciones | *Mis solicitudes*, línea de tiempo del seguimiento, contador de notificaciones y cómo marcarlas como leídas | 8 min | [`PR-21_seguimiento_en_revision.png`](evidencias/PR-21_seguimiento_en_revision.png), [`PR-18_seguimiento_aprobada.png`](evidencias/PR-18_seguimiento_aprobada.png), [`PR-22_notificaciones.png`](evidencias/PR-22_notificaciones.png) |

**Guía rápida (una página)**
1. Entra a *Mascotas* y elige la que te guste; puedes filtrar por tipo o buscar por nombre.
2. Si dice *Disponible*, abre su ficha y presiona *Solicitar adopción* (te pedirá crear una cuenta o iniciar sesión).
3. Escribe tu teléfono así: `8888-1234`, tu dirección y por qué quieres adoptarla.
4. Revisa *Mis solicitudes* y el número naranja junto a *Notificaciones*: ahí verás si tu solicitud fue aprobada o rechazada.

**Ejercicio práctico**
1. Crea una cuenta.
2. Encuentra un gato disponible.
3. Envía una solicitud escribiendo primero el teléfono sin guion y corrígelo cuando el sistema lo indique.
4. Abre el seguimiento de tu solicitud.

**Evaluación básica**
- *Tarea:* la solicitud aparece en *Mis solicitudes* como *En revisión*. Lo verifica el refugio en su panel.
- *Preguntas:*
  1. ¿Por qué no puedes solicitar una mascota que dice *En proceso*?
  2. ¿En qué formato debe ir el teléfono?
  3. ¿Dónde te enteras de que tu solicitud fue aprobada?
- *Criterio de aprobación:* tarea completa y al menos 2 de 3 respuestas correctas.

## 9.3 Seguimiento de la capacitación

- Durante el piloto (ver [`10_estrategia_implementacion.md`](10_estrategia_implementacion.md)), registrar las dudas frecuentes y convertirlas en mejoras de la guía o de los mensajes del sistema.
- Repetir el módulo A4 cuando se incorporen la entrevista presencial y la aprobación final (PB-12, PB-13).
