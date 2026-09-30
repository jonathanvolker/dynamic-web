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
│   │   ├── content/defaults.ts  # Contenido de las plantillas
│   │   ├── styles/site.css
│   │   ├── theme/palettes.ts    # Paletas, valores de respaldo y contraste de acentos
│   │   └── types.ts             # Contrato compartido de los bloques
│   ├── platform/styles/         # Estilos de acceso, panel y portada
│   ├── templates/               # Registro, contenido, galería y vistas públicas
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

Guardar modifica solo `draft`. Publicar copia el documento a `published`. La ruta `/s/[slug]` lee exclusivamente `published`.

## Agregar un bloque

1. Definir su contrato en `features/website/types.ts`.
2. Crear su componente en `features/website/components/sections` y registrarlo en `SectionRenderer`.
3. Agregar la plantilla a `features/website/content/defaults.ts`.
4. Registrar etiqueta/campos en `features/editor/config/blocks.ts` y el inspector correspondiente.
5. Actualizar la validación de `features/sites/validation.ts`.

## Persistencia y próxima etapa

SQLite es la implementación local actual. El archivo se guarda en `data/platform.sqlite`, fuera del control de versiones. El repositorio de sitios es el punto para incorporar PostgreSQL después. El editor actual está hecho con componentes React propios.

Los dominios reales, DNS y HTTPS de cada sitio todavía no están implementados. `/s/[slug]` permite probar la publicación local sin depender del despliegue.

## Plantillas

`features/templates/registry.ts` es la fuente compartida del catálogo público y del formulario de creación. Cada plantilla define sus ajustes, colores, variante visual y contenido en archivos independientes. El repositorio clona esa definición al crear el sitio; el editor y la publicación conservan la variante en `settings.template`.

Las rutas `/templates` y `/templates/[template]` no requieren autenticación. `/template` conserva el acceso a la primera demo. Las variantes visuales están en `features/website/styles/variants.css`, y las ilustraciones de portada en `features/website/components/artwork`.
