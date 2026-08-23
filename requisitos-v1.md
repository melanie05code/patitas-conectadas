# Listado de Requisitos Funcionales — v1.0

| ID | Requisito funcional | Pantalla | Módulo | API | Datos |
|---|---|---|---|---|---|
| RF-01 | El sistema debe permitir el registro de nuevos adoptantes | Registro | Módulo de Usuarios | API de Autenticación | Datos de usuario |
| RF-02 | El sistema debe permitir el inicio de sesión de adoptantes registrados | Login | Módulo de Usuarios | API de Autenticación | Datos de usuario / token |
| RF-03 | El sistema debe mostrar el catálogo de mascotas disponibles | Catálogo de mascotas | Módulo de Mascotas | API de Mascotas | Datos de mascota |
| RF-04 | El sistema debe mostrar la ficha detallada de una mascota | Detalle de mascota | Módulo de Mascotas | API de Mascotas | Datos de mascota |
| RF-05 | El sistema debe permitir consultar el estado de una solicitud de adopción | Seguimiento | Módulo de Solicitudes | API de Seguimiento | Datos de la solicitud |
| RF-06 | El sistema debe permitir enviar una solicitud de adopción | Solicitar Adopción | Módulo de Solicitudes | API de Solicitudes | Datos de la solicitud |
| RF-07 | El sistema debe notificar al adoptante cuando cambie el estado de su solicitud | Notificaciones | Módulo de Notificaciones | API de Notificaciones | Datos de notificación |
| RF-08 | El sistema debe permitir al administrador revisar y responder solicitudes (aprobar/rechazar) | Panel de Administración | Módulo de Solicitudes (admin) | API de Solicitudes (admin) | Datos de la solicitud |
| RF-09 | El sistema debe permitir al administrador gestionar el catálogo de mascotas (agregar/editar/marcar como adoptada) | Panel de Administración | Módulo de Mascotas (admin) | API de Mascotas (admin) | Datos de mascota |
| RF-10 | El sistema debe permitir al adoptante consultar el historial de sus solicitudes | Mis Solicitudes | Módulo de Solicitudes | API de Solicitudes | Datos de la solicitud |

## Requisitos no funcionales (referencia)
| ID | Requisito no funcional |
|---|---|
| RNF-01 | El sistema debe responder las consultas de seguimiento en menos de 2 segundos |
| RNF-02 | Las contraseñas de usuario deben almacenarse cifradas (hash) |
| RNF-03 | La aplicación debe ser responsive (accesible desde móvil y escritorio) |
| RNF-04 | Solo un administrador autenticado puede modificar el catálogo de mascotas o el estado de una solicitud |

> Nota: este listado corresponde a la versión inicial y se irá refinando en próximas iteraciones
