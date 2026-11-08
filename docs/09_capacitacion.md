# 9. Plan de capacitación

La capacitación es breve y práctica: micro-módulos de 10 a 20 minutos sobre el sistema real (o su entorno de pruebas), con una guía rápida ilustrada con las capturas reales de [`docs/evidencias/`](evidencias/) y el [manual de usuario](17_manual_usuario.md). En el III Parcial se agregaron los módulos A6 a A8 (entrevista, seguimiento post-adopción y configuración) y B5 a B6 (perfil, entrevista y controles). Se organiza por rol, porque el administrador del refugio y el adoptante usan pantallas y tareas distintas.

| Aspecto | Administrador del refugio | Adoptante |
|---|---|---|
| Modalidad | Presencial o videollamada, con el sistema abierto | Autoaprendizaje: guía rápida dentro del sitio o en PDF de una página |
| Duración total | ≈ 120 minutos | ≈ 40 minutos |
| Entorno | Datos de prueba (`patitas_test` o usuarios demo) para practicar sin afectar datos reales | El sitio real; los pasos no requieren conocimientos técnicos |

## 9.1 Rol: Administrador del refugio

**Usuario objetivo:** voluntarios o personal del refugio que publican mascotas y responden solicitudes. Uso básico de computadora y celular; sin conocimientos técnicos.

**Objetivo:** que gestione de forma autónoma el catálogo (mascotas, fotos y tipos), lleve cada solicitud por sus etapas (entrevista y decisión) y revise los controles post-adopción, entendiendo qué cambia en el sistema con cada acción.

| Micro-módulo | Contenido | Duración | Material |
|---|---|---|---|
| A1. Ingreso y panel | Iniciar sesión, recorrido por las tres secciones del panel, cerrar sesión | 10 min | [`PR-04_login_valido_admin.png`](evidencias/PR-04_login_valido_admin.png), [`pantalla_panel_admin.png`](evidencias/pantalla_panel_admin.png) |
| A2. Publicar y editar mascotas | Agregar una mascota con foto (JPG, PNG o WEBP de hasta 2 MB), editar datos, quitar o reemplazar la foto, marcar como adoptada una mascota entregada fuera del sistema | 20 min | [`PR-11_formulario_con_vista_previa.png`](evidencias/PR-11_formulario_con_vista_previa.png), [`PR-11_mascota_con_foto.png`](evidencias/PR-11_mascota_con_foto.png), [`PR-12_foto_invalida.png`](evidencias/PR-12_foto_invalida.png) |
| A3. Tipos de mascota | Agregar un tipo nuevo (por ejemplo, Hurón), corregir su nombre y desactivarlo en lugar de borrarlo; efecto en los filtros del catálogo | 10 min | [`PR-09_tipo_duplicado.png`](evidencias/PR-09_tipo_duplicado.png), [`PR-13_tipo_desactivado.png`](evidencias/PR-13_tipo_desactivado.png) |
| A4. Revisar solicitudes y perfiles | Tabla de solicitudes en curso, detalle con el perfil del adoptante, qué significa cada etapa | 10 min | [B01](evidencias/final/manual/B01_solicitudes_en_curso.png), [`03_funcionalidades.md` §3.12](03_funcionalidades.md) |
| A5. Reglas y mensajes del sistema | Por qué no se puede cambiar el estado de una mascota con una solicitud activa, por qué no se puede aprobar sin entrevista, qué significa cada mensaje de error y a quién reportar un problema | 15 min | Tabla de mensajes de [`03_funcionalidades.md`](03_funcionalidades.md) |
| **A6. Entrevista presencial** *(nuevo)* | Agendar en el calendario (días y horarios deshabilitados), reprogramar, consultar la Agenda de la semana, marcar como entrevistada con notas, y luego aprobar o rechazar con motivo | 20 min | [B07](evidencias/final/manual/B07_detalle_y_calendario.png), [B08](evidencias/final/manual/B08_entrevista_agendada.png), [B09](evidencias/final/manual/B09_decision.png), [B02](evidencias/final/manual/B02_agenda.png) |
| **A7. Seguimiento post-adopción** *(nuevo)* | Qué controles se crean al aprobar (4, cada 90 días), revisar la foto enviada, comentar y marcar *Todo bien* o *Requiere atención*; recordatorios automáticos y `npm run recordatorios` | 15 min | [B03](evidencias/final/manual/B03_revision_control.png), [E2E-08](evidencias/final/e2e/E2E-08_revision_control.png) |
| **A8. Configuración del refugio** *(nuevo)* | Cambiar la dirección, el horario, los días y la duración de la cita; efecto en las entrevistas nuevas | 10 min | [B04](evidencias/final/manual/B04_configuracion_refugio.png) |

**Guía rápida (una página)**
1. Entra a `login.html` con tu correo de administrador y llegarás al panel.
2. **Solicitudes en curso:** pulsa *Ver detalle*, revisa el perfil, elige un día y un horario en el calendario y pulsa *Agendar entrevista*. Después de la cita: *Marcar como entrevistada* → *Aprobar* o *Rechazar*.
3. **Seguimientos post-adopción:** mira la foto, escribe un comentario y pulsa *Todo bien* o *Requiere atención*.
4. **Gestión de mascotas:** *+ Agregar mascota* → completa los datos → elige una foto → *Guardar*. Para cambiar algo, usa *Editar*.
5. **Tipos de mascota:** escribe el nombre → *Agregar tipo*. Si ya no se usa, *Desactivar*.
6. Lee siempre el mensaje verde (éxito) o rojo (qué corregir) que aparece en cada sección.

**Ejercicio práctico (en el entorno de pruebas)**
1. Publica a "Tigrillo" (Gato, 8 meses) con una foto.
2. Intenta crear el tipo "perro" y explica el mensaje.
3. Crea el tipo "Hurón" y desactívalo.
4. Agenda la entrevista de Vaquita (Ana Martínez) en el primer horario libre del próximo lunes y verifícala en la Agenda.
5. Marca como entrevistada la solicitud de Mechudo, apruébala y comprueba que aparece con *Ver adoptadas* y que tiene 4 controles.
6. Inicia sesión como Edwin, sube la foto del control 2 de Lara y, como admin, márcalo *Todo bien* con un comentario.
7. Intenta subir un archivo `.txt` como foto.

**Evaluación básica (tarea verificable y preguntas)**
- *Tarea:* al terminar el ejercicio, Tigrillo aparece en el catálogo con su foto, Hurón figura como "Desactivado", Vaquita tiene entrevista en la Agenda, Mechudo está *Adoptada* y el control 2 de Lara está *Todo bien*. El instructor lo verifica en el panel.
- *Preguntas:*
  1. ¿Qué le pasa a la mascota cuando apruebas una solicitud? ¿Y cuando la rechazas?
  2. ¿Por qué el sistema no te deja aprobar una solicitud sin entrevista, ni poner "Disponible" a una mascota con una solicitud activa?
  3. ¿Qué formatos y qué tamaño máximo acepta la foto?
  4. ¿Por qué conviene desactivar un tipo en lugar de borrarlo?
  5. ¿De dónde sale el lugar de la entrevista y qué pasa si cambias la dirección del refugio?
- *Criterio de aprobación:* tarea completa y al menos 4 de 5 respuestas correctas.

## 9.2 Rol: Adoptante

**Usuario objetivo:** personas interesadas en adoptar, de cualquier edad, que usan el sitio principalmente desde el celular.

**Objetivo:** que complete su perfil, encuentre una mascota, envíe una solicitud correcta, sepa cuándo y dónde es su entrevista y suba las fotos de los controles post-adopción, sin necesidad de contactar al refugio.

| Micro-módulo | Contenido | Duración | Material |
|---|---|---|---|
| B1. Explorar el catálogo | Buscar por nombre, filtrar por tipo, entender las etiquetas *Disponible* y *En proceso*, ver las adoptadas | 5 min | [`pantalla_catalogo_publico.png`](evidencias/pantalla_catalogo_publico.png), [`PR-28_ver_adoptadas.png`](evidencias/PR-28_ver_adoptadas.png), [`pantalla_movil_catalogo.png`](evidencias/pantalla_movil_catalogo.png) |
| B2. Crear cuenta e ingresar | Registro (contraseña de 8 caracteres o más), inicio de sesión y qué hacer si aparece "Correo o contraseña incorrectos" | 5 min | [`PR-01_registro_exitoso.png`](evidencias/PR-01_registro_exitoso.png), [`PR-02_registro_correo_duplicado.png`](evidencias/PR-02_registro_correo_duplicado.png), [`PR-05_login_error.png`](evidencias/PR-05_login_error.png) |
| B3. Enviar una solicitud | Ficha de la mascota → *Solicitar adopción* → teléfono con formato `8888-1234`, dirección y motivo | 7 min | [`PR-08_detalle_mascota.png`](evidencias/PR-08_detalle_mascota.png), [`PR-15_telefono_invalido.png`](evidencias/PR-15_telefono_invalido.png), [`PR-14_solicitud_enviada.png`](evidencias/PR-14_solicitud_enviada.png) |
| B4. Seguimiento y notificaciones | *Mis solicitudes*, línea de tiempo de 5 etapas, contador de notificaciones y cómo marcarlas como leídas | 8 min | [`PR-21_seguimiento_solicitada.png`](evidencias/PR-21_seguimiento_solicitada.png), [A09](evidencias/final/manual/A09_notificaciones.png) |
| **B5. Mi perfil y la entrevista** *(nuevo)* | Completar el perfil (obligatorio), leer la tarjeta "Tu entrevista" (día, hora y dirección) y qué llevar | 7 min | [A02](evidencias/final/manual/A02_mi_perfil.png), [A07](evidencias/final/manual/A07_seguimiento_entrevista.png) |
| **B6. Controles post-adopción** *(nuevo)* | Qué significa cada estado del control, cómo subir la foto con vista previa y qué hacer con un recordatorio o con *Requiere atención* | 8 min | [A08](evidencias/final/manual/A08_subir_foto_control.png), [E2E-07](evidencias/final/e2e/E2E-07_control_enviado.png) |

**Guía rápida (una página)**
1. Entra a *Mascotas* y elige la que te guste; puedes filtrar por tipo o buscar por nombre.
2. Si dice *Disponible*, abre su ficha y presiona *Solicitar adopción* (te pedirá crear una cuenta o iniciar sesión).
3. Escribe tu teléfono así: `8888-1234`, tu dirección y por qué quieres adoptarla.
4. Revisa *Mis solicitudes* y el número naranja junto a *Notificaciones*: ahí verás cuándo es tu entrevista y si tu solicitud fue aprobada o rechazada.
5. Si adoptaste, cada 3 meses sube una foto de tu mascota en *Seguimiento de tu adopción*.

**Ejercicio práctico**
1. Crea una cuenta y completa *Mi perfil*.
2. Encuentra un gato disponible.
3. Envía una solicitud escribiendo primero el teléfono sin guion y corrígelo cuando el sistema lo indique.
4. Abre el seguimiento de tu solicitud.

**Evaluación básica**
- *Tarea:* la solicitud aparece en *Mis solicitudes* como *Solicitada*. Lo verifica el refugio en su panel.
- *Preguntas:*
  1. ¿Por qué no puedes solicitar una mascota que dice *En proceso*?
  2. ¿En qué formato debe ir el teléfono?
  3. ¿Dónde te enteras del día de tu entrevista y de si tu solicitud fue aprobada?
  4. ¿Cuándo puedes subir la foto de un control?
- *Criterio de aprobación:* tarea completa y al menos 3 de 4 respuestas correctas.

## 9.3 Seguimiento de la capacitación

- Durante el piloto (ver [`10_estrategia_implementacion.md`](10_estrategia_implementacion.md)), registrar las dudas frecuentes y convertirlas en mejoras de la guía o de los mensajes del sistema.
- Los módulos A6 a A8, B5 y B6 cubren la entrevista presencial y el seguimiento post-adopción (PB-12 a PB-14), incorporados en el III Parcial.
