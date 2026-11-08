# 14. Suite final de verificación y validación (V&V)

> III Parcial · versión `v1.0.0` · todas las ejecuciones son del **7 de noviembre de 2026** en el equipo de desarrollo (Windows 10, Node v24.20.0, npm 11.19.0, MySQL 8.0.46, Microsoft Edge para Playwright), sobre la base de pruebas `patitas_test`, que se reinstala antes de cada caso.
> Las cifras salen de las salidas guardadas en [`evidencias/final/`](evidencias/final/). Nada de esta tabla es proyectado.

## 14.1 Cómo se ejecuta

| Suite | Comando | Qué cubre | Salida guardada |
|---|---|---|---|
| Automatizada de API e integración | `npm test` | 50 casos Jest + Supertest contra la API real y MySQL (PR-01 a PR-50) | [`npm-test-cobertura.txt`](evidencias/final/npm-test-cobertura.txt) |
| De extremo a extremo (E2E) | `npm run test:e2e` | 16 casos con Playwright y Edge: interfaz → API → BD | [`e2e/resultados.json`](evidencias/final/e2e/resultados.json) y 19 capturas en [`e2e/`](evidencias/final/e2e/) |
| Verificaciones operativas | `npm run medir:tiempos`, procedimiento del doc. 18, README | RNF-01, respaldo y restauración, instalación desde cero | [`rendimiento_rnf01.txt`](evidencias/final/rendimiento_rnf01.txt), [`respaldo_recuperacion.txt`](evidencias/final/respaldo_recuperacion.txt), [`instalacion_desde_cero.txt`](evidencias/final/instalacion_desde_cero.txt) |
| Integración continua | GitHub Actions en cada PR | `npm test` en Ubuntu + MySQL 8.0, SonarCloud, DeepSource y Snyk | [Ejecución del PR #17](https://github.com/melanie05code/patitas-conectadas/actions/runs/42425820515) |

**Ejecutor:** las suites son automatizadas. Las lanzó la autora en su equipo; en la columna *Ejecutor* se indica la herramienta que ejecuta los pasos.

## 14.2 Resumen cuantitativo

| Suite | Ejecutadas | Aprobadas | Fallidas | Bloqueadas |
|---|---|---|---|---|
| Jest + Supertest (PR-01 a PR-50) | 50 | 50 | 0 | 0 |
| E2E Playwright (E2E-01 a E2E-16) | 16 | 16 | 0 | 0 |
| Verificaciones operativas (VO-01 a VO-03) | 3 | 3 | 0 | 0 |
| **Total** | **69** | **69** | **0** | **0** |

**Historial honesto de la ejecución E2E de hoy:**
- **Primera corrida (6/16):** 9 fallas se debían al propio script, que abría `login.html` con una sesión activa y la página redirigía. La décima (E2E-15) era un defecto real de la interfaz móvil, DEF-21 en la [bitácora](15_bitacora_defectos.md).
- **Segunda corrida (14/16), con el script ya corregido:** quedaba otro caso de sesión en E2E-09, que se corrigió en el script, y el defecto real de E2E-15.
- **Tercera corrida, después de corregir la barra en `1cc3453`:** 16/16.

**Cobertura:** la calcula **Jest** (`--coverage`) solo sobre los archivos de `collectCoverageFrom` en [`jest.config.js`](../jest.config.js): `src/**/*.js` y `database/**/*.js`, sin `src/server.js` ni `database/generar-seed.js`, que son puntos de entrada. El frontend (`public/`) y `scripts/` no entran en la cobertura; se verifican con E2E.

| Métrica (Jest) | Valor |
|---|---|
| Líneas | **93,48 %** (1278/1367) |
| Sentencias | 88,23 % (1380/1564) |
| Funciones | 90,36 % (272/301) |
| Ramas | 67,26 % (526/782) |

El archivo con menos cobertura es `src/modules/mascotas/servicio.js` (45 % de sentencias): las ramas de edición con cambio de foto se prueban por E2E (E2E-03), no con Jest. La cobertura de ramas (67 %) es la métrica más débil y queda como acción futura.

## 14.3 Casos automatizados de API e integración (Jest + Supertest)

Tipos: **P** positivo · **N** negativo · **L** límite · **I** integración interfaz–API–BD · **R** roles/permisos · **Pe** persistencia · **RN** regla de negocio.
Precondición común a todos: base `patitas_test` recién instalada con los datos semilla (3 usuarios, 10 mascotas, 5 solicitudes, 4 entrevistas, 8 controles).
Fecha de todos: 2026-11-07 · Ejecutor: Jest + Supertest · Evidencia: [`npm-test-cobertura.txt`](evidencias/final/npm-test-cobertura.txt) (más el archivo de prueba indicado).

| Código | Requisito | Tipo | Precondiciones | Entradas | Pasos | Esperado | Obtenido | Estado |
|---|---|---|---|---|---|---|---|---|
| PR-01 | RF-01, RNF-02 | P, Pe | Correo no registrado | nombre, correo, contraseña de 16 caracteres | `POST /api/auth/registro`; leer `usuarios` | 201 + token; `password_hash` bcrypt `$2b$10$` | 201; hash bcrypt verificado | Aprobado |
| PR-02 | RF-01 | N | Correo ya registrado | mismo correo con otras mayúsculas | `POST /api/auth/registro` | 409 "Ya existe una cuenta con ese correo." | 409 con ese mensaje | Aprobado |
| PR-03 | RF-01 | N, L | — | nombre de 1 letra, correo `no-es-correo`, contraseña de 3 caracteres | `POST /api/auth/registro` sin pasar por el navegador | 400 con los tres mensajes | 400 con los tres mensajes | Aprobado |
| PR-04 | RF-02 | P | Usuario admin semilla | correo y contraseña correctos | `POST /api/auth/login` | 200 + JWT con rol `admin` | 200, rol `admin` en el token | Aprobado |
| PR-05 | RF-02 | N | Usuario existente | contraseña incorrecta y correo inexistente | `POST /api/auth/login` | 401 con el mismo mensaje genérico | 401 "Correo o contraseña incorrectos." | Aprobado |
| PR-06 | RF-02 | N, L | Contador de intentos en cero | 5 contraseñas incorrectas + 1 | 6 × `POST /api/auth/login` | Del 6.º en adelante, 429 | 429 en el 6.º intento | Aprobado |
| PR-07 | RF-03 | P | Seed | `tipoId=2`; `q=chu`; tipos con mascotas | `GET /api/mascotas`, `GET /api/tipos-mascota` | Gatos: Calenturiento y Encantador; búsqueda: Mechudo; filtros: Perro, Gato, Ave | Igual | Aprobado |
| PR-08 | RF-04 | P, N | Seed | id 10 (Lara) e id 999 | `GET /api/mascotas/:id` sin sesión | 200 y 404 | 200 y 404 | Aprobado |
| PR-09 | RF-09 | N, RN | Tipo "Perro" existente | `{nombre:"perro"}` | `POST /api/tipos-mascota` (admin) | 409 | 409 | Aprobado |
| PR-10 | RF-09, RNF-04 | R | Adoptante con sesión | tipo y mascota nuevos | `POST` como adoptante y sin token | 403 y 401 | 403 y 401 | Aprobado |
| PR-11 | RF-09, PB-10 | P, Pe | Admin | JPG real + datos | `POST /api/mascotas` multipart | 201, archivo guardado en `uploads-pruebas/` | 201, archivo presente | Aprobado |
| PR-12 | RF-09 | N | Admin | `.txt` y texto disfrazado de `.jpg` | `POST /api/mascotas` | 400 y archivo borrado | 400, carpeta sin cambios | Aprobado |
| PR-13 | RF-09, PB-16 | RN | Tipo Conejo activo | desactivarlo y crear mascota con él | `PUT` y `POST` | Deja de listarse; 400 al usarlo | Igual al esperado | Aprobado |
| PR-14 | RF-06, RF-07 | P, Pe | Edwin con perfil | solicitud válida para Cjotas | `POST /api/solicitudes` | 201 "Solicitada", mascota "En proceso", notificación | Igual al esperado | Aprobado |
| PR-15 | RF-06 | N, L | Edwin | teléfono `88881234` | `POST /api/solicitudes` | 400 formato 8888-1234 | 400; mascota sigue Disponible | Aprobado |
| PR-16 | RF-06 | N, RN | Encantador Adoptada; Mechudo con solicitud activa | solicitudes a ambas | `POST /api/solicitudes` | 409 | 409 | Aprobado |
| PR-17 | RF-08, RNF-04 | R | Edwin | `GET /api/admin/solicitudes`, `PATCH .../1/estado` | Llamar como adoptante | 403; la solicitud no cambia | 403; sigue "Entrevista programada" | Aprobado |
| PR-18 | RF-08, RF-07 | P, Pe | Solicitud 1 marcada como entrevistada | `{estado:"Aprobada"}` | `PATCH .../1/estado` y luego otra respuesta | 200, mascota Adoptada, notificación; segunda respuesta 409 | Igual al esperado | Aprobado |
| PR-19 | RF-08 | RN, Pe | Fallo simulado al crear la notificación | Aprobar | `PATCH .../estado` | 500 y rollback total | 500; BD idéntica a la anterior | Aprobado |
| PR-20 | RF-06 | RN, Pe | Dos adoptantes con perfil | dos `POST` simultáneos a El Hambriento | `Promise.all` | Un 201 y un 409; 1 fila | [201, 409]; 1 fila | Aprobado |
| PR-21 | RF-05, RNF-01, RNF-04 | P, R | Solicitud 1 de Edwin | — | `GET /api/solicitudes/1` como dueño y como otro | 200 en < 2 s sin notas internas; 403 al ajeno | 200 en < 2 s; 403 | Aprobado |
| PR-22 | RF-07 | R, Pe | Edwin con 4 no leídas (incluye el recordatorio) | marcar una como leída | `PATCH` como otra persona y como dueño | 403; luego contador 4 → 3 | 403; 4 → 3 | Aprobado |
| PR-23 | RF-07 | R | — | sin token | `GET /api/notificaciones` | 401 | 401 | Aprobado |
| PR-24 | Migración | P | — | correos, teléfonos y fechas del prototipo | Funciones de `transformar.js` | Normalizados | Normalizados | Aprobado |
| PR-25 | Migración | I, Pe | Respaldo de ejemplo | `respaldo_localstorage.ejemplo.json` | ETL completo | Aceptada; "En revisión" → "Solicitada"; conteos esperados | Aceptada; 5 solicitudes insertadas y 2 descartadas | Aprobado |
| PR-26 | Migración | RN | Umbral de descartes 0 | mismo respaldo | ETL con `--max-descartes 0` | Rollback, destino intacto | Destino intacto | Aprobado |
| PR-27 | Migración | R | — | `--bd patitas_conectadas` sin confirmar | ETL | Se niega a correr | Se niega | Aprobado |
| PR-28 | RF-03 | P | Seed | `estado=Disponible,En proceso` / `Adoptada` / inválido | `GET /api/mascotas` y `/api/tipos-mascota` | 8 sin adoptadas; adoptadas aparte; 400 | Igual al esperado | Aprobado |
| PR-29 | Seguridad | N | — | rutas fuera de la carpeta de fotos (`../`) | `eliminarArchivo` | No borra fuera de `uploads/mascotas` | No borra | Aprobado |
| PR-30 | Seguridad | L | — | 3 correos válidos, 9 inválidos y una cadena de 50 000 puntos | `esEmail` | Mismo resultado que antes; menos de 100 ms con la entrada maliciosa | Igual | Aprobado |
| PR-31 | Instalación | N, P | — | sin `SEED_ADMIN_PASSWORD`, con valor `EJEMPLO_...` y con un valor válido | `instalarBaseDatos()` y `GET /api/salud` | Error claro en los dos primeros; 200 en el tercero | Igual al esperado | Aprobado |
| PR-32 | Interfaz sin emojis | P, Pe | Migración 001 aplicada | — | `GET /api/tipos-mascota`, `GET /api/mascotas/10`, `information_schema` | Sin `icono`; columna eliminada; migración registrada | Igual al esperado | Aprobado |
| PR-33 | Migraciones | P | Base al día | — | `migrar()` | "ya estaba al día"; 4 migraciones registradas | Igual al esperado | Aprobado |
| PR-34 | RF-11 | N, RN | Adoptante nuevo sin perfil | solicitud válida | `POST /api/solicitudes`; luego completar el perfil y repetir | 400 "Completa tu perfil…"; después 201 | 400 y luego 201 | Aprobado |
| PR-35 | RF-11 | L, N | Adoptante nuevo | personas 0/1/20/21/2,5/vacío; vivienda vacía o inválida; booleano como texto; detalle de 0, 200 y 201 caracteres; experiencia de 301; `{}` | 14 × `PUT /api/perfil-adoptante` | 400, 200, 200, 400, 400, 400, 400, 400, 400, 400, 400, 200, 400, 400 | Idénticos | Aprobado |
| PR-36 | RF-11 | P, R, Pe | Adoptante nuevo | crear y luego editar | `PUT` × 2, `GET`; `GET` como admin | Se actualiza sin duplicar (1 fila); admin 403 | Igual al esperado | Aprobado |
| PR-37 | RF-12 | N, L | Solicitud 5 en "Solicitada" | ayer 10:00; `2026-02-30` | `PATCH .../5/entrevista` | 400 "fecha y hora futuras"; 400 fecha inválida | 400 y 400 | Aprobado |
| PR-38 | RF-12 | L, N | Solicitud 5 | domingo; 08:30; 16:00; 10:15; 09:00; 15:30 | `PATCH .../entrevista` | 400 × 4; 200 en 09:00 y en 15:30 (último turno) | Igual al esperado | Aprobado |
| PR-39 | RF-12 | RN | Entrevista de Mechudo agendada | mismo horario; dos agendas simultáneas a las 14:00 | `PATCH`; `GET .../disponibilidad` | 409; 14 turnos y el ocupado marcado; [200, 409] | Igual al esperado | Aprobado |
| PR-40 | RF-08 | RN | Solicitud 5 "Solicitada", 1 "Entrevista programada" | `{estado:"Aprobada"}`; marcar entrevistada sin cita | `PATCH .../estado`, `.../entrevistada` | 409 × 3; mascota sigue En proceso | Igual al esperado | Aprobado |
| PR-41 | RF-05, RF-07, RF-08, RF-12 | P, I, Pe | Solicitud 5 | agendar, reprogramar, entrevistada, aprobar | 4 `PATCH`; notificaciones de Ana | Cada etapa con sus fechas; 1 entrevista; 3 notificaciones con fecha en texto | Igual al esperado | Aprobado |
| PR-42 | RF-08 | RN, Pe | Mechudo con cita; Vaquita Solicitada | rechazar con motivo | `PATCH .../estado` | Mascota Disponible; cita cancelada; horario libre; repetir → 409 | Igual al esperado | Aprobado |
| PR-43 | RF-08, RF-12 | P, R | Seed | — | `GET` detalle admin, agenda, filtro por etapas, filtro inválido; agenda como adoptante | Perfil + entrevista; Mechudo en la agenda; [1, 5]; 400; 403 | Igual al esperado | Aprobado |
| PR-44 | RF-12 | P, N, R | Configuración por defecto | horario inválido; dirección nueva y cierre 12:00 | `GET`/`PUT` config; agendar 13:00 y 11:30 | 400; 13:00 rechazado; lugar copiado; adoptante 403 | Igual al esperado | Aprobado |
| PR-45 | RF-13 | P, Pe | Solicitud 5 entrevistada | aprobar | `PATCH .../estado`; `GET .../seguimientos` | 4 controles Pendientes a +90, +180, +270 y +360 días | "90,180,270,360" | Aprobado |
| PR-46 | RF-08, RF-13 | RN, Pe | Fallo simulado en `crearPlan` | aprobar | `PATCH .../estado` | 500 y rollback: sigue Entrevistada / En proceso / 0 controles / mismas notificaciones | Igual al esperado | Aprobado |
| PR-47 | RF-13 | R, RN | Control 6 de Lara vencido; control 7 futuro | JPG real | `POST /api/seguimientos/:id/foto` como Ana, como Edwin (futuro), como admin, como Edwin (vencido) ×2 | 403, 409, 403, 200, 409; un solo archivo nuevo | Igual al esperado | Aprobado |
| PR-48 | RF-13 | N, L | Control 6 | `.txt`; texto como `.jpg`; JPG de más de 2 MB; sin archivo | `POST .../foto` | 400 × 4; "no puede superar 2 MB"; sin archivos; sigue Pendiente | Igual al esperado | Aprobado |
| PR-49 | RF-14, RF-07 | P, N, R | Control 6 enviado | comentario vacío; estado inválido; "Requiere atención" + comentario; repetir sobre el control 5; como adoptante | `GET`/`PATCH /api/admin/seguimientos` | 400, 400, 200, 409, 403; notificación con el comentario | Igual al esperado | Aprobado |
| PR-50 | RF-15 | RN, Pe | Control 6 vencido | — | Listar, contar e iniciar sesión en paralelo; `npm run recordatorios` | 1 solo recordatorio; el script crea 0; Ana no ve seguimientos ajenos (403) | 1 recordatorio; 0; 403 | Aprobado |

## 14.4 Casos E2E (Playwright + Microsoft Edge)

Fecha: 2026-11-07 · Ejecutor: Playwright (`npm run test:e2e`) · Tipo **I** (interfaz–API–BD) en todos. Cada caso verifica en la interfaz y, cuando corresponde, consulta la BD.

| Código | Requisito | Tipo | Precondiciones | Entradas | Pasos | Esperado | Obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| E2E-01 | RF-01, RF-02, RF-11 | P, I | Correo nuevo | nombre, correo, contraseña; perfil "Casa, 3 personas" | Registro → inicio de sesión → Mi perfil → Guardar | Mensaje "Tu perfil se guardó" | Igual | Aprobado | [captura](evidencias/final/e2e/E2E-01_perfil_guardado.png) |
| E2E-02 | RF-03, RF-04, RF-06 | P, I, Pe | E2E-01 | filtro Perro + "Hambriento"; teléfono 8123-4567 | Catálogo → detalle → Solicitar → Mis solicitudes | 1 resultado; en la BD queda Solicitada y la mascota En proceso | Igual | Aprobado | [catálogo](evidencias/final/e2e/E2E-02_catalogo_filtrado.png), [detalle](evidencias/final/e2e/E2E-02_detalle.png), [enviada](evidencias/final/e2e/E2E-02_solicitud_enviada.png) |
| E2E-03 | RF-09, PB-10 | P, I, Pe | Admin | "Canela" + `dormilona.jpg`; luego edad "14 meses" | Agregar mascota → Guardar → Editar → Guardar | `foto_url` guardada; edad actualizada en la BD | Igual | Aprobado | [captura](evidencias/final/e2e/E2E-03_mascota_creada_y_editada.png) |
| E2E-04 | RF-12 | P, I | Solicitud de E2E-02 | día hábil +4, 11:00 | Detalle → calendario → horario → Agendar | Etapa "Entrevista programada" | Igual | Aprobado | [calendario](evidencias/final/e2e/E2E-04_calendario_horarios.png), [agendada](evidencias/final/e2e/E2E-04_entrevista_agendada.png) |
| E2E-05 | RF-05, RF-12 | P, I | E2E-04 | — | El adoptante abre su seguimiento | Tarjeta con 11:00 a. m. y la dirección del refugio; etapa actual resaltada | Igual | Aprobado | [captura](evidencias/final/e2e/E2E-05_seguimiento_con_entrevista.png) |
| E2E-06 | RF-08, RF-13 | P, I, Pe | E2E-04 | notas de la entrevista | Marcar entrevistada → Aprobar | En la BD: mascota Adoptada y 4 controles | Igual | Aprobado | [captura](evidencias/final/e2e/E2E-06_solicitud_aprobada.png) |
| E2E-07 | RF-13 | P, I | Control 6 de Lara vencido | `lara.jpg` | Seguimiento → elegir foto → vista previa → Subir | El control pasa a "En revisión" | Igual | Aprobado | [vista previa](evidencias/final/e2e/E2E-07_control_vista_previa.png), [enviado](evidencias/final/e2e/E2E-07_control_enviado.png) |
| E2E-08 | RF-14 | P, I, Pe | E2E-07 | "Lara se ve sana y activa." | Panel → Seguimientos → Todo bien | En la BD: "Todo bien" con el comentario | Igual | Aprobado | [captura](evidencias/final/e2e/E2E-08_revision_control.png) |
| E2E-09 | RF-02 | N | — | contraseña incorrecta | Iniciar sesión | Mensaje genérico y sigue en Login | Igual | Aprobado | [captura](evidencias/final/e2e/E2E-09_login_invalido.png) |
| E2E-10 | RF-01 | N, L | — | nombre "A", correo sin `@`, contraseña de 5 caracteres distinta de la confirmación | Registrar; además, `POST` directo a la API | El formulario no se envía; la API responde 400; ningún usuario creado | Igual | Aprobado | [captura](evidencias/final/e2e/E2E-10_registro_invalido.png) |
| E2E-11 | RF-11 | N, RN | Adoptante nuevo sin perfil | — | Abrir Solicitar | Redirige a Mi perfil con el aviso | Igual | Aprobado | [captura](evidencias/final/e2e/E2E-11_solicitar_sin_perfil.png) |
| E2E-12 | RF-04, RF-06 | N, RN | Mechudo En proceso | — | Detalle y Solicitar de Mechudo | Botón deshabilitado; formulario bloqueado con el aviso | Igual | Aprobado | [captura](evidencias/final/e2e/E2E-12_mascota_no_disponible.png) |
| E2E-13 | RNF-04 | R | Edwin con sesión | — | Abrir `admin.html` y `admin-solicitud.html`; llamar a la API | Redirección; API 403 | Igual | Aprobado | [captura](evidencias/final/e2e/E2E-13_adoptante_redirigido.png) |
| E2E-14 | RF-09, RF-13 | N, L | Admin; Edwin | `.txt` como foto de mascota; JPG de 2 MB + 10 bytes como foto de control | Formulario de mascota; subida por la API desde el navegador | Alerta de formato; 400 "no puede superar 2 MB" | Igual | Aprobado | [captura](evidencias/final/e2e/E2E-14_foto_tipo_invalido.png) |
| E2E-15 | RNF-03 | P, L | Edwin | pantalla de 390 × 844 | Abrir el seguimiento en el celular | Línea de tiempo vertical y sin desplazamiento horizontal | Igual (tras corregir DEF-21) | Aprobado | [captura](evidencias/final/e2e/E2E-15_seguimiento_movil.png) |
| E2E-16 | Calidad | P | Todo el recorrido | — | Escuchar `pageerror` en todas las páginas | 0 errores de JavaScript | 0 | Aprobado | [`resultados.json`](evidencias/final/e2e/resultados.json) |

## 14.5 Verificaciones operativas

| Código | Requisito | Tipo | Precondiciones | Entradas | Pasos | Esperado | Obtenido | Estado | Fecha | Ejecutor | Evidencia |
|---|---|---|---|---|---|---|---|---|---|---|---|
| VO-01 | RNF-01 | L | Seed | 50 peticiones secuenciales a 7 rutas | `npm run medir:tiempos` | Máximo < 2000 ms | Máximo 86,7 ms; p95 ≤ 23,9 ms | Aprobado | 2026-11-07 | script `medir-tiempos.js` | [`rendimiento_rnf01.txt`](evidencias/final/rendimiento_rnf01.txt) |
| VO-02 | Continuidad | Pe | Seed + recordatorio | `mysqldump --no-tablespaces` | Respaldo → borrar 10 tablas → restaurar → verificar; restaurar un respaldo truncado | Mismos conteos y 0 huérfanas; el truncado se detecta por sha256 y por la falta de "Dump completed" | Conteos idénticos (3/2/10/5/4/8/12/4); `CHECK TABLE` OK | Aprobado | 2026-11-07 | mysqldump/mysql 8.0.46 | [`respaldo_recuperacion.txt`](evidencias/final/respaldo_recuperacion.txt) |
| VO-03 | Reproducibilidad | I | Clon limpio de `main` | `.env` desde `.env.example` | README paso a paso | Servidor arriba, `/api/salud` ok, login 200 | Igual; 3 hallazgos corregidos en el README y DEF-22 | Aprobado | 2026-11-07 | Bash + npm | [`instalacion_desde_cero.txt`](evidencias/final/instalacion_desde_cero.txt) |

## 14.6 Valores límite cubiertos

| Dato | Límites probados | Casos |
|---|---|---|
| Personas en el hogar | 0 (rechaza), 1 (acepta), 20 (acepta), 21 (rechaza), 2,5 y vacío (rechazan) | PR-35 |
| Detalle de otras mascotas | 0 caracteres con "Sí" (rechaza), 200 (acepta), 201 (rechaza) | PR-35 |
| Detalle de experiencia | 301 caracteres (rechaza) | PR-35 |
| Teléfono | `88881234` sin guion (rechaza); `8888-1234` (acepta) | PR-15, PR-14 |
| Contraseña | 3 caracteres (rechaza); 8 a 72 bytes según la regla del registro | PR-03 |
| Foto | más de 2 MB (rechaza), tipo `.txt`, texto disfrazado de `.jpg` | PR-12, PR-48, E2E-14 |
| Horario de entrevista | 08:30 y 16:00 (rechazan), 09:00 y 15:30 (aceptan), 10:15 desalineado, domingo, ayer, 30 de febrero | PR-37, PR-38 |
| Configuración del refugio | apertura posterior al cierre, días inexistentes, duración de 5 min | PR-44 |
| Campos vacíos | perfil `{}`, comentario vacío, registro vacío | PR-35, PR-49, E2E-10 |
| Intentos de inicio de sesión | 5 fallidos y el 6.º bloqueado | PR-06 |
| Comentario de revisión | 0 caracteres (rechaza) | PR-49 |

## 14.7 Regresión

Casos reejecutados después de corregir cada defecto (detalle en la [bitácora](15_bitacora_defectos.md)):

| Defecto | Corrección | Casos reejecutados | Resultado antes | Resultado después |
|---|---|---|---|---|
| DEF-21: la barra de navegación desborda en el celular | [`1cc3453`](https://github.com/melanie05code/patitas-conectadas/commit/1cc3453) | E2E-15 y E2E-01 a E2E-16 completos | E2E-15 Fallido (ancho de 411 px en una pantalla de 390) | 16/16; ancho de 390 px en 6 páginas |
| DEF-22: la instalación aceptaba las contraseñas `EJEMPLO_` | [`7931c1a`](https://github.com/melanie05code/patitas-conectadas/commit/7931c1a) | PR-31 y VO-03 paso 3 | Se instalaba con contraseñas conocidas | Error claro; PR-31 aprobado |
| DEF-19: el ETL descartaba las solicitudes "En revisión" | [`abdbdcb`](https://github.com/melanie05code/patitas-conectadas/commit/abdbdcb) | PR-25, PR-26 | PR-25 Fallido (3 insertadas, 4 descartadas) | 5 insertadas, 2 descartadas |
| DEF-20: autoasignación en la migración 003 (SonarCloud S1656) | [`88b3125`](https://github.com/melanie05code/patitas-conectadas/commit/88b3125) | Suite completa en el CI del PR #16 | Quality Gate ERROR (Reliability C) | Quality Gate OK; 44/44 |
| DEF-18: cobertura del código nuevo de 69 % (< 80 %) en el PR #13 | [`73e97ce`](https://github.com/melanie05code/patitas-conectadas/commit/73e97ce) | PR-33 + suite en el CI | Quality Gate ERROR | 86,2 % y Quality Gate OK |
| DEF-01 a DEF-17 (Hito 1, II Parcial y calidad) | ver bitácora | PR-01 a PR-31 (suite completa) | — | 50/50 hoy |

**Regresión completa de hoy:** después del último cambio de código (`7931c1a`) se volvieron a ejecutar `npm test` (50/50) y `npm run test:e2e` (16/16). La corrida final antes del release fue a las 18:15 (Jest) y a las 18:17 (E2E), hora de Managua; `resultados.json` guarda la hora en UTC (`2026-11-08T00:17Z`).
