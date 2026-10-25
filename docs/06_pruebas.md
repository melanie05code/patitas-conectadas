# 6. Pruebas

## 6.1 Estrategia

- **Herramientas:** Jest 30 + Supertest 7, que llaman a la API real de Express sin levantar el servidor.
- **Entorno seguro:** base de datos separada **`patitas_test`** (`DB_NAME_TEST` en `.env`) y carpeta de fotos separada (`uploads-pruebas/`). Las pruebas se niegan a ejecutarse si la base de datos configurada no es la de pruebas ([`tests/ayudantes.js`](../tests/ayudantes.js)).
- **Datos limpios:** antes de cada prueba se reinstala `patitas_test` con `01_schema.sql`, `02_seed.sql` y las fotos semilla, así cada prueba es independiente.
- **Ejecución:** `npm test` (en serie, `--runInBand`, porque todas comparten la misma base de datos).
- **Resultado:** **27 pruebas, 27 aprobadas** (13 positivas y 14 negativas). Salida completa en [`docs/evidencias/npm-test.txt`](evidencias/npm-test.txt).

## 6.2 Tabla de pruebas

| ID | Requisito | Acción realizada | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|
| PR-01 | RF-01, RNF-02 | Registrar a "Ana López" con correo en mayúsculas y contraseña `Segura2026` | 201, correo guardado en minúsculas, contraseña guardada como hash bcrypt, sin `password_hash` en la respuesta | 201; `ana@correo.com`; hash `$2b$10$…`; la respuesta no incluye el hash | Aprobada | Test `PR-01 registro exitoso guarda la contraseña con hash bcrypt` ([`tests/autenticacion.test.js`](../tests/autenticacion.test.js)) |
| PR-02 | RF-01 | Registrar otra cuenta con `EDWIN.OBANDO@correo.com` (ya existe) | 409 "Ya existe una cuenta con ese correo." y ningún usuario nuevo | 409 con ese mensaje; sigue habiendo 1 cuenta con ese correo | Aprobada | Test `PR-02 registro con correo duplicado responde 409` |
| PR-03 | RF-01 (validación en backend) | Enviar a la API nombre "A", correo "no-es-correo" y contraseña "123", sin pasar por el formulario | 400 con los tres motivos | 400 con los mensajes de nombre, correo y contraseña | Aprobada | Test `PR-03 registro con datos inválidos responde 400…` |
| PR-04 | RF-02 | Iniciar sesión como `admin@patitas.com` / `Admin2026` | 200 con JWT que contiene el rol `admin`, el id y el vencimiento | 200; token con `rol: admin`, `sub: 1` y `exp` | Aprobada | Test `PR-04 login válido devuelve un JWT con el rol del usuario` |
| PR-05 | RF-02 | Iniciar sesión con contraseña incorrecta y con un correo inexistente | 401 con el mismo mensaje genérico en ambos casos | 401 "Correo o contraseña incorrectos." en ambos | Aprobada | Test `PR-05 login con contraseña incorrecta responde 401…` |
| PR-06 | RF-02 (seguridad) | Hacer 6 intentos fallidos de inicio de sesión seguidos | Los 5 primeros 401 y el sexto 429 | `[401, 401, 401, 401, 401, 429]` | Aprobada | Test `PR-06 tras 5 intentos fallidos el login se bloquea con 429` ([`tests/limite-login.test.js`](../tests/limite-login.test.js)) |
| PR-07 | RF-03, PB-16 | Consultar el catálogo filtrando por tipo Gato, buscando "chu" y pidiendo los filtros disponibles | Gatos: Calenturiento y Encantador; búsqueda: Mechudo; filtros: Perro, Gato, Ave | Coincide | Aprobada | Test `PR-07 el catálogo público se filtra por tipo y búsqueda` ([`tests/catalogo.test.js`](../tests/catalogo.test.js)) |
| PR-08 | RF-04 | Abrir sin sesión el detalle de Lara y el de una mascota inexistente | Lara: 200 con tipo Ave y su foto; inexistente: 404 | 200 con `fotoUrl` `/uploads/mascotas/lara.jpg`; 404 "Mascota no encontrada." | Aprobada | Test `PR-08 el detalle es público y una mascota inexistente responde 404` |
| PR-09 | RF-09, PB-16 | Como admin, crear el tipo "perro" (ya existe "Perro") | 409 "Ya existe un tipo de mascota con ese nombre." | 409 con ese mensaje | Aprobada | Test `PR-09 crear un tipo de mascota duplicado responde 409` |
| PR-10 | RNF-04 | Como adoptante, crear un tipo y una mascota; y crear una mascota sin sesión | 403, 403 y 401 | 403, 403 y 401 | Aprobada | Test `PR-10 un adoptante no puede gestionar tipos ni mascotas (403)…` |
| PR-11 | RF-09, PB-10 | Como admin, crear "Copito" con una foto JPG | 201, foto guardada con nombre aleatorio y servida como `image/jpeg` | 201; `/uploads/mascotas/<uuid>.jpg`; GET 200 `image/jpeg` | Aprobada | Test `PR-11 el administrador crea una mascota con foto válida` |
| PR-12 | PB-10 (validación en backend) | Subir un `.txt`, un texto disfrazado de PNG y una foto válida con datos inválidos | 400 en los tres casos y ningún archivo nuevo en el disco | 400 en los tres; la carpeta queda con la misma cantidad de archivos | Aprobada | Test `PR-12 una foto con formato no permitido o disfrazada responde 400…` |
| PR-13 | RF-09, PB-16 | Desactivar el tipo Conejo y luego crear una mascota de ese tipo | El tipo deja de aparecer entre los activos; crear la mascota responde 400 | No aparece; 400 "…está desactivado…" | Aprobada | Test `PR-13 un tipo desactivado deja de ofrecerse y no se puede asignar` |
| PR-14 | RF-06, RF-10, RF-07 | Edwin solicita adoptar a Cjotas con datos válidos | 201 *En revisión*, Cjotas pasa a *En proceso*, aparece en "Mis solicitudes" y se crea la notificación | Coincide; notificación "Tu solicitud para Cjotas está en revisión." | Aprobada | Test `PR-14 crear una solicitud válida la deja En revisión…` ([`tests/solicitudes.test.js`](../tests/solicitudes.test.js)) |
| PR-15 | RF-06 (validación en backend) | Solicitar con teléfono `88881234` | 400 "El teléfono debe tener el formato 8888-1234." y la mascota sigue *Disponible* | 400 con ese mensaje; Cjotas sigue *Disponible* | Aprobada | Test `PR-15 una solicitud con teléfono inválido responde 400…` |
| PR-16 | RF-06 | Solicitar a Encantador (adoptada) y a Mechudo (en proceso) | 409 "Esta mascota ya no está disponible para adopción." | 409 en ambos | Aprobada | Test `PR-16 solicitar una mascota que no está disponible responde 409` |
| PR-17 | RF-08, RNF-04 | Como adoptante, listar las solicitudes de administración e intentar aprobar una | 403 en ambas y la solicitud sin cambios | 403; la solicitud 1 sigue *En revisión* | Aprobada | Test `PR-17 un adoptante que intenta entrar a una ruta de administración recibe 403` |
| PR-18 | RF-08, RF-07 | Como admin, aprobar la solicitud de Mechudo y luego intentar responderla otra vez | 200: solicitud *Aprobada*, Mechudo *Adoptada*, notificación creada; segunda respuesta 409 | Coincide; notificación "¡Tu solicitud para Mechudo fue aprobada!" | Aprobada | Test `PR-18 aprobar una solicitud cambia la mascota a Adoptada y crea la notificación` |
| PR-19 | RF-08 (transacción) | Aprobar la solicitud de Mechudo forzando un fallo al insertar la notificación | 500 y **rollback**: solicitudes, notificaciones y estado de la mascota idénticos a antes | 500; la base de datos queda igual y la solicitud sigue *En revisión* | Aprobada | Test `PR-19 si falla la notificación, la transacción hace rollback…` |
| PR-20 | RF-06 (concurrencia) | Ana y Beto solicitan a El Hambriento al mismo tiempo | Una respuesta 201 y otra 409; una sola solicitud guardada | `[201, 409]`; 1 solicitud | Aprobada | Test `PR-20 dos solicitudes simultáneas por la misma mascota: solo una se guarda` |
| PR-21 | RF-05, RNF-01 | Edwin consulta el seguimiento de su solicitud; Ana intenta ver la misma solicitud | Edwin: 200 en menos de 2 s; Ana: 403 | 200 en menos de 2 s (≈12 ms en la medición manual); 403 | Aprobada | Test `PR-21 el seguimiento responde en menos de 2 segundos y solo lo ve su dueño` |
| PR-22 | RF-07 | Ana intenta marcar una notificación de Edwin; luego Edwin la marca como leída | Ana: 403 y el contador sigue en 3; Edwin: 200 y el contador baja a 2 | 403 / 3; 200 / 2 | Aprobada | Test `PR-22 marcar una notificación como leída baja el contador…` ([`tests/notificaciones.test.js`](../tests/notificaciones.test.js)) |
| PR-23 | RF-07, RNF-04 | Consultar las notificaciones sin sesión | 401 "Debes iniciar sesión para continuar." | 401 con ese mensaje | Aprobada | Test `PR-23 las notificaciones exigen sesión (401)` |
| PR-24 | Migración (transformación) | Normalizar `  Maria.Lopez@Correo.com `, `8765 4321`, `+505 8765-4321`, `88-12` y convertir "Hace 2 horas", "Ayer", "Hace 2 días" y `2026-08-20` con referencia 28/08/2026 16:00 | Correo en minúsculas, teléfonos `8765-4321`, `88-12` inválido, fechas `2026-08-28 14:00:00`, `2026-08-27 16:00:00`, `2026-08-26 16:00:00`, `2026-08-20 00:00:00` | Coincide; un correo y un texto de fecha ilegibles devuelven `null` | Aprobada | Test `PR-24 las transformaciones normalizan correos, teléfonos y fechas relativas` ([`tests/migracion.test.js`](../tests/migracion.test.js)) |
| PR-25 | Migración (ETL completo) | Ejecutar la migración del respaldo de ejemplo contra `patitas_test` | Respaldo (JSON + `mysqldump`), conteos usuarios 5 = 2 + 2 + 1, mascotas 8 = 8, solicitudes 7 = 5 + 2, notificaciones 6 = 5 + 1, validaciones en OK, decisión ACEPTADA y contraseña de Juan verificable con bcrypt | Coincide | Aprobada | Test `PR-25 la migración de prueba hace respaldo, carga, valida y se acepta` · [`docs/evidencias/migracion.txt`](evidencias/migracion.txt) |
| PR-26 | Migración (rollback) | Ejecutar la migración con `--max-descartes 0` | La validación del umbral falla, decisión RECHAZADA y los conteos del destino quedan idénticos | Coincide | Aprobada | Test `PR-26 si una validación falla, la migración hace rollback…` · [`docs/evidencias/migracion_rollback.txt`](evidencias/migracion_rollback.txt) |
| PR-27 | Migración (entorno seguro) | Ejecutar la migración contra `patitas_conectadas` sin `--confirmar-produccion` y contra la base `mysql` | La migración se niega en ambos casos | Error "…agrega --confirmar-produccion…" y "Base de datos no permitida" | Aprobada | Test `PR-27 la migración se niega a correr contra producción sin confirmación expresa` |

**Pruebas positivas (13):** PR-01, PR-04, PR-07, PR-08, PR-11, PR-13, PR-14, PR-18, PR-20, PR-21, PR-22, PR-24 y PR-25.
**Pruebas negativas (14):** PR-02, PR-03, PR-05, PR-06, PR-09, PR-10, PR-12, PR-15, PR-16, PR-17, PR-19, PR-23, PR-26 y PR-27.

## 6.3 ¿La prueba de rollback de verdad detecta errores?

Para comprobar que PR-19 no pasa "por casualidad", se modificó temporalmente `src/config/db.js` para que, ante un error, hiciera `commit` en lugar de `rollback`. Con ese cambio **PR-19 falló** (la solicitud quedó *Aprobada* y la mascota *Adoptada* sin notificación). Se restauró el archivo y la prueba volvió a pasar.

## 6.4 Cómo ejecutar las pruebas

```powershell
cd C:\proyectos\patitas-parcial2\patitas-conectadas
npm install
npm test
```

Requisitos: MySQL en ejecución, el usuario `patitas_app` con permisos sobre `patitas_test`, y `.env` con `DB_NAME_TEST=patitas_test`.
