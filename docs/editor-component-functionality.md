# Funcionalidad del editor y componentes de secciones

Documento de referencia funcional y técnico del editor visual, sus secciones, los campos editables, la preview y las reglas que afectan el contenido publicado.

## 1. Alcance y arquitectura

El editor permite modificar el borrador de un sitio, previsualizar cada cambio, guardar el borrador y publicar una versión. La pantalla está compuesta por cuatro áreas:

- `EditorToolbar`: identidad del sitio, historial, dispositivo, guardado y publicación.
- `EditorSidebar`: lista de secciones, orden, eliminación y biblioteca de bloques.
- `EditorCanvas`: preview completa dentro de un `iframe`.
- `EditorInspector`: propiedades de la sección o ajustes globales.

Archivos principales:

- `src/features/editor/components/Editor.tsx`: composición de la pantalla.
- `src/features/editor/hooks/use-site-editor.ts`: estado, mutaciones, historial, permisos y guardado.
- `src/features/editor/components/EditorToolbar.tsx`: barra superior.
- `src/features/editor/components/EditorSidebar.tsx`: secciones y biblioteca.
- `src/features/editor/components/EditorCanvas.tsx`: preview principal.
- `src/features/editor/components/EditorInspector.tsx`: inspector contextual.
- `src/features/editor/components/inspector/SectionInspector.tsx`: propiedades de secciones.
- `src/features/editor/components/inspector/SettingsInspector.tsx`: propiedades globales.
- `src/features/editor/config/blocks.ts`: reexportación del catálogo de bloques para el editor.
- `src/features/website/blocks.ts`: catálogo único de bloques, filas, labels y defaults.
- `src/features/website/components/SectionRenderer.tsx`: despacho al componente visual.
- `src/features/website/components/SiteView.tsx`: composición del sitio completo.
- `src/features/sites/validation.ts`: validación de persistencia.

El documento editado es un `SiteDocument`. Sus partes más importantes son:

- `settings`: marca, logo, email, navegación, paleta y diseño.
- `sections`: lista ordenada de secciones, incluido el footer.
- `familyId`: familia visual (`editorial`, `immersive` o `modular`).
- `templateId`: plantilla de origen.
- `schemaVersion`: versión del formato persistido.

Cada sección tiene propiedades comunes y propiedades específicas:

- `blockType`: identifica el componente.
- `id`: identidad interna estable.
- `anchor`: dirección estable usada por los enlaces internos.
- `eyebrow`: etiqueta superior.
- `title`: título principal.
- `description`: texto descriptivo opcional.
- Propiedades propias del bloque: listas, imágenes, enlaces, formularios, configuración visual, etc.

## 2. Flujo de edición

### 2.1 Carga inicial

1. La página del editor carga el sitio y verifica que pertenezca al usuario.
2. Se construye `EditorAccess` a partir del plan y el estado de suscripción.
3. `ensureFooter` garantiza que exista un pie de página.
4. La primera sección queda seleccionada.
5. El panel inicial es la preview completa.
6. Se intenta recuperar un borrador local bajo `forma:draft:${site.id}`.
7. Se monta el iframe `/preview` y se inicia la comunicación por `postMessage`.

### 2.2 Selección

Una sección puede seleccionarse desde:

- Un elemento de la lista lateral.
- Un clic sobre la sección en la preview completa.
- El botón de propiedades en móvil.

Al seleccionar:

- Se actualiza `active`.
- Se limpia `activeField`.
- Se abre el panel de propiedades.
- Se envía la selección al iframe.
- La preview intenta centrar la sección seleccionada.

El footer se identifica tanto por `blockType === 'footer'` como por su índice dentro del documento. El índice visual de la sección se convierte en una selección del editor mediante el mensaje `forma:select`.

### 2.3 Modificación

Cada control llama a una de estas mutaciones:

- `change`: clona el documento y aplica una función.
- `changeSection`: modifica una propiedad de la sección activa.
- `changeSetting`: modifica una propiedad global.

Una modificación:

- Se bloquea si el usuario no puede editar.
- Se bloquea si la sección está conservada por el plan.
- Se agrega al historial.
- Borra el historial de redo.
- Actualiza el documento en memoria.
- Limpia el error anterior.
- Actualiza la preview.
- Se copia al almacenamiento local si el documento queda dirty.

### 2.4 Guardado

El estado dirty compara el JSON guardado contra el JSON actual. Cuando hay diferencias:

- La barra muestra `Cambios sin guardar`.
- Se registra una advertencia de salida del navegador.
- Se guarda una copia local.
- Se programa un guardado automático después de dos segundos.

El autosave solo guarda el borrador. Nunca publica por sí solo.

El botón `Guardar` persiste el borrador y deja sin cambios la versión pública.

El botón `Publicar` o `Republicar` persiste y actualiza la versión pública, si el plan lo permite.

### 2.5 Historial

El historial conserva hasta 20 estados anteriores. Incluye cambios de:

- Texto.
- Links.
- Imágenes y textos alternativos.
- Paleta y diseño.
- Filas de colecciones.
- Orden de secciones.
- Alta, duplicación y eliminación.

`Undo` mueve el estado actual a `future` y recupera el último estado de `history`.

`Redo` mueve el estado actual a `history` y recupera el primer estado de `future`.

Una nueva edición después de un undo borra el futuro.

## 3. Barra superior

Archivo: `src/features/editor/components/EditorToolbar.tsx`.

### Identidad

- Flecha de regreso al dashboard.
- Logo de Forma.
- Nombre del sitio, truncado para evitar desbordes.
- Estado de guardado: guardado o cambios sin guardar.

Si hay cambios sin guardar y se intenta salir, se abre un modal de confirmación. El usuario puede cancelar o salir sin guardar.

### Historial

- `Deshacer`: se deshabilita sin estados anteriores.
- `Rehacer`: se deshabilita sin estados futuros.

No existen atajos de teclado propios para undo/redo.

### Dispositivo

- `Vista escritorio`: canvas flexible.
- `Vista móvil`: marco de 390 px.

En pantallas pequeñas se ocultan estos botones porque la interfaz ya es móvil.

### Publicación

- `Guardar`: requiere `canEdit`.
- `Publicar` o `Republicar`: requiere `canPublish`.
- Ambos muestran estado ocupado durante la petición.
- Si existe `publishedAt`, aparece `PUBLICADO` y un enlace para abrir el sitio.

## 4. Navegación lateral

Archivo: `src/features/editor/components/EditorSidebar.tsx`.

### Pestaña Secciones

Cada fila muestra:

- Número de orden con dos dígitos.
- Símbolo del bloque.
- Nombre contextual según la familia visual.
- Primer renglón del título.
- Marca `Conservada` si el bloque no está disponible en el plan.
- Botones de subir, bajar y eliminar.

La sección seleccionada usa fondo de acento y borde destacado.

### Orden

Se puede ordenar con:

- Drag and drop.
- Flecha subir.
- Flecha bajar.

El footer siempre debe quedar último y no puede moverse. Las secciones conservadas no se pueden arrastrar ni reordenar.

### Eliminación

La eliminación abre un modal. No se puede eliminar:

- El footer.
- La última sección restante.
- Una sección bloqueada por el plan.

La acción se puede recuperar con undo.

### Biblioteca de bloques

`+ Agregar` muestra los bloques disponibles en un orden recomendado por familia. Al agregar:

- Se elige el default de la plantilla si existe.
- Si no existe, se usa el default del catálogo.
- Se crea un `id` nuevo.
- Se calcula un anchor único.
- La nueva sección pasa a ser activa.

Hay un límite de 30 secciones de contenido, sin contar el footer.

## 5. Inspector general

Archivo: `src/features/editor/components/EditorInspector.tsx`.

El título cambia según el objetivo:

- `Estilos e identidad` para settings.
- `Pie de página` para footer.
- Nombre del bloque para una sección.

El inspector captura el foco. El elemento enfocado se identifica por `data-editor-field`, se guarda en `activeField` y se busca el elemento equivalente en la preview.

La preview interna de sección:

- Renderiza solo la sección activa.
- Tiene un viewport de 230 px.
- Oculta el header para evitar ruido.
- Oculta el footer al previsualizar cualquier bloque que no sea el footer.
- Muestra el footer real cuando el bloque activo es `footer`.
- Permite resaltar el campo activo.
- Se desplaza al elemento destacado.

La condición anterior es importante: `SiteView` siempre renderiza el footer, incluso cuando recibe una sola sección. Por eso el CSS debe ocultarlo solo para previews que no sean de footer. El contenedor usa `data-preview-block` para distinguir ambos casos.

## 6. Campos reutilizables

### 6.1 Field

Archivo: `src/features/editor/components/fields/Field.tsx`.

Es el campo textual base.

- Usa `input` para texto de una línea.
- Usa `textarea` de tres filas cuando `multiline` es verdadero.
- Genera un id con `useId`.
- Conecta el label con el control mediante `htmlFor`.
- Agrega `data-editor-field` para el highlight.
- Actualiza el valor en cada `onChange`.

La longitud definitiva se valida en servidor; el campo no impone por sí mismo todos los límites del modelo.

### 6.2 LinkField

Archivo: `src/features/editor/components/fields/LinkField.tsx`.

Agrupa dos formas de definir un destino:

1. Un select de secciones existentes.
2. Un campo libre para una URL o acción.

El select muestra anchors calculados desde las secciones actuales. El campo libre acepta, según validación:

- `#anchor`.
- Rutas internas.
- `https://`.
- `mailto:`.
- `tel:`.
- `https://wa.me/...`.

Muestra advertencias cuando:

- El anchor interno ya no existe.
- El protocolo o formato no es seguro.

Un destino inválido se conserva en el borrador para poder corregirlo, pero no se renderiza como link funcional en el sitio público.

### 6.3 ProjectImageField

Archivo: `src/features/editor/components/fields/ProjectImageField.tsx`.

Se usa para imágenes de sección, proyectos, galería, logos, equipo y logo global.

Flujo:

1. El usuario elige un archivo.
2. Se valida JPEG, PNG o WebP.
3. Se rechazan archivos mayores a 8 MB.
4. Se sube a `/api/platform/media`.
5. Se utiliza `AbortController` para cancelar o limpiar la operación.
6. Se muestra la preview.
7. Se genera un alt inicial desde el título.
8. El usuario puede editar el alt.
9. Puede quitar la imagen o volver al nombre de marca, según el campo.

El servidor verifica propiedad de la media antes de aceptar el documento.

### 6.4 ArrayField

Archivo: `src/features/editor/components/fields/ArrayField.tsx`.

Es el editor común de colecciones.

Cada colección muestra:

- Nombre de la colección.
- Cantidad de elementos.
- Un `<details>` por fila.
- Título resumido de la fila.
- Campos editables.
- Acción para eliminar.
- Botón para agregar.

Un único elemento se abre automáticamente. El máximo es 20 filas.

Al agregar, usa valores iniciales especiales para título, pregunta, destino de botón y tipo de campo. El tono de proyectos inicia en `peach`.

Los selects dentro de filas usan un fondo gris diferenciado para marcar la jerarquía respecto de los selects de propiedades principales.

## 7. Catálogo completo de bloques

El catálogo vive en `src/features/website/blocks.ts`. Define label, símbolo, colección, defaults y orden recomendado.

### 7.1 Portada (`hero`)

Componente: `HeroSection.tsx`.

Objetivo: presentar la propuesta principal, la marca y el primer llamado a la acción.

Campos comunes:

- Etiqueta superior.
- Título `h1`.
- Descripción.
- Texto del botón.
- Destino del botón.

Campos específicos:

- Imagen.
- Encuadre de imagen.
- Composición de portada.

Composiciones:

- `split`: texto e imagen en columnas.
- `centered`: texto centrado e imagen debajo.
- `cover`: imagen como fondo inmersivo.

Contenido visual interno:

- Eyebrow con indicador.
- Título principal.
- Texto descriptivo.
- CTA.
- Imagen real o artwork de la plantilla.
- Tagline de settings.
- Enlace de descubrimiento cuando la familia lo permite.

El artwork puede ser de studio, restaurant, consultant o product. Una imagen subida puede reemplazar la composición gráfica.

Validaciones específicas:

- Layout limitado a `split`, `centered` o `cover`.
- Posición limitada a `center`, `top` o `bottom`.
- Imagen válida si existe.
- Link seguro.

### 7.2 Servicios (`services`)

Componente: `ServicesSection.tsx`.

Objetivo: explicar capacidades, servicios o beneficios.

Cada fila tiene:

- Nombre.
- Descripción.
- Especialidades o tags.

El render muestra numeración, símbolo decorativo, título, descripción y tags. No tiene interacción propia. La familia visual controla la grilla, el ritmo y el tratamiento tipográfico.

### 7.3 Proyectos (`projects`)

Componente: `ProjectsSection.tsx` y `ProjectCard.tsx`.

Objetivo: mostrar portfolio, casos o trabajos destacados.

Cada fila tiene:

- Nombre.
- Categoría.
- Detalle del proyecto.
- Composición cromática.
- Imagen opcional.

Tonos disponibles:

- `peach` / Durazno.
- `purple` / Violeta.
- `lime` / Lima.

La tarjeta contiene botón, imagen o artwork, categoría, título e indicador de apertura. Al hacer clic abre un `<dialog>` con descripción, cierre y posibilidad de cerrar haciendo clic fuera del contenido.

### 7.4 Nosotros (`about`)

Componente: `AboutSection.tsx`.

Objetivo: presentar historia, identidad o posicionamiento.

Campos:

- Etiqueta.
- Título.
- Descripción.
- Imagen.
- Encuadre.
- Estadísticas.

La parte visual incluye imagen o artwork, marca, tagline y símbolo dependiente de plantilla. La colección `stats` agrega valor y descripción para cada cifra.

### 7.5 Preguntas (`faq`)

Componente: `FaqSection.tsx`.

Objetivo: responder dudas frecuentes.

Cada fila contiene:

- Pregunta.
- Respuesta.

Se renderiza con `<details>` y `<summary>`. La expansión y contracción son nativas, sin JavaScript adicional. El símbolo visual cambia mediante CSS.

### 7.6 Contacto (`contact`)

Componente: `ContactSection.tsx`.

Objetivo: cerrar el recorrido con una acción de contacto.

Campos:

- Eyebrow.
- Título.
- Descripción.
- Texto del botón.
- Destino.

Incluye un enlace destacado y un botón final. Si no se define un destino, usa el email de settings como `mailto:`. Los links inválidos se marcan en preview y no funcionan en producción.

### 7.7 Galería (`gallery`)

Componente: `GallerySection.tsx`.

Objetivo: mostrar imágenes, espacios, productos o momentos.

Cada fila tiene:

- Nombre.
- Pie de imagen.
- Imagen.

El render incluye un carrusel horizontal con `<figure>`, imagen o placeholder, título y caption. En el sitio publicado ofrece:

- Scroll horizontal.
- Dots navegables.
- Flechas de teclado izquierda y derecha.
- `Home` y `End`.
- Autoplay periódico.
- Pausa después de interacción.
- Respeto por `prefers-reduced-motion`.

En preview se desactiva el autoplay y el scroll-snap para que editar no produzca desplazamientos inesperados.

### 7.8 Testimonios (`testimonials`)

Componente: `TestimonialsSection.tsx`.

Objetivo: presentar opiniones.

Cada fila tiene:

- Testimonio.
- Nombre.
- Rol o contexto.

La tarjeta renderiza comilla decorativa, blockquote, inicial, nombre y rol. No tiene interacción propia.

### 7.9 Planes y precios (`pricing`)

Componente: `PricingSection.tsx`.

Objetivo: presentar propuestas comerciales.

Cada plan tiene:

- Nombre.
- Precio o valor.
- Período.
- Descripción.
- Ventajas, una por línea.
- Texto de botón.
- Destino.
- Checkbox para destacar.

El render muestra tarjetas, badge de destacado, precio, período, descripción, lista de ventajas y CTA. Cada ventaja se separa por saltos de línea.

### 7.10 CTA destacado (`cta`)

Componente: `UtilitySections.tsx`.

Objetivo: enfatizar el siguiente paso.

Cada acción tiene:

- Texto.
- Destino.
- Estilo interno `primary` o `secondary`.

El editor expone texto y destino. El estilo se conserva en el modelo y se usa en el render. Los destinos se resuelven contra anchors y se invalidan visualmente si no existen.

### 7.11 Texto + imagen (`textImage`)

Componente: `UtilitySections.tsx`.

Objetivo: combinar explicación y apoyo visual.

Campos:

- Eyebrow.
- Título.
- Descripción.
- Imagen.
- Encuadre.
- Ubicación de imagen.

Layouts:

- Imagen a la derecha.
- Imagen a la izquierda.

En móvil se vuelve a una sola columna y el CSS determina el orden final.

### 7.12 Video o embed (`video`)

Componente: `UtilitySections.tsx`.

Objetivo: incorporar una demostración audiovisual.

Campos:

- Proveedor.
- ID del video.
- Título accesible.

Proveedores:

- YouTube mediante `youtube-nocookie.com`.
- Vimeo mediante `player.vimeo.com`.

El ID se codifica antes de construir el iframe. El iframe usa relación 16:9, carga lazy y permite pantalla completa.

### 7.13 Logos de clientes (`logos`)

Componente: `UtilitySections.tsx`.

Objetivo: mostrar marcas asociadas.

Cada fila tiene:

- Nombre.
- Imagen opcional.
- Enlace opcional.

Se renderiza como logo visual si existe imagen o como texto si no existe. El enlace se muestra solo cuando es válido.

### 7.14 Equipo (`team`)

Componente: `UtilitySections.tsx`.

Objetivo: presentar personas.

Cada fila tiene:

- Nombre.
- Rol.
- Biografía.
- Imagen.
- Perfil opcional.

Sin imagen se usa la inicial. Con imagen se muestra la media subida. El perfil puede ser un link interno o externo seguro.

### 7.15 Estadísticas (`stats`)

Componente: `UtilitySections.tsx`.

Objetivo: mostrar resultados cuantificables.

Cada fila tiene:

- Valor.
- Descripción.

El valor se presenta con jerarquía tipográfica alta y la descripción aporta contexto. La grilla se vuelve de una columna en móvil.

### 7.16 Proceso (`process`)

Componente: `UtilitySections.tsx`.

Objetivo: explicar etapas de trabajo.

Cada fila tiene:

- Nombre del paso.
- Descripción.
- Duración opcional.

Se muestra como una secuencia numerada. La duración solo aparece cuando tiene contenido.

### 7.17 Comparativa de planes (`comparison`)

Componente: `UtilitySections.tsx`.

Objetivo: comparar alternativas con mayor detalle.

Cada fila tiene:

- Nombre del plan.
- Precio.
- Período.
- Descripción.
- Características separadas por línea.
- Texto del botón.
- Destino.
- `featured` en el modelo.

El catálogo incluye un plan destacado. A diferencia de `plans`, el editor actual no ofrece un checkbox específico para modificar `featured` en esta colección.

### 7.18 Formulario de contacto (`form`)

Componente: `LeadSections.tsx`.

Objetivo: recibir consultas.

Campos de sección:

- Texto del botón.
- Mensaje de éxito.

Cada campo del formulario tiene:

- Etiqueta visible.
- Nombre técnico.
- Tipo.
- Requerido o no.

Tipos:

- `text`.
- `email`.
- `tel`.
- `textarea`.

Internamente incluye honeypot anti-spam, controles dinámicos, estado ocupado, estado de error y mensaje de éxito. En preview no envía datos reales y el botón queda deshabilitado. En producción envía a `/api/public/leads` con `kind: contact`.

Validaciones:

- Nombre técnico con formato permitido.
- Nombres únicos.
- Tipo soportado.
- Requerido booleano.
- Máximo 20 campos.

### 7.19 Newsletter (`newsletter`)

Componente: `LeadSections.tsx`.

Objetivo: capturar suscripciones de email.

Campos:

- Etiqueta del email.
- Texto de consentimiento.
- Texto del botón.
- Mensaje de éxito.

El render incluye email, checkbox de consentimiento, botón y estados de éxito/error. El email y el consentimiento son requeridos en HTML. En producción envía a la API con `kind: newsletter`; en preview no envía datos.

### 7.20 Carta gastronómica (`menu`)

Componente: `UtilitySections.tsx`.

Objetivo: presentar platos y bebidas.

Cada fila tiene:

- Categoría.
- Nombre.
- Descripción.
- Precio.
- Información dietaria opcional.

El render agrupa visualmente la categoría y presenta nombre, descripción, etiqueta dietaria y precio.

### 7.21 Horarios y ubicación (`hours`)

Componente: `UtilitySections.tsx`.

Objetivo: informar cómo visitar el negocio.

Campos directos:

- Dirección.
- Teléfono.
- Enlace de mapa.

Cada horario tiene:

- Día.
- Horario.

El render usa `address`, enlaces `tel:`, botón de mapa y una lista semántica de horarios con `dl`, `dt` y `dd`. El mapa debe ser una URL HTTPS válida.

### 7.22 Pie de página (`footer`)

Componente: `Footer.tsx`.

Objetivo: cerrar el sitio con identidad, contacto, navegación y texto legal.

Campos:

- Frase del pie.
- Email.
- Título de navegación.
- Título de contacto.
- Texto legal.
- Enlaces del pie.

Cada enlace del footer tiene:

- Nombre.
- Destino.

Elementos renderizados:

- Logo que vuelve a `#main`.
- Tagline.
- Navegación del pie.
- Email como `mailto:`.
- Copyright.

Variantes por familia:

- `editorial`: marca y tagline a la izquierda, email y copyright a la derecha.
- `immersive`: navegación arriba, marca y email en el centro visual, copyright abajo.
- `modular`: grilla de marca, exploración y contacto.

Restricciones:

- Debe existir.
- Debe ser la última sección.
- No se puede mover.
- No se puede duplicar.
- No se puede eliminar.

La preview del footer utiliza el componente real, no una versión especial. El CSS de la preview interna oculta el footer solo para otros bloques; cuando `data-preview-block="footer"`, el footer permanece visible.

## 8. Ajustes globales

Archivo: `src/features/editor/components/inspector/SettingsInspector.tsx`.

### Identidad

- Nombre de marca.
- Logo.
- Frase global del pie.
- Email de contacto.

Estos valores alimentan header, footer, artworks, enlaces de contacto y formularios.

### Tema

`ThemeInspector` permite:

- Elegir una paleta predefinida.
- Ver muestras de fondo, texto, acento y tonos de proyectos.
- Cambiar manualmente el acento y los colores.

`ColorField` tiene selector nativo y entrada hexadecimal. Solo acepta valores completos `#RRGGBB`, normaliza a minúsculas y restaura el valor anterior si la entrada queda inválida al perder foco.

### Diseño

`DesignInspector` controla:

- Tipografía de títulos: Manrope, DM Sans, Georgia o Sistema.
- Tipografía de textos: las mismas opciones.
- Ancho: estrecho, estándar o amplio.
- Espaciado: compacto, estándar o aireado.

La opción `Original de la plantilla` elimina la personalización para esa propiedad.

### Botón del menú

- Texto del botón.
- Destino del botón.

El default es `Hablemos` hacia `#contact`.

### SEO

- Título de la web.
- Descripción de la web.

### Navegación global

Cada enlace tiene:

- Nombre.
- Destino.
- Acción para quitarlo.

El máximo es de cinco enlaces. Los destinos pasan por el mismo sistema de anchors y validación de URLs.

## 9. Preview y comunicación

La preview completa vive en un iframe `/preview` para aislar el sitio del editor.

Mensajes principales:

- `forma:ready`: el iframe indica que está listo.
- `forma:preview`: el editor envía el documento.
- `forma:highlight`: indica objetivo y campo.
- `forma:scroll-to`: pide centrar un objetivo.
- `forma:select`: el iframe pide seleccionar una sección.

La comunicación se acepta solo cuando:

- El origen coincide con `window.location.origin`.
- El evento proviene del iframe esperado.

La preview bloquea navegación real de anchors y evita envíos reales de formularios. Los links inválidos se muestran con estilo de advertencia.

El highlight usa `data-forma-field`. Puede apuntar a:

- Campo común.
- Campo de una fila, por ejemplo `projects.0.title`.
- Campo de navegación, por ejemplo `navigation.1.label`.
- Campo del footer, por ejemplo `footerCopyright`.

Si el campo exacto no existe, el sistema intenta localizar un campo padre o resaltar la sección completa.

## 10. Responsive del editor

En desktop:

- Toolbar superior.
- Sidebar de 235 px.
- Canvas flexible.
- Inspector de 285 px.

Hasta 1100 px se reducen columnas y padding.

Hasta 760 px:

- Se ocultan undo/redo y el selector de dispositivo.
- Aparecen tabs de Secciones, Propiedades, Estilos y Preview.
- Solo se muestra un panel a la vez.
- La preview ocupa el espacio disponible debajo de toolbar y tabs.
- El scroll del contenido se mantiene dentro del iframe.
- Se usa safe area inferior.
- Los inputs conservan 16 px para evitar zoom automático de Safari.
- Los controles de orden tienen área mínima de 44 px.

## 11. Permisos y conservación de contenido

Un bloque que no pertenece al plan actual permanece visible y editable visualmente como contenido conservado, pero no se puede modificar, duplicar, ordenar ni eliminar.

El servidor vuelve a validar estas reglas al guardar. El bloqueo visual no es la única protección.

Estados de suscripción:

- Activa: edición y publicación según plan.
- Pago pendiente: edición y guardado, con advertencia y período de gracia.
- Vencida: banner, sin edición, guardado ni publicación.

## 12. Validación transversal

El documento se valida antes de persistir.

Reglas generales:

- Bloques reconocidos.
- IDs únicos.
- Anchors únicos y con formato válido.
- Título y eyebrow obligatorios cuando corresponda.
- Descripciones con límite de longitud.
- Media con estructura válida.
- Máximo de 30 secciones de contenido.
- Máximo de 20 elementos por colección.
- Footer obligatorio y último.
- Links seguros.
- Propiedad de media perteneciente al usuario y sitio.

Protocolos aceptados:

- Anchors existentes.
- Rutas internas.
- `mailto:`.
- `tel:`.
- HTTPS sin credenciales.

Se rechazan espacios, barras invertidas, caracteres de control, protocolos inseguros y anchors inexistentes.

## 13. Matriz rápida de bloques y editor

| Bloque | Colección | Campos especiales | Interacción propia |
| --- | --- | --- | --- |
| Portada | No | Layout, imagen, encuadre, CTA | CTA y discovery |
| Servicios | `services` | Tags | No |
| Proyectos | `projects` | Tono, imagen | Modal de proyecto |
| Nosotros | `stats` | Imagen, encuadre | No |
| Preguntas | `questions` | Respuesta multilinea | `<details>` |
| Contacto | No | CTA | Links |
| Galería | `gallery` | Imagen | Carrusel, teclado, autoplay |
| Testimonios | `testimonials` | Quote | No |
| Planes | `plans` | Precio, features, destacado | CTA |
| CTA destacado | `actions` | Tipo de acción | Links |
| Texto + imagen | No | Imagen, layout | No |
| Video | No | Proveedor, ID | Iframe externo |
| Logos | `logos` | Imagen, link | Link opcional |
| Equipo | `team` | Imagen, perfil | Link opcional |
| Estadísticas | `stats` | Valor y label | No |
| Proceso | `process` | Duración | No |
| Comparativa | `comparison` | Precio, features | CTA |
| Formulario | `formFields` | Tipo, requerido | Envío a API |
| Newsletter | No | Email, consentimiento | Envío a API |
| Menú | `menu` | Precio, dieta | No |
| Horarios | `hours` | Mapa, teléfono | Teléfono y mapa |
| Footer | navegación propia | Email, labels, copyright | Anchors y mailto |

## 14. Archivos visuales relacionados

- `src/features/website/styles/site.css`: reset, layout base, header, footer, controles generales.
- `src/features/website/styles/blocks.css`: estilos de bloques.
- `src/features/website/styles/families.css`: diferencias entre familias.
- `src/features/website/styles/variants.css`: variantes visuales.
- `src/features/website/styles/customization.css`: variables de color, tipografía, ancho y espaciado.
- `src/features/editor/styles/editor.css`: layout y controles del editor.

La misma estructura de contenido puede verse de forma muy distinta según `familyId`, la plantilla, la paleta y el diseño. La funcionalidad del bloque permanece, mientras que la familia modifica composición, ritmo, tipografía, color, espaciado y tratamiento del footer.
