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

1. Completar el modelo extensible: registro unificado de bloques, páginas y elementos combinables.
2. Ampliar controles por sección y dispositivo, biblioteca de medios y bloques nuevos.
3. Implementar las dos nuevas familias visuales sobre esa base.
4. Completar autoguardado, recuperación, gestión de sitios, formularios y SEO.
5. Incorporar PostgreSQL para VPS; resolver dominios, DNS, HTTPS, despliegue y backups.
6. Preparar PWA y publicación en tiendas móviles.

## Primera entrega del plan implementada

- Dependencias recuperadas; requisito de Node unificado en 22.23 o posterior.
- Catálogo y creación agrupados por familia: Editorial creativo contiene Forma, Brasa y Nexo.
- Dos familias nuevas implementadas: Inmersivo fotográfico (Alba, Marea, Línea) y Modular producto (Vector, Nimbus, Escala), nueve plantillas totales en tres familias.
- Registro compartido de nueve bloques, con galería, testimonios y planes editables.
- Documentos versionados con lectura compatible de sitios anteriores y anclas de sección estables.
- Portadas divididas, centradas e inmersivas; imágenes propias en portada y nosotros, logo y destinos editables.
- Tipografía, ancho y espaciado global configurables.
- Medios nuevos fuera del JSON: archivos WebP locales y referencias con control de propietario.
- Pruebas unitarias de migración/validación y pruebas de navegador de registro, creación, edición, guardado, publicación, aislamiento y compatibilidad de snapshots anteriores.
- Autoguardado del borrador y recuperación local confirmados como parte del editor; publicar mantiene separado el snapshot público.

Esto completa la entrega de familias y bloques del plan. Las fases 1 y 2 siguen parciales: composición por elementos, páginas, controles responsive por propiedad, limpieza de medios, formularios reales y despliegue siguen pendientes.

El despliegue Docker está pospuesto por indicación del usuario. El CMS de la primera demo permanece aislado en `features/cms`; no es el constructor que usa el usuario de la plataforma.

## Ampliación del producto y objetivo móvil

El plan detallado de evolución está en [`docs/plan-estilos-y-producto.md`](docs/plan-estilos-y-producto.md): agrupar las tres plantillas actuales en una familia, crear dos familias visuales nuevas y ampliar la personalización del editor.

Como última etapa se incorpora una PWA y la publicación de la plataforma en Google Play (cuenta ya pagada) y, si es viable y obtiene aprobación, App Store. Se prioriza reutilizar la base web y el backend. El plan detalla qué preparar desde las primeras fases: editor táctil, lógica independiente del transporte, recuperación de borradores, autenticación móvil y alcance del caché.
