# 10. Estrategia de implementación

## 10.1 Enfoque elegido: piloto + crecimiento incremental

| Enfoque | ¿Por qué sí o por qué no? |
|---|---|
| **Piloto (elegido)** | El sistema está pensado para un solo refugio, así que se pone en marcha primero con **un refugio de Managua** y un grupo reducido de adoptantes durante 4 a 6 semanas. Permite medir el uso real, corregir con bajo riesgo y validar la capacitación |
| **Incremental (elegido, a continuación del piloto)** | Las funcionalidades pendientes del backlog (correo, entrevista presencial, reportes, varios refugios) se agregan en entregas pequeñas, cada una con su rama, PR y pruebas, como en este parcial |
| Big bang | Se descarta: no hay un sistema anterior que reemplazar de golpe, y un lanzamiento masivo sin piloto expone al refugio a errores sin margen de corrección |
| Paralelo | Se adopta solo de forma parcial: durante el piloto el refugio mantiene su canal informal (WhatsApp/Facebook) como respaldo, sin duplicar datos, hasta confirmar que el sistema cubre el proceso |

**Etapas**

| Etapa | Duración estimada | Contenido | Criterio para avanzar |
|---|---|---|---|
| 0. Preparación | 1 semana | Despliegue en el entorno de producción, carga de mascotas reales, migración de datos del prototipo si existieran, capacitación del administrador (módulos A1 a A5) | Prueba de humo en producción y administrador aprobado en la evaluación |
| 1. Piloto | 4 a 6 semanas | Un refugio, catálogo real, adoptantes invitados con la guía rápida | Sin errores críticos abiertos; las solicitudes se responden en el panel |
| 2. Apertura | Continuo | Catálogo público difundido en las redes del refugio | Indicadores del piloto estables |
| 3. Incrementos | Por entrega | PB-09 (correo), PB-12/PB-13 (entrevista y aprobación final), PB-11 (reportes), PB-14 (seguimiento post-adopción), PB-15 (varios refugios) | Cada incremento con pruebas automáticas en verde y PR revisado |

**Indicadores del piloto:** solicitudes recibidas por semana, tiempo promedio de respuesta del refugio, porcentaje de solicitudes rechazadas por datos incompletos (que debería ser casi nulo gracias a la validación) y dudas registradas en la capacitación.

## 10.2 Entornos

| Entorno | Dónde | Base de datos | Archivos | Uso |
|---|---|---|---|---|
| **Desarrollo** | `localhost:3000` (`npm run dev` con nodemon) | MySQL 8.0 local, base `patitas_conectadas`, usuario `patitas_app` | `uploads/` | Programar y probar a mano con los datos semilla (`npm run db:instalar`) |
| **Pruebas** | La misma máquina (`npm test`, `npm run capturas`, migración de prueba) y, si se despliega, una **instancia separada** del servicio con su propia base | `patitas_test` (se reinstala antes de cada prueba) | `uploads-pruebas/` | Pruebas automáticas (28), evidencias y ensayo de la migración. Nunca toca los datos reales |
| **Producción** | Target-host (ver 10.3) con HTTPS | MySQL administrado o en el mismo servidor, usuario de mínimo privilegio con contraseña fuerte | Volumen persistente para `uploads/` | Uso real del refugio y los adoptantes |

Las diferencias entre entornos se manejan solo con **variables de entorno** (`.env` en local, panel del proveedor en producción): `DB_*`, `JWT_SECRET`, `JWT_EXPIRA`, `PORT`, `MYSQLDUMP_PATH`. El código es el mismo en los tres entornos.

## 10.3 Target-host propuesto

| Opción | Qué incluye | Ventajas | Desventajas | Costo aproximado *(a verificar)* |
|---|---|---|---|---|
| **Railway (recomendada para el piloto)** | Servicio Node.js desplegado desde GitHub + base MySQL administrada en el mismo proyecto + volumen persistente | Despliegue automático en cada merge a `main`, HTTPS incluido, poca administración | El costo depende del uso; el volumen y la base de datos tienen límites por plan | ≈ USD 5 a 10 al mes en un plan básico *(a verificar)* |
| VPS (por ejemplo DigitalOcean o Hetzner) | Ubuntu + Node.js con PM2 + Nginx como proxy con HTTPS (Let's Encrypt) + MySQL 8.0 en el mismo servidor | Control total y costo fijo; igual a lo usado en desarrollo | Requiere administrar actualizaciones, respaldos y seguridad del servidor | ≈ USD 4 a 6 al mes por el servidor *(a verificar)* |
| Render + MySQL externo | Servicio web Node.js en Render y MySQL en otro proveedor | Plan gratuito o económico para el servicio web | Render no ofrece MySQL administrado (ofrece PostgreSQL), así que habría que contratar MySQL aparte *(a verificar)* | Servicio web ≈ USD 0 a 7 al mes + MySQL externo *(a verificar)* |

Otros costos: dominio propio ≈ USD 10 a 15 al año *(a verificar)*; es opcional, porque los proveedores ofrecen un subdominio gratuito. Todos los montos son referencias y deben confirmarse en los sitios oficiales al momento de contratar.

**Recomendación:** Railway para el piloto, por simplicidad y despliegue automático desde GitHub. Si el uso crece o se necesita un costo fijo, migrar a un VPS. La migración es directa porque la aplicación solo depende de Node.js, MySQL y variables de entorno.

## 10.4 Lista de verificación para pasar a producción

1. Crear la base `patitas_conectadas` y un usuario equivalente a `patitas_app`, con permisos solo sobre esa base y una contraseña fuerte.
2. Configurar las variables de entorno, con un `JWT_SECRET` largo y aleatorio distinto al de desarrollo.
3. Ejecutar `database/01_schema.sql`. **No cargar los usuarios demo:** crear la cuenta real del administrador y cargar las mascotas del refugio.
4. Montar un volumen persistente para `uploads/`; en los proveedores en la nube, el disco del contenedor se borra en cada despliegue.
5. Si hay datos del prototipo: exportarlos, ensayar la migración en un entorno de pruebas y luego ejecutar `npm run migrar -- --bd patitas_conectadas --confirmar-produccion` ([`08_migracion.md`](08_migracion.md)).
6. Programar respaldos periódicos con `mysqldump --no-tablespaces` y probar una restauración.
7. Prueba de humo: registro, solicitud, aprobación y notificación con cuentas de prueba, que luego se eliminan.
8. **Plan de reversión:** si un despliegue falla, volver a la versión anterior desde el historial de despliegues (o `git revert` del merge) y restaurar el último respaldo si hubo cambios en la base de datos.
