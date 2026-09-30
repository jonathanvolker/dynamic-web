# Plan de acción — plataforma multisitio

## Objetivo

El usuario crea y personaliza una web desde la plataforma, la guarda, la publica y finalmente la conecta a su dominio. La plataforma aloja los sitios; no se trata de entregar una web estática al cliente.

## Base implementada

- Registro, inicio/cierre de sesión y panel de sitios por propietario.
- Creación de sitios desde una plantilla visual o una base simple.
- Editor visual por bloques, vista previa, imágenes y ajustes de identidad.
- Agregar, reordenar, duplicar y eliminar secciones; deshacer y rehacer.
- Guardado de borradores y publicación independiente en `/s/[slug]`.
- Persistencia SQLite para desarrollo local sin servicios externos.

## Reorganización solicitada

- Carpetas por funcionalidades: auth, sites, editor, website, platform y cms.
- Rutas separadas de repositorios, acciones y componentes.
- Editor dividido en layout, barra, navegación, canvas, inspector, campos y hooks.
- Secciones de la web independientes y renderizador compartido con la vista previa.
- Estilos separados para plataforma, editor y sitio renderizado.
- Arquitectura documentada en `docs/architecture.md`.
- TypeScript y compilación de producción verificados.

## Siguiente etapa

1. Verificar el recorrido completo en navegador: registro, creación, edición, guardado, publicación y aislamiento entre usuarios.
2. Ajustar la experiencia del editor tras revisar la propuesta local.
3. Incorporar PostgreSQL para el entorno VPS y almacenamiento de imágenes independiente del documento.
4. Resolver sitios por subdominio y dominio propio, verificación DNS y HTTPS.
5. Adaptar el despliegue y copias de seguridad a la plataforma multisitio.

El despliegue Docker está pospuesto por indicación del usuario. El CMS de la primera demo permanece aislado en `features/cms`; no es el constructor que usa el usuario de la plataforma.
