# Handoff completo — Forma

Fecha: 1 de octubre de 2026.

## Estado del Producto

Forma es un MVP local multisitio construido con Next.js 15, React 19, TypeScript y Node 22.23+. El usuario puede registrarse, crear sitios, editar secciones, guardar borradores, publicar, despublicar y visitar el sitio público.

La persistencia actual del constructor usa SQLite en `data/platform.sqlite`. Las imágenes subidas se convierten a WebP y se guardan fuera del JSON en `data/media/`, con control de propietario.

La aplicación tiene tres familias y nueve plantillas:

- Editorial creativo: Forma, Brasa y Nexo.
- Inmersivo fotográfico: Alba, Marea y Línea.
- Modular producto: Vector, Nimbus y Escala.

El catálogo registra 21 tipos de bloque:

- Originales: portada, servicios, proyectos, nosotros, preguntas, contacto, galería, testimonios y planes.
- Nuevos: CTA, texto + imagen, video, logos, equipo, estadísticas, proceso, comparativa, formulario, newsletter, carta gastronómica y horarios/ubicación.

Las nueve plantillas ya fueron rehechas con combinaciones diferentes. No seguir agregando variaciones cosméticas ni nuevas familias antes de cerrar los flujos operativos.

## Verificaciones Completadas

Las siguientes comprobaciones pasaron después de la última ola de plantillas:

- `npm run typecheck`.
- `npm test`: 9 pruebas unitarias.
- `npm run build`.
- `npm run test:e2e`: 8 recorridos.
- E2E de publicación, edición, guardado, aislamiento, recuperación local, formularios, newsletter, honeypot y persistencia de leads.
- E2E público de las nueve plantillas, incluyendo bloques distintivos y ausencia de overflow a 390 px.

## Problema Prioritario Nuevo

La captura del editor mostró que los botones de portada, navegación y CTA no tienen una explicación suficientemente visible ni un sistema unificado de edición. Antes de declarar las plantillas funcionales hay que auditar todos los destinos.

### Modelo actual de destinos

- `Section.buttonHref` contiene el destino del botón principal de portada, contacto o CTA.
- `Settings.headerButton.href` contiene el destino del botón de cabecera.
- `Settings.navigation[].href` contiene destinos de navegación.
- `Action.href` contiene destinos de acciones del bloque CTA.
- Los planes usan `buttonHref`.
- La comparativa usa `buttonHref`.
- Horarios usa `mapHref`.
- Los logos, miembros del equipo y otros elementos pueden tener `href`, aunque no todos tienen una UI de edición suficientemente evidente.

### Editor actual

`SectionInspector.tsx` permite editar el texto y destino del botón para `hero`, `contact` y `cta`. `SettingsInspector.tsx` permite editar el botón de cabecera y los enlaces de navegación. `ArrayField.tsx` usa `LinkField` para campos de filas que tienen `buttonHref` o `href`.

### Resolución actual

`links.ts` valida protocolos y anclas. Los enlaces internos deben ser anclas como `#about` o `#form`; no existen páginas múltiples todavía. `resolveHref` elimina destinos a secciones que no existen. Por eso, si una plantilla apunta a una sección eliminada, el botón puede desaparecer del render público.

`SiteView` calcula las anclas estables y pasa `buttonHref` resuelto al renderizador. `HeroSection` renderiza el botón solo si existe un destino válido. `Header` valida la navegación, pero debe revisarse que siempre renderice el destino resuelto y no el valor original.

### Auditoría pendiente

1. Inventariar todos los `<a>` y botones de los renderizadores y registrar su destino por bloque.
2. Confirmar que cada CTA de las nueve plantillas tenga un destino válido.
3. Mostrar claramente en el inspector qué acción edita cada campo.
4. Revisar que los destinos por defecto no apunten a anclas ausentes.
5. Agregar soporte claro para email, teléfono, WhatsApp, URL externa y sección.
6. Agregar E2E que haga clic en cada acción de cada familia y verifique el destino.
7. Definir comportamiento de botones de formulario y newsletter: no son enlaces, envían datos y muestran estado.
8. Separar navegación de una sola página de navegación multipágina futura.
9. No implementar páginas múltiples hasta que todos los enlaces de la página única estén verificados.

El objetivo es que cada botón tenga una acción funcional, editable y verificable. No alcanza con que el texto aparezca visualmente.

## Estado Del Despliegue

Se eligió un VPS DonWeb en lugar de Vercel para conservar SQLite y el filesystem persistente.

### VPS

- Sistema: Ubuntu 24.04.5 LTS.
- IP: `201.32.129.6`.
- Hostname temporal: `vps-6459575-x.dattaweb.com`.
- Docker: 29.8.2.
- Docker Compose: v5.5.1.
- Directorio de despliegue: `/opt/forma`.
- El firewall de DonWeb necesitó una regla TCP 22 para permitir nuevas conexiones SSH.
- Los puertos 80 y 443 están habilitados.

### Entorno temporal del VPS

`/opt/forma/.env` fue creado con una configuración temporal por IP:

```dotenv
IMAGE_NAME=ghcr.io/jonathanvolker/dynamic-web:main
DOMAIN=:80
PUBLIC_URL=http://201.32.129.6
PAYLOAD_SECRET=<secreto existente, no versionar>
COOKIE_SECURE=false
```

No copiar el secreto a documentación, commits o chats. Cuando el dominio comprado esté validado, cambiar:

```dotenv
DOMAIN=tu-dominio.com
PUBLIC_URL=https://tu-dominio.com
COOKIE_SECURE=true
```

Y crear un registro DNS `A` hacia `201.32.129.6`.

### Archivos de despliegue agregados

- `Dockerfile`: imagen standalone con etapa explícita `runner` y `/app/data` persistente.
- `deploy/compose.production.yaml`: app Next.js, Caddy, volumen SQLite/medios y healthcheck.
- `deploy/README.md`: bootstrap, variables y secrets.
- `.github/workflows/deploy.yml`: validación en PR y build/publicación/despliegue después del merge a `main`.

### Secrets de GitHub configurados

En el environment `production` se cargaron:

- `VPS_HOST`.
- `VPS_USER`.
- `DEPLOY_PATH`.
- `VPS_SSH_KEY`.
- `VPS_KNOWN_HOSTS`.
- `GHCR_USERNAME`.
- `GHCR_TOKEN`.

No reemplazar ni exponer sus valores.

La clave dedicada para GitHub Actions se creó localmente como `~/.ssh/forma-github-actions`, sin passphrase, se instaló en `/root/.ssh/authorized_keys` y fue probada con éxito mediante:

```text
SSH_GITHUB_OK
```

### Flujo CI/CD

- Pull Request hacia `main`: ejecuta `Verify application`.
- Merge o push a `main`: ejecuta `Verify application`, `Publish container image` y `Deploy to VPS`.
- La imagen se publica en `ghcr.io/jonathanvolker/dynamic-web:main` y con tag de SHA.
- El workflow copia `deploy/compose.production.yaml` y `Caddyfile` a `/opt/forma`.
- El VPS hace login en GHCR, ejecuta `docker compose pull`, `docker compose up -d` y limpia imágenes antiguas.

### Primer fallo de despliegue y corrección

El primer pipeline llegó al VPS, autenticó GHCR y descargó las imágenes correctamente, pero `forma-app-1` quedó unhealthy. El log mostró:

```text
forma-web-editable@0.1.0 migrate
cannot connect to Postgres 127.0.0.1:5432
```

La causa fue que el Dockerfile tiene una etapa final `migration`; el workflow no indicaba qué target construir y Docker publicó esa etapa en vez de `runner`.

La corrección pendiente de confirmar en el PR es:

```yaml
target: runner
```

en `docker/build-push-action`.

Después de mergear esa corrección, el contenedor debe arrancar con `node server.js`, usar SQLite en `/app/data` y pasar el healthcheck.

El comando de diagnóstico usado desde PowerShell no encontró la clave WSL porque se ejecutó con una ruta Linux desde PowerShell. Para inspeccionar el VPS desde WSL usar la clave `~/.ssh/forma-github-actions`; no compartirla.

## Próximo Chat — Orden Exacto

1. Confirmar que el PR de despliegue contiene `target: runner` y que el pipeline vuelve a pasar.
2. Abrir `http://201.32.129.6` y comprobar login, registro, editor, guardado, publicación y medios.
3. Corregir cualquier error de runtime antes de tocar el dominio.
4. Auditar y hacer funcionales todos los botones, enlaces, CTA, navegación, planes, comparativas, mapa y contacto.
5. Agregar E2E de destinos y acciones de todas las plantillas.
6. Cuando el dominio esté validado, activar DNS, HTTPS y `COOKIE_SECURE=true`.
7. Implementar bandeja de leads por propietario.
8. Implementar notificaciones y rate limiting persistente.

## Reglas Operativas

- No usar `node_modules` de Windows y WSL mezclados.
- Git y npm deben ejecutarse desde PowerShell o desde un checkout Linux separado, no alternando ambos sobre `/mnt/c`.
- No ejecutar comandos Git destructivos.
- No versionar `.env`, claves privadas, tokens ni la base SQLite real.
- No declarar funcional una plantilla si sus acciones no tienen destino válido y prueba E2E.
