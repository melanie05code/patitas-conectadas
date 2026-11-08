# 18. Respaldo y recuperación

> Procedimiento para la base de datos de Patitas Conectadas (MySQL 8.0). Se **ejecutó de verdad** el 2026-11-07 sobre la base de pruebas `patitas_test`, con el usuario de mínimo privilegio `patitas_app`. Salida completa: [`evidencias/final/respaldo_recuperacion.txt`](evidencias/final/respaldo_recuperacion.txt).

## 18.1 Qué se respalda

| Elemento | Dónde está | Cómo se respalda |
|---|---|---|
| Base de datos (10 tablas: datos, migraciones aplicadas y configuración del refugio) | MySQL, base `patitas_conectadas` | `mysqldump` (este documento) |
| Fotos de mascotas y de controles post-adopción | carpeta `uploads/mascotas/` | Copia de la carpeta junto al volcado (ver 18.6) |
| Configuración | `.env` | Copia en un lugar seguro, **nunca** en el repositorio |

## 18.2 Respaldo

En PowerShell, desde la carpeta del proyecto (`mysqldump.exe` no está en el `PATH`):

```powershell
$bin = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
$fecha = Get-Date -Format "yyyy-MM-dd_HHmm"
New-Item -ItemType Directory -Force respaldos | Out-Null
& "$bin\mysqldump.exe" --no-tablespaces --single-transaction --routines --triggers `
  --default-character-set=utf8mb4 -u patitas_app -p patitas_conectadas `
  --result-file="respaldos\patitas_$fecha.sql"
Get-FileHash "respaldos\patitas_$fecha.sql" -Algorithm SHA256 | Format-List
Select-String -Path "respaldos\patitas_$fecha.sql" -Pattern "Dump completed"
```

| Opción | Por qué |
|---|---|
| `--no-tablespaces` | El volcado de tablespaces requiere el privilegio `PROCESS`; con esta opción el respaldo funciona aunque el usuario no lo tenga (regla del proyecto: siempre usarla) |
| `--single-transaction` | Volcado consistente de InnoDB sin bloquear la aplicación |
| `--default-character-set=utf8mb4` | Conserva tildes y "ñ" |
| `-p` sin valor | Pide la contraseña sin dejarla en el historial de la terminal |

Guarda junto al archivo su **SHA-256** y comprueba que termine con la línea `-- Dump completed on ...`. La carpeta `respaldos/` está fuera de Git.

## 18.3 Restauración

```powershell
$bin = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
Get-FileHash "respaldos\patitas_2026-11-07_1749.sql" -Algorithm SHA256
Select-String -Path "respaldos\patitas_2026-11-07_1749.sql" -Pattern "Dump completed"
Get-Content "respaldos\patitas_2026-11-07_1749.sql" -Raw -Encoding UTF8 |
  & "$bin\mysql.exe" --default-character-set=utf8mb4 -u patitas_app -p patitas_conectadas
```

1. **Antes** de restaurar, compara el SHA-256 con el guardado y confirma que existe la línea `Dump completed`. Si no coinciden, **no restaures ese archivo**.
2. Detén la aplicación (`Ctrl+C` en `npm start`) para que nadie escriba durante la restauración.
3. Restaura. El volcado incluye `DROP TABLE IF EXISTS` y `CREATE TABLE` de cada tabla.
4. Copia de vuelta `uploads/mascotas/` del mismo respaldo.
5. Verifica (18.4) y vuelve a iniciar la aplicación.

## 18.4 Verificación

```sql
SELECT (SELECT COUNT(*) FROM usuarios) usuarios, (SELECT COUNT(*) FROM perfiles_adoptante) perfiles,
       (SELECT COUNT(*) FROM mascotas) mascotas, (SELECT COUNT(*) FROM solicitudes) solicitudes,
       (SELECT COUNT(*) FROM entrevistas) entrevistas, (SELECT COUNT(*) FROM seguimientos) seguimientos,
       (SELECT COUNT(*) FROM notificaciones) notificaciones, (SELECT COUNT(*) FROM migraciones_esquema) migraciones;
SELECT COUNT(*) AS fk_huerfanas FROM solicitudes s
  LEFT JOIN usuarios u ON u.id = s.usuario_id LEFT JOIN mascotas m ON m.id = s.mascota_id
  WHERE u.id IS NULL OR m.id IS NULL;
CHECK TABLE solicitudes, entrevistas, seguimientos;
```

Además: `GET /api/salud` debe responder `{"estado":"ok"}`, y una persona debe poder iniciar sesión.

## 18.5 Ejecución real (2026-11-07, `patitas_test`)

| Paso | Resultado |
|---|---|
| 1. Estado inicial (seed + recordatorio) | usuarios 3 · perfiles 2 · mascotas 10 · solicitudes 5 · entrevistas 4 · seguimientos 8 · notificaciones 12 · migraciones 4 |
| 2. `mysqldump` | Código de salida 0 · 25 436 bytes · 10 `CREATE TABLE` · SHA-256 `8e729e4a…dd4b9ca` · `-- Dump completed on 2026-11-07 17:49:12` |
| 3. Pérdida simulada | `DROP TABLE` de las 10 tablas → 0 tablas |
| 4. Restauración | Código de salida 0 |
| 5. Verificación | **Mismos conteos** (3/2/10/5/4/8/12/4); Mechudo y Vaquita *En proceso*, Encantador y Lara *Adoptadas*; 0 huérfanas; `CHECK TABLE` OK en las tres tablas |
| 6. Caso de falla: respaldo truncado a 12 000 bytes | SHA-256 distinto y sin la línea `Dump completed`. **Al restaurarlo, `mysql` terminó con código 0**, sin error (el corte cayó entre sentencias) |
| 7. Recuperación del caso de falla | Se descartó el archivo dañado y se restauró el íntegro: código 0, solicitudes = 5 |

**Lección del paso 6:** un código de salida 0 **no** garantiza una restauración completa. La única defensa es verificar el SHA-256 y la línea `Dump completed` **antes** de restaurar, y los conteos **después**. Está registrado como riesgo residual RES-04 en la [bitácora](15_bitacora_defectos.md).

## 18.6 Qué hacer si falla

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `mysqldump: Got error: 1227 ... PROCESS privilege` | Falta `--no-tablespaces` | Repetir con `--no-tablespaces` |
| `Access denied for user 'patitas_app'` | Contraseña equivocada o usuario sin permisos sobre esa base | Revisar `.env` y los `GRANT` del doc 05 §5.7 |
| `mysqldump` no se reconoce | No está en el `PATH` | Usar la ruta completa `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe` |
| El SHA-256 no coincide o falta `Dump completed` | Archivo truncado o dañado | **No restaurar**; usar el respaldo anterior íntegro |
| Error de sintaxis o `ERROR 1064` a mitad de la restauración | Archivo dañado | La base puede quedar a medias: restaurar de nuevo un respaldo íntegro y verificar los conteos |
| Tildes con caracteres extraños | Codificación distinta de utf8mb4 | Restaurar con `--default-character-set=utf8mb4` (y `-Encoding UTF8` en PowerShell) |
| La aplicación no arranca tras restaurar un respaldo antiguo | El esquema es de una versión anterior | `npm run db:migrar` aplica las migraciones pendientes |
| Faltan fotos (cuadros vacíos en el catálogo) | No se restauró `uploads/mascotas/` | Copiar la carpeta del mismo respaldo |
| Ningún respaldo sirve | — | Último recurso para una demo: `npm run db:instalar` recrea la base con los datos semilla (**borra los datos reales**) |

## 18.7 Frecuencia recomendada

- Un respaldo **antes** de cada `npm run db:migrar`, de la migración ETL o de cualquier actualización (MySQL no hace `ROLLBACK` de DDL).
- Un respaldo diario de la base y de `uploads/mascotas/`, conservando al menos 7, idealmente fuera del equipo.
- Una prueba de restauración mensual sobre `patitas_test` siguiendo 18.3 y 18.4.

> Lo anterior es una **recomendación**: el proyecto no incluye respaldos automáticos programados.
