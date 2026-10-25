# 11. Conclusiones

## 11.1 Resultados obtenidos

- **Los 10 requisitos funcionales y los 4 no funcionales están implementados** y verificados: cada uno tiene su endpoint, su pantalla, su tabla y al menos una prueba automática (matriz en [`04_arquitectura.md`](04_arquitectura.md) §4.5).
- **Se atendió toda la retroalimentación del docente:**
  - el backlog coincide con el código;
  - las contraseñas ya no están en texto plano;
  - hay criterios de aceptación para RF-01 a RF-10;
  - la validación crítica ocurre en el servidor;
  - la evolución del proyecto queda en un historial de Git con ramas y Pull Requests.

  Las 16 filas de [`01_correcciones.md`](01_correcciones.md) están en estado *Corregido* y cada una tiene su evidencia.
- **Los pendientes del Hito 1 quedaron resueltos:** hallazgo 3 (menú en login y registro), hallazgo 4 y PB-10 (fotografías reales), PB-05 a PB-07 (base de datos, backend y autenticación) y PB-09 (notificaciones internas).
- **La base de datos garantiza las reglas importantes por sí misma** (PK, FK, UNIQUE, CHECK). Las dos operaciones críticas, crear y responder una solicitud, son transacciones con bloqueo de fila y rollback, demostrado con pruebas de concurrencia y de fallo forzado.
- **La migración desde el prototipo** sigue el ciclo completo: respaldo, extracción, transformación, carga, validación, y aceptación o rollback. Se ejecutó primero en un entorno seguro, con resultado documentado.

## 11.2 Aprendizajes

1. **Validar en el servidor no es opcional.** La validación del navegador ayuda al usuario, pero cualquiera puede saltarla. Las pruebas PR-03, PR-12 y PR-15 envían datos inválidos directamente a la API y comprueban que el servidor los rechaza.
2. **Las transacciones solo protegen si cubren todo el proceso.** Aprobar una solicitud cambia tres tablas; si solo se actualizaran dos, el refugio vería una mascota adoptada sin notificación. Probar el rollback forzando un error fue la única forma de confirmarlo.
3. **Una prueba también hay que probarla.** Se rompió a propósito el rollback para confirmar que PR-19 fallaba; si no hubiera fallado, la prueba no habría demostrado nada.
4. **Revisar el sistema con ojos de usuario encuentra errores que las pruebas no ven.** Así se detectaron:
   - la ficha de detalle que exigía sesión;
   - la falta de la etiqueta `viewport`, que rompía el diseño en celulares;
   - el catálogo "Mascotas disponibles" que mostraba mascotas adoptadas;
   - el riesgo de XSS por `innerHTML`.
5. **La seguridad se construye por capas:**
   - hash bcrypt;
   - JWT con vencimiento;
   - roles;
   - límite de intentos;
   - consultas parametrizadas;
   - CSP estricta;
   - validación de archivos por su contenido;
   - un usuario de base de datos con el mínimo privilegio.

## 11.3 Decisiones que se corrigieron respecto al Hito 1

- **MongoDB → MySQL:** el modelo relacional expresa directamente las relaciones usuario–solicitud–mascota y permite demostrar integridad referencial y transacciones.
- **React → HTML/CSS/JS del prototipo:** se conservó una interfaz ya validada con usuarios y el tiempo se dedicó al backend, las pruebas y la migración.
- **Tipos de mascota fijos → tabla administrable:** el refugio puede publicar aves, conejos u otros animales sin cambiar código.

## 11.4 Limitaciones y trabajo futuro

| Pendiente | Backlog |
|---|---|
| Notificaciones por correo electrónico (hoy son internas) | PB-09 (ampliación) |
| Reportes de adopciones para el refugio | PB-11 |
| Entrevista presencial y aprobación final de la adopción | PB-12, PB-13 |
| Seguimiento post-adopción con fotos periódicas | PB-14 |
| Varios refugios en una sola plataforma | PB-15 |
| Despliegue en producción con HTTPS y respaldos automáticos | [`10_estrategia_implementacion.md`](10_estrategia_implementacion.md) |
| Recuperación de contraseña y edición del perfil del adoptante | Nuevo |
| Auditoría de accesibilidad (contraste, lector de pantalla, navegación con teclado) | Nuevo |

El sistema queda listo para un **piloto con un refugio**. Su arquitectura modular y las pruebas automáticas permiten agregar estas mejoras de forma incremental, con el mismo flujo de ramas, Pull Requests y pruebas usado en este parcial.
