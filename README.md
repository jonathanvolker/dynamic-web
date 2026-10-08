# Forma — plataforma para crear y publicar webs

Aplicación **React / Next.js + Node** con registro, panel de sitios, editor por bloques y publicación independiente por sitio. La primera plantilla conserva la propuesta visual de Forma.

## Levantar local

Requiere **Node 22.23 o posterior**, npm y PostgreSQL. La plataforma y Payload comparten la misma base PostgreSQL; la configuración está en `.env.example`.

### Windows PowerShell

Abrí PowerShell en la carpeta del proyecto:

```powershell
cd C:\Users\Joni\Desktop\web-dinamica
node --version
npm --version
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Abrí **http://localhost:3000**. Si `node --version` es menor que `22.23.0`, instalá Node.js 22 LTS y abrí una terminal nueva.

### macOS

Desde Terminal, en la carpeta del proyecto:

```bash
cd ~/Desktop/web-dinamica
node --version
npm --version
npm ci
cp .env.example .env.local
npm run dev
```

Si no tenés Node instalado, la opción recomendada es `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install 22
nvm use 22
node --version
```

También podés instalar Node.js 22 LTS desde [nodejs.org](https://nodejs.org/).

### Linux

Desde una terminal Bash, en la carpeta del proyecto:

```bash
cd ~/proyectos/web-dinamica
node --version
npm --version
npm ci
cp .env.example .env.local
npm run dev
```

### WSL

Si el proyecto está en `C:\Users\...` o `/mnt/c/...`, ejecutá `npm ci` y `npm run dev` desde **PowerShell**, no desde WSL. `node_modules` instalado desde WSL sobre un disco Windows puede quedar incompleto.

Para usar WSL, ubicá el proyecto dentro del filesystem Linux y ejecutá allí todos los comandos:

```bash
mkdir -p ~/proyectos
rsync -a --exclude=node_modules --exclude=.next --exclude=.next-dev /mnt/c/Users/Joni/Desktop/web-dinamica/ ~/proyectos/web-dinamica/
cd ~/proyectos/web-dinamica
npm ci
cp .env.example .env.local
npm run dev
```

Si WSL no tiene `rsync`, instalalo una vez con `sudo apt update && sudo apt install -y rsync`.

En ese caso abrí **http://localhost:3000** desde el navegador de Windows.

### Reinstalación limpia

Usá esto si aparece `next no se reconoce`, `next: not found` o un error `MODULE_NOT_FOUND` dentro de `node_modules`.

PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules, .next, .next-dev -ErrorAction SilentlyContinue
npm ci
npm run dev
```

macOS, Linux o WSL dentro del filesystem Linux:

```bash
rm -rf node_modules .next .next-dev
npm ci
npm run dev
```

## Recorrido

1. Registrarse en `/register` o entrar en `/login`.
2. Crear un sitio desde `/dashboard/new`.
3. Editar en `/editor/[id]`: textos, listas, imágenes, colores, menú y SEO.
   - **Portada:** composición dividida, centrada o inmersiva con imagen de fondo; imagen propia, encuadre y destino del botón.
   - **Nosotros:** imagen propia en lugar de la ilustración.
   - **Identidad y ajustes:** logo, tipografía de títulos/cuerpo, ancho del contenido, espaciado y botón del menú.
   - **Destinos:** seleccionar una sección o escribir un enlace HTTPS, email, teléfono o WhatsApp. Las direcciones de sección se conservan al reordenar.
4. Agregar/reordenar secciones y revisar escritorio o móvil.
   En **Identidad y ajustes → Colores de tu web**, elegir una de cuatro paletas o personalizar acento, fondo, textos, superficies, separadores y los tres estilos de proyectos. Los campos admiten selector de color o código hexadecimal.
5. **Guardar** conserva el borrador. **Publicar** actualiza la web pública.
6. **Ver sitio** abre `/s/[slug]`. Cada cuenta accede solo a sus propios sitios.

La plantilla original se puede ver en `/template`. `/admin` pertenece al CMS de la demo inicial y usa la misma PostgreSQL con colecciones propias de Payload; el constructor de la plataforma es `/editor/[id]`. Los usuarios de `platform_users` y los usuarios de Payload son identidades separadas.

## Plantillas públicas

La galería `/templates` y las vistas completas se pueden visitar sin iniciar sesión:

- `/templates/studio`: **Forma**, estudio creativo y portfolio.
- `/templates/restaurant`: **Brasa**, restaurante con estética cálida, menú y composición editorial.
- `/templates/consultant`: **Nexo**, servicios profesionales con diseño oscuro y tarjetas estructuradas.
- `/templates/retreat`: **Alba**, hospitalidad y experiencias con fotografía inmersiva.
- `/templates/coast`: **Marea**, hotel y escapadas costeras con fotografía inmersiva.
- `/templates/atelier`: **Línea**, arquitectura y espacios con fotografía inmersiva.
- `/templates/product`: **Vector**, producto digital con estructura modular, testimonios y planes.
- `/templates/launch`: **Nimbus**, SaaS y lanzamientos con estructura modular.
- `/templates/scale`: **Escala**, consultoría y crecimiento con estructura modular.

Forma, Brasa y Nexo se agrupan en **Editorial creativo**. Alba, Marea y Línea pertenecen a **Inmersivo fotográfico**. Vector, Nimbus y Escala pertenecen a **Modular producto**. Son tres familias con tres plantillas cada una: nueve puntos de partida en total. “Usar plantilla” conserva la selección al registrarse o iniciar sesión. Los contenidos son ficticios; el contacto inicial abre un email y sus destinos son editables. No se incluyen reservas o calendarios automáticos.

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
 src/server/db/          Pool y esquema PostgreSQL
```

Detalle de responsabilidades: [`docs/architecture.md`](docs/architecture.md).

## Comprobaciones

```bash
npm run check:cms-catalog
npm run typecheck
npm run build
npm test
npm run test:integration
npx playwright install chromium
npm run test:e2e
```

`npm run check:cms-catalog` es una comprobación de solo lectura para ejecutar antes de una migración o despliegue. Compara los `blockTypes` del editor con los bloques de Payload y verifica sus campos de filas; no conecta a PostgreSQL, no aplica migraciones y no modifica datos. Las migraciones de Payload se ejecutan por separado con `npm run migrate` únicamente en un entorno controlado.

Desarrollo usa `.next-dev` y producción usa `.next`, para que una compilación no sobrescriba los archivos del servidor local. Si quedan archivos generados inconsistentes, detené el servidor, eliminá `.next-dev` y volvé a ejecutar `npm run dev`.

## Despliegue

 El flujo de VPS y GitHub Actions está documentado en [`deploy/README.md`](deploy/README.md). El job de verificación ejecuta typecheck, tests unitarios y build. El push a `main` publica una imagen de aplicación y otra de migración en GHCR, copia Compose/Caddy y actualiza el VPS mediante SSH. Antes de levantar la aplicación, el workflow ejecuta automáticamente las migraciones de plataforma y Payload.

Ejecutá build y typecheck secuencialmente: el build regenera los tipos de `.next`. Las pruebas de navegador requieren el build previo y levantan producción en el puerto 3100. Usan una base independiente en el directorio temporal del sistema (`/tmp/opencode/forma-e2e-<id>` en Linux), incluso si tenés `PLATFORM_DATA_DIR` configurado; el servidor de desarrollo puede seguir en el puerto 3000. Los tests cubren edición/publicación, compatibilidad de documentos anteriores, aislamiento entre cuentas y uso del editor a 390 px.

## Estado del proyecto

- Editor React propio, compuesto por módulos pequeños.
- Historial deshacer/rehacer, duplicación y eliminación de secciones.
- Guardado explícito con separación entre borrador y publicación.
- Autoguardado del borrador y recuperación opcional de cambios locales tras una suspensión o cierre de pestaña.
- 22 bloques registrados en un catálogo compartido, incluido el pie de página, con configuración consistente entre editor y Payload.
- Documentos versionados (`schemaVersion: 1`), con familia, plantilla y anclas estables; lectura compatible de documentos anteriores sin sobrescribir su publicación.
- Imágenes nuevas optimizadas en el servidor como WebP y guardadas en `PLATFORM_DATA_DIR/media/`, con metadata y propietario en PostgreSQL. Conservan transparencia y ya no aumentan el JSON del sitio. Las imágenes base64 anteriores siguen funcionando.
- Cada sitio publicado tiene una dirección `/s/[slug]` en el dominio de la plataforma; los dominios personalizados validan hostname, entitlement, DNS y estado de verificación antes de habilitarse.
- Docker y la automatización de despliegue en VPS están configurados mediante GitHub Actions, GHCR, Docker Compose y Caddy. La base persiste en el volumen PostgreSQL y los archivos de la plataforma en `/app/data`.
- Contenido inicial ficticio. El bloque `contact` histórico abre email; los bloques `form` y `newsletter` nuevos persisten leads en PostgreSQL.
- Rate limiting distribuido/proxy documentado en [`docs/rate-limiting.md`](docs/rate-limiting.md), con store PostgreSQL y fallback local seguro sin servicios externos obligatorios.

Los archivos subidos tienen URLs públicas con identificadores aleatorios, necesarias para mostrarlos en los sitios. Quitar una imagen del editor elimina la referencia, no el archivo: la limpieza automática de recursos sin uso queda para una siguiente etapa. Un backup productivo debe incluir el volumen PostgreSQL, `/app/data` y, si Payload recibe media, su volumen correspondiente.

La funcionalidad detallada del editor está en [`docs/editor-component-functionality.md`](docs/editor-component-functionality.md) y el seguimiento de auditoría en [`docs/audit-followup.md`](docs/audit-followup.md). El panel administrativo inicial está en `/admin/platform` y requiere `PLATFORM_ADMIN_EMAILS`.
