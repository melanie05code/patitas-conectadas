# 🐾 Patitas Conectadas

## Sistema de Gestión de Adopción de Mascotas

### Segundo Parcial — Primera versión implementada

**Proyecto Final Integrador**

**Integrante:** Melanie Abigail Obando Rivera *(proyecto individual)*

**Universidad:** UCN

**Fecha:** octubre de 2026

**Repositorio:** https://github.com/melanie05code/patitas-conectadas

---

## Contenido

| Nº | Sección | Archivo |
|---|---|---|
| 1 | Correcciones aplicadas a partir de la retroalimentación | [`01_correcciones.md`](01_correcciones.md) |
| 2 | Alcance y requisitos actualizados (backlog y criterios de aceptación) | [`02_alcance_requisitos.md`](02_alcance_requisitos.md) |
| 3 | Funcionalidades implementadas | [`03_funcionalidades.md`](03_funcionalidades.md) |
| 4 | Arquitectura actualizada y matriz de trazabilidad | [`04_arquitectura.md`](04_arquitectura.md) |
| 5 | Base de datos | [`05_base_datos.md`](05_base_datos.md) |
| 6 | Pruebas | [`06_pruebas.md`](06_pruebas.md) |
| 7 | Control de versiones (Git y GitHub) | [`07_git.md`](07_git.md) |
| 8 | Migración de datos | [`08_migracion.md`](08_migracion.md) |
| 9 | Plan de capacitación | [`09_capacitacion.md`](09_capacitacion.md) |
| 10 | Estrategia de implementación | [`10_estrategia_implementacion.md`](10_estrategia_implementacion.md) |
| 11 | Conclusiones | [`11_conclusiones.md`](11_conclusiones.md) |
| 12 | Enlaces y anexos | [`12_enlaces_anexos.md`](12_enlaces_anexos.md) |

## Resumen

Patitas Conectadas centraliza el proceso de adopción de un refugio de mascotas: catálogo público con fotos reales, solicitudes de adopción con seguimiento, notificaciones y un panel para que el refugio gestione mascotas, tipos de mascota y solicitudes.

En esta entrega el prototipo del Hito 1, que simulaba los datos en el navegador, pasa a ser una aplicación real:
- backend **Node.js + Express**;
- base de datos **MySQL 8.0** con integridad referencial y transacciones;
- autenticación con **bcrypt + JWT**;
- validación en el servidor;
- **28 pruebas automáticas**;
- migración de los datos del prototipo;
- un historial de Git con **10 ramas integradas por Pull Request**.
