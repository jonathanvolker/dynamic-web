# Forma — plataforma para crear y publicar webs

Aplicación **React / Next.js + Node** con registro, panel de sitios, editor por bloques y publicación independiente por sitio. La primera plantilla conserva la propuesta visual de Forma.

## Levantar local

Requiere **Node 22.23 o posterior** (persistencia local con `node:sqlite`).

```bash
npm install
npm run dev
```

Abrí **http://localhost:3000**, creá tu cuenta y elegí **Crear un sitio**. No necesitás PostgreSQL ni Docker para probar la plataforma. La base local se crea automáticamente en `data/platform.sqlite`.

### Entorno WSL actual

Las dependencias están enlazadas a `/tmp/opencode/forma/node_modules` por un problema de permisos en la unidad de Windows. Usá `npm run dev` desde WSL. Si se limpia `/tmp`, reinstalá en ese destino con `npm install --prefix /tmp/opencode/forma`, donde se conserva la copia de `package.json`. Para una instalación duradera, ubicá el proyecto en el filesystem de Linux o reinstalalo directamente desde Windows.

## Recorrido

1. Registrarse en `/register` o entrar en `/login`.
2. Crear un sitio desde `/dashboard/new`.
3. Editar en `/editor/[id]`: textos, listas, imágenes, colores, menú y SEO.
4. Agregar/reordenar secciones y revisar escritorio o móvil.
   En **Identidad y ajustes → Colores de tu web**, elegir una de cuatro paletas o personalizar acento, fondo, textos, superficies, separadores y los tres estilos de proyectos. Los campos admiten selector de color o código hexadecimal.
5. **Guardar** conserva el borrador. **Publicar** actualiza la web pública.
6. **Ver sitio** abre `/s/[slug]`. Cada cuenta accede solo a sus propios sitios.

La plantilla original se puede ver en `/template`. `/admin` pertenece al CMS de la demo inicial y requiere su propia configuración de PostgreSQL; el constructor de la plataforma es `/editor/[id]`.

## Plantillas públicas

La galería `/templates` y las vistas completas se pueden visitar sin iniciar sesión:

- `/templates/studio`: **Forma**, estudio creativo y portfolio.
- `/templates/restaurant`: **Brasa**, restaurante con estética cálida, menú y composición editorial.
- `/templates/consultant`: **Nexo**, servicios profesionales con diseño oscuro y tarjetas estructuradas.

Las tres están disponibles al crear un sitio. “Usar plantilla” conserva la selección al registrarse o iniciar sesión. Los contenidos son ficticios y los botones de contacto abren un email; no se incluyen reservas o calendarios automáticos.

## Organización

```text
src/app/                Rutas de Next.js
src/features/auth/      Autenticación
src/features/sites/     Panel, acciones y repositorio de sitios
src/features/editor/    Editor, campos, hooks y estilos
src/features/website/   Plantillas y renderizado de webs
src/features/templates/ Catálogo, contenido y vistas públicas de las plantillas
src/features/platform/  Estilos de la plataforma
src/features/cms/       Integración de Payload de la primera demo
src/server/db/          Persistencia local
```

Detalle de responsabilidades: [`docs/architecture.md`](docs/architecture.md).

## Comprobaciones

```bash
npm run typecheck
npm run build
```

Desarrollo usa `.next-dev` y producción usa `.next`, para que una compilación no sobrescriba los archivos del servidor local. Si quedan archivos generados inconsistentes, detené el servidor, eliminá `.next-dev` y volvé a ejecutar `npm run dev`.

## Estado del proyecto

- Editor React propio, compuesto por módulos pequeños.
- Historial deshacer/rehacer, duplicación y eliminación de secciones.
- Guardado explícito con separación entre borrador y publicación.
- Imágenes comprimidas en el navegador y persistidas en el documento del sitio.
- Dirección local por sitio; conexión de dominios reales y HTTPS pendiente para la VPS.
- Docker está pospuesto: los archivos existentes son la base de la demo inicial y requieren adaptación a la plataforma multisitio.
- Contenido inicial ficticio; formularios de contacto aún usan email.
