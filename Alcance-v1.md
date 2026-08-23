# Alcance del Proyecto — Versión 1.0

## Nombre del proyecto
Patitas Conectadas — Sistema de Gestión de Adopción de Mascotas

## 1. Objetivo general
Desarrollar una aplicación web que permita a personas interesadas en adoptar consultar mascotas disponibles en un refugio, enviar solicitudes de adopción y darles seguimiento, mientras el refugio gestiona y responde dichas solicitudes.

## 2. Objetivos específicos
- Permitir el registro e inicio de sesión de adoptantes.
- Mostrar un catálogo de mascotas disponibles para adopción.
- Permitir enviar una solicitud de adopción para una mascota específica.
- Dar seguimiento al estado de la solicitud en tiempo real.
- Notificar al adoptante cuando cambie el estado de su solicitud.
- Brindar un panel administrativo para que el refugio gestione mascotas y solicitudes.

## 3. Alcance funcional (incluido en esta versión)
- Módulo de Usuarios (registro, autenticación de adoptantes).
- Módulo de Mascotas (catálogo, ficha de cada mascota).
- Módulo de Solicitudes de Adopción (crear solicitud, historial).
- Módulo de Seguimiento (consulta del estado de la solicitud).
- Módulo de Notificaciones (alertas de cambio de estado).
- Panel administrativo para el refugio (gestión de mascotas y solicitudes).

## 4. Fuera de alcance (esta versión)
- Pagos o donaciones en línea.
- Aplicación móvil nativa (solo versión web responsive).
- Múltiples refugios o sucursales.
- Historial médico/veterinario detallado de cada mascota.
- Chat en tiempo real entre adoptante y refugio.

## 5. Usuarios del sistema
| Rol | Descripción |
|---|---|
| Adoptante | Persona que se registra, consulta mascotas y solicita adopción |
| Administrador (refugio) | Gestiona el catálogo de mascotas y las solicitudes recibidas |

## 6. Entregables de esta etapa
- Alcance del proyecto v1.0 (este documento)
- Listado actualizado de requisitos funcionales
- Diagrama de arquitectura inicial
- Diagrama de componentes/módulos
- Matriz de trazabilidad requisito–pantalla–módulo–datos
- Justificación de decisiones arquitectónicas
- Prototipo actualizado (descripción de pantallas)

## 7. Supuestos y restricciones
- Se elige una arquitectura cliente-servidor con API REST por su simplicidad y porque permite separar claramente presentación, lógica de negocio y datos.
- El tiempo de desarrollo es limitado, por lo que se prioriza un monolito modular sobre microservicios.
- Se asume un solo refugio administrando el sistema en esta versión.
