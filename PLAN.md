# Plan de acción — plataforma multisitio

> **Estado actualizado:** la plataforma ya usa PostgreSQL para persistencia productiva y de desarrollo. Las referencias históricas de este documento a SQLite, migración futura o leads en SQLite describen etapas anteriores. La operación actual está documentada en `README.md`, `docs/architecture.md`, `docs/postgres-migration-plan.md` y `deploy/README.md`.

## Handoff actual — 2 de octubre de 2026

El estado completo para continuar en otro chat está documentado en [`docs/next-chat.md`](docs/next-chat.md). Incluye producto, editor, autenticación, publicación, leads, administración, suscripciones manuales, VPS, pruebas y próximos pasos. La auditoría específica del editor está en [`docs/editor-audit.md`](docs/editor-audit.md).

## Objetivo

El usuario crea y personaliza una web desde la plataforma, la guarda, la publica y finalmente la conecta a su dominio. La plataforma aloja los sitios; no se trata de entregar una web estática al cliente.

## Handoff para el próximo chat

### Situación actual

La aplicación funciona como MVP multisitio con autenticación, dashboard, creación desde plantilla, editor, preview, guardado, publicación, PostgreSQL, medios WebP, 22 tipos de bloque y tres familias con nueve plantillas:

- Editorial: Forma, Brasa, Nexo.
- Inmersivo: Alba, Marea, Línea.
- Modular: Vector, Nimbus, Escala.

El editor registra los nueve tipos originales más CTA, texto + imagen, video, logos, equipo, estadísticas, proceso, comparativa, formulario, newsletter, carta gastronómica y horarios/ubicación. Las nueve plantillas ya fueron rehechas con combinaciones diferentes de estos bloques; el siguiente trabajo es cerrar la operación de captación.

### Problema principal

No agregar más variaciones cosméticas a las nueve plantillas. La biblioteca ya llegó a 22 tipos y las plantillas ahora los combinan con recorridos diferentes por familia. El siguiente límite es estabilizar el editor en producción, verificar publicación en VPS y convertir los planes manuales en límites y suscripciones operativas.

### Primera ola implementada

La primera ola amplió el registro a 22 tipos de sección. Se agregaron estos 12:

1. CTA destacado
2. Texto + imagen
3. Video o embed
4. Logos de clientes
5. Equipo
6. Estadísticas independientes
7. Proceso paso a paso
8. Comparativa de planes
9. Formulario de contacto
10. Newsletter
11. Carta gastronómica
12. Horarios y ubicación

La segunda ola puede sumar galería masonry, galería horizontal, cita, banda CTA, timeline, eventos, blog, productos, mapa, reserva, características de producto y demo de producto.

Los bloques ya tienen contrato de datos, default, renderizador público/preview, inspector, validación server-side, responsive y accesibilidad base. Formularios y newsletter persisten leads en PostgreSQL con honeypot, bandeja por propietario, notificaciones internas y rate limiting persistente. La carga de imágenes está integrada en portada, nosotros, texto + imagen, proyectos, galería, logos y equipo. Todavía faltan notificaciones por email, exportación y biblioteca de medios.

### Orden de trabajo recomendado

1. Agregar pruebas E2E de edición, guardado, publicación y envío de formularios.
2. Rehacer las nueve plantillas combinando bloques diferentes y variantes reales.
3. Aplicar límites reales a los planes manuales.
4. Validar publicación y editor en el VPS.
5. Recién después integrar pagos, páginas y elementos anidados.

### Referencia competitiva

La dirección se contrastó con Wix Studio, Webflow, Framer, Squarespace y Shopify. El estándar competitivo incluye bibliotecas de bloques/componentes, layout responsive, rich text, galerías, video, formularios, mapas, newsletter, CMS/contenido dinámico, componentes reutilizables e integraciones. La oportunidad de Forma es ofrecer secciones art-directed y combinables, con más variedad que una plantilla cerrada y más consistencia que un canvas de píxeles libres.

### Qué no hacer

- No crear otra familia visual sin ampliar primero el vocabulario de bloques.
- No resolver variedad cambiando únicamente colores, fuentes, copy o nombres.
- No duplicar un componente por plantilla si una variante configurable resuelve el caso.
- No declarar completa la biblioteca mientras falten pruebas operativas, límites comerciales y composición avanzada.

### Verificación mínima

Después de cada ola: `npm run typecheck`, `npm run build`, `npm test`, `npm run test:e2e` y revisión visual de desktop/móvil.

### Estado del entorno local

- El código está en `C:\Users\Joni\Desktop\web-dinamica` y puede ejecutarse desde PowerShell con Node `22.23+`.
- No mezclar `node_modules` de Windows y WSL: `sharp` necesita un binario nativo por plataforma.
- Para Windows: ejecutar `npm ci` y `npm run dev` desde PowerShell.
- Para WSL: copiar el proyecto al filesystem Linux, por ejemplo `~/web-dinamica`, ejecutar `npm ci` allí y abrir `http://localhost:3000` desde el navegador de Windows.
- Node `22.23+` es requisito del proyecto; comprobar `node --version` y `node -p "process.execPath"` antes de iniciar. El entorno necesita PostgreSQL mediante Docker o una instancia accesible.
- Si aparecen errores de `next`, `sharp` o `MODULE_NOT_FOUND`, borrar `node_modules`, `.next` y `.next-dev` y reinstalar dentro de un único entorno.
- La instalación del proyecto en `/mnt/c` desde WSL puede producir paquetes incompletos; no usar esa combinación.

### Inicio recomendado para el próximo chat

1. Leer este handoff y `README.md` antes de editar.
2. Ejecutar `npm run typecheck`, `npm test` y `npm run build` desde el entorno elegido.
3. Rehacer las plantillas con bloques nuevos y revisar desktop/móvil.
4. Aplicar límites y estados de los planes manuales.
5. Validar publicación y editor en el VPS antes de integrar pagos.

## Base implementada

- Registro, inicio/cierre de sesión y panel de sitios por propietario.
- Creación de sitios desde una plantilla visual o una base simple.
- Editor visual por bloques, vista previa, imágenes y ajustes de identidad.
- Agregar, reordenar, duplicar y eliminar secciones; deshacer y rehacer.
- Guardado de borradores y publicación independiente en `/s/[slug]`.
- Persistencia PostgreSQL compartida para desarrollo y producción.

## Reorganización solicitada

- Carpetas por funcionalidades: auth, sites, editor, website, platform y cms.
- Rutas separadas de repositorios, acciones y componentes.
- Editor dividido en layout, barra, navegación, canvas, inspector, campos y hooks.
- Secciones de la web independientes y renderizador compartido con la vista previa.
- Estilos separados para plataforma, editor y sitio renderizado.
- Arquitectura documentada en `docs/architecture.md`.
- TypeScript y compilación de producción verificados.

## Siguiente etapa

1. Completar revisión visual manual de los 12 bloques nuevos en desktop y móvil.
2. Validar editor y publicación en producción.
3. Aplicar límites del plan Gratis y administrar upgrades.
4. Completar el modelo extensible: páginas, variantes y elementos combinables.
5. Ampliar controles por sección y dispositivo, biblioteca de medios, SEO y gestión de sitios.
6. Evaluar PostgreSQL para una futura escala del VPS; resolver dominios, DNS, HTTPS, backups y restauración probada.
7. Preparar PWA y publicación en tiendas móviles.

## Primera entrega del plan implementada

- Dependencias recuperadas; requisito de Node unificado en 22.23 o posterior.
- Catálogo y creación agrupados por familia: Editorial creativo contiene Forma, Brasa y Nexo.
- Dos familias nuevas implementadas: Inmersivo fotográfico (Alba, Marea, Línea) y Modular producto (Vector, Nimbus, Escala), nueve plantillas totales en tres familias.
- Registro compartido de 22 bloques, con defaults, inspectores, validación y renderizado responsive. La composición libre con elementos anidados sigue pendiente.
- Documentos versionados con lectura compatible de sitios anteriores y anclas de sección estables.
- Portadas divididas, centradas e inmersivas; imágenes propias en portada y nosotros, logo y destinos editables.
- Tipografía, ancho y espaciado global configurables.
- Medios nuevos fuera del JSON: archivos WebP locales y referencias con control de propietario.
- Pruebas unitarias de migración/validación y pruebas de navegador de registro, creación, edición, guardado, publicación, aislamiento y compatibilidad de snapshots anteriores.
- Autoguardado del borrador y recuperación local confirmados como parte del editor; publicar mantiene separado el snapshot público.
- Primera ola de 12 bloques funcionales agregada al registro compartido: CTA, texto + imagen, video, logos, equipo, estadísticas, proceso, comparativa, formulario, newsletter, carta gastronómica y horarios/ubicación. Los leads de formulario y newsletter se persisten por sitio en PostgreSQL con validación server-side y honeypot.

La entrega de familias, las composiciones diferenciadas, la primera ola de bloques, la bandeja de leads, las notificaciones internas, el rate limiting, el panel administrativo y la configuración de despliegue VPS están implementados. La ejecución real del VPS, backups y restauración todavía requieren verificación operativa. El diagnóstico comparativo y la dirección siguiente están consolidados en `docs/next-chat.md`. Siguen parciales la composición por elementos, páginas, controles responsive por propiedad, limpieza de medios, enforcement de límites, pagos automáticos y dominios personalizados.

El despliegue Docker está configurado para la plataforma multisitio. El CMS de la primera demo permanece aislado en `features/cms`; no es el constructor que usa el usuario de la plataforma. La ejecución contra un VPS y la restauración de backups todavía deben verificarse.

## Ampliación del producto y objetivo móvil

El plan detallado de evolución está en [`docs/plan-estilos-y-producto.md`](docs/plan-estilos-y-producto.md). La agrupación de familias y las dos familias visuales nuevas ya están implementadas; el foco actual es completar los flujos operativos y la composición avanzada.

Como última etapa se incorpora una PWA y la publicación de la plataforma en Google Play (cuenta ya pagada) y, si es viable y obtiene aprobación, App Store. Se prioriza reutilizar la base web y el backend. El plan detalla qué preparar desde las primeras fases: editor táctil, lógica independiente del transporte, recuperación de borradores, autenticación móvil y alcance del caché.
