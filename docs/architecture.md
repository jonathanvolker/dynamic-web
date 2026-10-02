# Arquitectura del proyecto

La unidad de organización es la **funcionalidad**, no una carpeta global con todos los componentes.

```text
src/
├── app/                         # Rutas, layouts y carga de datos de Next.js
│   ├── (frontend)/              # Plataforma, editor, vista previa y sitios públicos
│   └── (payload)/               # Integración del CMS de la demo inicial
├── features/
│   ├── auth/
│   │   ├── components/          # Formularios de acceso
│   │   ├── server/              # Sesiones, contraseñas y repositorio de usuarios
│   │   ├── actions.ts           # Registro, login y logout
│   │   └── types.ts
│   ├── sites/
│   │   ├── components/          # Panel, tarjetas y creación de sitios
│   │   ├── server/repository.ts # Consultas y persistencia de sitios
│   │   ├── actions.ts           # Crear, guardar, publicar y despublicar
│   │   ├── validation.ts        # Validación del documento recibido
│   │   ├── document.ts          # Versión y migración de documentos antiguos
│   │   └── types.ts
│   ├── editor/
│   │   ├── components/
│   │   │   ├── fields/          # Campos, listas e imágenes
│   │   │   ├── inspector/       # Ajustes globales y propiedades de sección
│   │   │   ├── Editor.tsx       # Composición del layout
│   │   │   ├── EditorToolbar.tsx
│   │   │   ├── EditorSidebar.tsx
│   │   │   ├── EditorCanvas.tsx
│   │   │   ├── EditorInspector.tsx
│   │   │   └── LivePreview.tsx
│   │   ├── hooks/               # Estado/historial y puente con el iframe
│   │   ├── config/blocks.ts     # Etiquetas, símbolos y campos de listas
│   │   ├── lib/image.ts         # Procesamiento de imágenes
│   │   └── styles/editor.css
│   ├── website/
│   │   ├── components/sections/ # Un componente por tipo de sección
│   │   ├── content/defaults.ts  # Defaults de la plantilla base
│   │   ├── styles/site.css
│   │   ├── theme/palettes.ts    # Paletas, valores de respaldo y contraste de acentos
│   │   └── types.ts             # Contrato compartido de los bloques
│   ├── platform/styles/         # Estilos de acceso, panel y portada
│   ├── templates/               # Registro, contenido por plantilla, galería y vistas públicas
│   ├── billing/                 # Planes y suscripciones manuales
│   └── cms/config.ts            # Configuración aislada de Payload
├── server/db/sqlite.ts          # Conexión y esquema de la persistencia local
└── payload.config.ts            # Entrada estable para la integración de Payload
```

## Responsabilidades

- **Rutas:** resuelven parámetros, sesión y datos; componen vistas.
- **Acciones:** autentican, validan, llaman al repositorio y revalidan rutas.
- **Repositorios:** contienen SQL; no dependen de componentes React.
- **Editor:** modifica un documento; no accede directamente a SQL ni a contraseñas.
- **Website:** renderiza el documento publicado o la vista previa con los mismos componentes.
- **Estilos:** separados entre plataforma, editor y web renderizada.

## Flujo de publicación

`Editor → acción saveSite → validación → repositorio → borrador/publicación`

Guardar modifica solo `draft`. Publicar copia el documento a `published`. La ruta `/s/[slug]` renderiza exclusivamente `published`.

Los documentos nuevos incluyen `schemaVersion: 1`, `familyId` y `templateId`. `migrateDocument` normaliza documentos anteriores al leerlos, asignando IDs y anclas estables, sin escribir en la base. Cada snapshot se migra de forma independiente: abrir un editor no publica el borrador. La versión normalizada se persiste al guardar; la publicación anterior se conserva hasta publicar explícitamente. Versiones futuras desconocidas se rechazan.

`settings.template` permanece como compatibilidad para los componentes de la demo; la validación exige que coincida con `templateId`. Las familias implementadas son `editorial`, `immersive` y `modular`. El modelo aún es de una página; páginas y elementos anidados son etapas pendientes.

## Medios

`POST /api/platform/media` verifica origen y sesión, recibe JPG/PNG/WebP de hasta 8 MB y normaliza la imagen con Sharp, conservando transparencia. `features/sites/server/media.ts` almacena el WebP en `PLATFORM_DATA_DIR/media/` y registra su propietario en SQLite. `GET /api/platform/media/[id]` sirve el recurso público por un ID opaco.

`saveSite` valida el documento y la pertenencia de todas las referencias de imágenes nuevas, incluidas logo, portada, proyectos, galería, logos y equipo, antes de persistir. El frontend guarda URLs, no base64. Las imágenes embebidas de sitios anteriores se siguen aceptando. Los recursos son inmutables; reemplazar genera otro ID. La eliminación y recolección de archivos sin referencias todavía no están implementadas para evitar borrar recursos usados por un snapshot publicado.

## Personalización compartida

`settings.design` contiene selecciones tipográficas, ancho y espaciado. `customization.css` aplica overrides bajo `.website-root`, después de los estilos de las plantillas. Los campos no configurados mantienen el aspecto original. El resto del CSS histórico global se aislará en una etapa posterior.

Portada admite `split`, `centered` y `cover`, imagen propia y encuadre. `buttonHref` y el botón de cabecera son configurables. `website/links.ts` comparte validación de protocolos y resolución de anclas; no se muestran enlaces internos a secciones eliminadas. Editor y publicación utilizan el mismo renderizador.

## Catálogo de bloques

`features/website/blocks.ts` es el registro compartido de los 21 bloques actuales. Cada definición aporta etiqueta, símbolo, defaults y, si corresponde, la clave de su lista editable. La biblioteca del editor, los inspectores y la validación consumen ese registro; no hay una lista separada por template. La primera ola agrega CTA, texto + imagen, video, logos, equipo, estadísticas, proceso, comparativa, formulario, newsletter, carta gastronómica y horarios/ubicación.

Los renderizadores de `GallerySection`, `TestimonialsSection`, `PricingSection`, `UtilitySections` y `LeadSections` consumen esos contratos. Las familias pueden darles composiciones propias mediante CSS sin duplicar el modelo. Los planes, CTAs, logos, perfiles y comparativas validan sus destinos; los bloques con imágenes validan sus referencias de medios. Formularios y newsletter envían datos al endpoint público y los persisten por sitio en SQLite. Las listas usan campos por fila; la composición libre con elementos anidados queda pendiente.

## Recuperación del editor

Cada sitio mantiene un snapshot local opcional bajo `localStorage` (`forma:draft:<siteId>`). Al modificar el documento, el editor guarda una copia local y programa un autoguardado del borrador a los dos segundos de inactividad. Si encuentra una copia local válida al volver a abrir el editor, la recupera y muestra el estado para que el usuario la guarde explícitamente. Publicar o guardar manualmente elimina la copia local. El autoguardado nunca modifica `published`; si falla, el documento sigue disponible en memoria y el usuario puede guardar manualmente.

## Agregar un bloque

1. Definir su contrato en `features/website/types.ts`.
2. Crear su componente en `features/website/components/sections` y registrarlo en `SectionRenderer`.
3. Agregar la plantilla a `features/website/content/defaults.ts`.
4. Registrar etiqueta/campos en `features/editor/config/blocks.ts` y el inspector correspondiente.
5. Actualizar la validación de `features/sites/validation.ts`.

## Persistencia y próxima etapa

SQLite es la implementación local actual. El archivo se guarda en `data/platform.sqlite`, fuera del control de versiones. El repositorio de sitios es el punto para incorporar PostgreSQL después. El editor actual está hecho con componentes React propios.

Los dominios reales, DNS y HTTPS de cada sitio todavía no están implementados. `/s/[slug]` permite probar la publicación local sin depender del despliegue.

La primera capa de suscripciones usa planes manuales (`free`, `starter`, `pro`) y suscripciones persistidas en SQLite. El panel interno está en `/admin/platform` y se habilita para emails definidos en `PLATFORM_ADMIN_EMAILS` o usuarios con `role = admin`. Todavía no procesa pagos: el proveedor y sus webhooks serán la siguiente integración.

## Plantillas

`features/templates/registry.ts` es la fuente compartida de familias y plantillas para el catálogo público y el formulario de creación. Forma, Brasa y Nexo pertenecen a la familia Editorial creativo; Alba, Marea y Línea a Inmersivo fotográfico; Vector, Nimbus y Escala a Modular producto. El catálogo mantiene tres familias con tres plantillas cada una. Cada plantilla define sus ajustes, colores, variante visual y contenido en archivos independientes. El repositorio clona esa definición al crear el sitio y genera el documento versionado.

Las rutas `/templates` y `/templates/[template]` no requieren autenticación. `/template` conserva el acceso a la primera demo. Las variantes visuales están en `features/website/styles/variants.css`, y las ilustraciones de portada en `features/website/components/artwork`.
