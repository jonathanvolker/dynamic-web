# Diagnóstico y plan — estilos reales, editor flexible y producto funcional

Fecha: 1 de octubre de 2026. Propuesta basada en la revisión del código actual.

## Progreso de implementación — primera entrega

El diagnóstico de las secciones 1 a 4 describe la situación inicial. La primera entrega agregó:

- Entorno recuperado y requisito de Node unificado en 22.23 o posterior.
- Familia Editorial creativo en galería y creación, con las tres plantillas existentes.
- Documento v1 con familia/plantilla e identificadores estables; migración de lectura sin reescribir borrador ni publicación anteriores.
- Tres composiciones de portada, imágenes de portada/nosotros, logo, encuadre y destinos de botones/menú editables.
- Fuentes de títulos y cuerpo, ancho y espaciado global configurables.
- Carga autenticada y almacenamiento de imágenes WebP fuera del documento; validación de propiedad y compatibilidad con base64 anterior.
- Ocho pruebas unitarias y seis recorridos de navegador, incluida edición móvil, aislamiento de cuentas/medios, recuperación local y separación entre borrador/publicación.
- Registro compartido de nueve bloques: portada, servicios, proyectos, nosotros, FAQ, contacto, galería, testimonios y planes.
- Familia Inmersivo fotográfico con Alba, Marea y Línea, y familia Modular producto con Vector, Nimbus y Escala; ambas con layouts propios, footers propios y adaptación móvil. El catálogo queda balanceado: tres familias y nueve plantillas.
- Autoguardado de borrador a los dos segundos de inactividad y recuperación local confirmada antes de reemplazar el documento abierto.

Verificaciones ejecutadas: `npm run typecheck`, `npm run build`, `npm test` y `npm run test:e2e` correctos. Las dependencias actuales siguen enlazadas a un destino temporal WSL: una instalación duradera debe usar el lockfile en un filesystem adecuado.

Estado de fases: fase 0 verificada en Chromium para los recorridos cubiertos; fases 1, 2, 3 y 4 parcialmente implementadas. Fases 5 a 7 pendientes. Restan páginas y elementos anidados, aislamiento completo de CSS, biblioteca/limpieza de medios, controles responsive por propiedad, formularios reales, PostgreSQL, dominios y PWA/tiendas. Las dos familias nuevas ya no son solo propuestas: están implementadas con tres plantillas cada una.

## 1. Etapa actual

El proyecto es un MVP local de constructor multisitio: supera una maqueta visual, pero todavía no es un constructor de diseño libre ni un servicio listo para operar con clientes en producción.

### Base implementada en código

- Next.js 15, React 19 y TypeScript, con módulos por funcionalidad.
- Registro, login, logout, contraseñas con scrypt y sesiones con token almacenado como hash.
- Sitios asociados a un propietario; las acciones de edición verifican pertenencia.
- Galería pública, previews y creación desde Forma, Brasa, Nexo, Alba, Vector o base simple.
- Editor con nueve tipos de sección, listas, colores, imágenes, reordenamiento, duplicación y eliminación.
- Deshacer/rehacer en memoria y aviso de cambios sin guardar.
- Preview en iframe con selección de secciones y tamaños escritorio/móvil.
- Borrador y publicación separados; publicación y despublicación en `/s/[slug]`.
- SQLite local. Payload/PostgreSQL corresponden a la demo anterior y no almacenan los sitios del constructor.

### Alcance de la verificación

Se revisaron arquitectura, rutas, autenticación, persistencia, catálogo, renderizador, estilos, editor, validación y configuración de despliegue. También se verificaron en Chromium los cinco templates en escritorio y móvil mediante recorridos automatizados y capturas.

Las dependencias fueron recuperadas en WSL y las comprobaciones actuales pasan. El `node_modules` enlazado a `/tmp` sigue siendo temporal para este entorno; una instalación duradera debe usar `npm ci` desde un filesystem con permisos normales.

## 2. Por qué las tres plantillas se sienten del mismo estilo

`features/templates/registry.ts` registra nueve plantillas en tres familias. `settings.template` selecciona la clase CSS y algunas ilustraciones, pero todas pasan por `SiteView` y un registro compartido de componentes de sección.

- Misma estructura general de cabecera, portada dividida, contenido por secciones y pie.
- Mismos seis bloques: portada, servicios, proyectos, nosotros, FAQ y contacto.
- Brasa cambia tipografía, formas y grilla; Nexo cambia colores, tarjetas e ilustración. Son diferencias reales, pero dentro de la misma familia compositiva.
- El menú gastronómico de Brasa reutiliza proyectos; no tiene modelo específico de carta, precios o categorías.
- El editor solo cambia contenido y colores: no expone variantes de composición, fuentes, espaciados, columnas o estilos por dispositivo.

**Conclusión:** agrupar las tres como una familia y desarrollar dos familias con estructuras propias.

## 3. Catálogo propuesto

Separar cuatro conceptos: **familia visual → plantilla inicial → variantes de bloques → personalización del cliente**. El rubro es una categoría independiente: restaurante, consultoría o portfolio no deben determinar por sí solos el estilo.

| Familia | Plantillas iniciales | Identidad estructural |
| --- | --- | --- |
| Editorial creativo, existente | Forma, Brasa, Nexo | Titulares grandes, composición texto/ilustración, bloques editoriales y acentos gráficos. |
| Inmersivo / fotográfico, nueva | Alba, Marea y Línea | Portada fotográfica de ancho completo, texto superpuesto, cabecera sobre la imagen, galerías y narrativa visual con menor densidad de tarjetas. |
| Modular / producto, nueva | Vector, Nimbus y Escala | Portada centrada, demostración de producto debajo, grilla modular, beneficios, comparativas, planes, testimonios y llamados a la acción compactos. |

Primer objetivo de catálogo: **tres familias y nueve plantillas**, conservando las tres existentes y sumando dos variantes adicionales por cada familia nueva. Ampliar rubros después de validar estas bases.

### Criterios para aceptar una familia nueva

- Debe distinguirse usando los mismos textos, imágenes y colores que otra familia.
- Debe cambiar composición de portada, navegación, ritmo de secciones, tratamiento de medios y pie; no solamente decoraciones.
- Debe tener composición móvil propia y usable.
- Debe admitir edición, guardado y publicación con el mismo motor.
- Las miniaturas y previews deben representar la plantilla real.

## 4. Límites concretos del editor actual

- `website/types.ts`: secciones con campos opcionales compartidos; no hay páginas, árbol de elementos ni versión del documento.
- `HeroSection`: botón a `#contact` y enlace a `#projects` fijos. Eliminar esas secciones puede dejar enlaces sin destino.
- `Header`: símbolo de marca y botón “Hablemos” fijos; no admite logo propio ni configuración completa de cabecera.
- `ContactSection`: contacto exclusivamente por `mailto:`. Las reservas y agendas anunciadas en ejemplos no tienen motor funcional.
- `SiteView`: pie fijo y anclas calculadas por tipo/posición; al reordenar secciones repetidas puede cambiar qué contenido recibe un enlace.
- Imágenes propias solo en proyectos; portada y nosotros conservan ilustraciones programadas.
- `image.ts`: transforma todo a JPEG sobre fondo opaco, lo que no sirve para preservar transparencia de futuros logos.
- Imágenes base64 dentro del JSON, límite de documento de 5 MB, hasta 30 secciones, 20 elementos por lista y 5 enlaces de menú.
- Historial de unos 20 cambios, clonado del documento en cada edición y pérdida del historial al recargar. Con imágenes incluidas, aumenta el consumo de memoria.
- No hay guardado automático, recuperación persistente de cambios ni control de conflictos entre pestañas.
- La base simple solo filtra Forma a portada y contacto; no es un lienzo independiente.
- Solo hay una página por sitio y SEO básico de título/descripción.
- No hay gestión completa para renombrar, duplicar o eliminar sitios ni cambiar su slug.
- CSS del sitio, plataforma y editor se importa desde el mismo layout; hay selectores globales que conviene aislar antes de ampliar familias.

## 5. Plan de implementación por dependencias

### Fase 0 — Recuperar una base verificable

1. Normalizar instalación y requisitos de Node; unificar la versión mínima del README con `package.json`.
2. Ejecutar `npm run typecheck` y `npm run build`.
3. Validar en navegador: registro → selección → creación → edición → guardar → publicar → despublicar.
4. Comprobar aislamiento usando dos cuentas y guardar referencias visuales de las tres plantillas.

**Cierre:** build reproducible y recorrido base comprobado, con incidencias registradas.

### Fase 1 — Modelo extensible y compatibilidad

1. Introducir `schemaVersion`, `familyId` y `templateId`; separar identidad de plantilla y apariencia.
2. Separar tema global, cabecera, pie, páginas, secciones y elementos. Preparar una página de inicio en la migración, aunque la UI multipágina llegue después.
3. Usar contratos por tipo de bloque y un registro común de defaults, variantes, renderizado, inspector y validación.
4. Definir identificadores persistentes para páginas, secciones, elementos y destinos internos.
5. Modelar acciones de botón: sección, página, URL, email, teléfono y WhatsApp.
6. Versionar documentos y migrar `studio`, `restaurant` y `consultant` a la familia existente, manteniendo su aspecto y URLs.
7. Migrar borrador y publicado sin publicar cambios del usuario; respaldar y comprobar equivalencia de contenido.
8. Aislar CSS y definir variables de diseño para tipografía, ancho, espaciado, bordes y botones.

**Cierre:** los sitios anteriores se leen correctamente y agregar una variante no exige multiplicar condicionales por plantilla.

### Fase 2 — Personalización real y medios

1. Biblioteca de archivos externa al documento: carga, permisos por propietario, selección, reemplazo, optimización y borrado de recursos sin uso con referencias controladas.
2. Logo, favicon, imágenes de portada/nosotros, fondos, recorte, punto focal, alt y transparencia.
3. Tema global: tipografías de títulos y cuerpo, escalas, colores, ancho máximo y estilos de botones.
4. Controles por sección: variante, fondo, ancho, altura, columnas, alineación, padding, gap, borde y radio.
5. Controles por elemento: contenido, estilo, visibilidad, enlace, imagen e icono.
6. Cabecera y pie configurables; enlaces internos elegidos desde las secciones/páginas existentes.
7. Responsive: escritorio, tablet y móvil, con herencia y ajustes específicos de orden, tamaño y visibilidad.

**Cierre:** el cliente puede cambiar una composición completa, sus imágenes y todos sus botones sin tocar código.

### Fase 3 — Biblioteca de elementos y bloques

Implementar dos niveles complementarios:

- **Secciones listas:** modelos bien diseñados para comenzar rápido.
- **Composición avanzada:** contenedor, columnas/grilla y elementos editables, con anidamiento controlado y comportamiento responsive.

Prioridad inicial:

1. Título, texto enriquecido, imagen, botón, icono, separador y contenedor.
2. Variantes de portada: dividida, centrada y con imagen de fondo.
3. Texto + imagen, galería, tarjetas, testimonios, logos y CTA independiente.
4. Equipo, estadísticas independientes, planes/precios y comparativa.
5. Carta gastronómica con categorías/precios, horarios, ubicación y redes.
6. Formulario y video/integraciones configuradas.

Cada bloque debe incluir esquema, defaults, validación, inspector, renderizado, comportamiento móvil y verificación de publicación. No basta con agregar su botón a la biblioteca.

**Cierre:** se puede construir una página diferente desde una base vacía y mezclar bloques sin conservar obligatoriamente la estructura de Forma.

### Fase 4 — Dos familias nuevas y catálogo agrupado

1. Diseñar y revisar comparativas de las tres familias en escritorio y móvil.
2. Implementar layouts específicos usando las capacidades de las fases anteriores.
3. Crear una plantilla completa por familia nueva, con contenido e imágenes apropiados.
4. Agrupar Forma, Brasa y Nexo en la familia existente dentro de galería y alta de sitio.
5. Agregar filtros independientes por familia y rubro; conservar la selección al registrarse.
6. Diferenciar aplicar apariencia de reemplazar contenido; ofrecer preview reversible al cambiar de familia.

**Cierre:** nueve plantillas en tres familias, reconocibles aun igualando paleta y contenido, editables y publicables.

### Fase 5 — Editor y webs de uso real

1. Navegador de capas/elementos, selección directa y arrastre con soporte teclado/táctil.
2. Autoguardado de borrador, recuperación tras recarga, estados de sincronización y manejo de sesión vencida.
3. Agrupar cambios de escritura para un historial útil; revisiones persistidas y restauración de publicaciones.
4. Control de concurrencia para evitar que una pestaña sobrescriba silenciosamente otra.
5. Gestión multipágina: slugs, navegación, página de inicio, 404, páginas legales y SEO por página.
6. Renombrar, duplicar y eliminar sitios; editar dirección con reglas de unicidad y redirecciones.
7. Formularios reales: validación servidor, mensajes guardados, notificación por email y control antiabuso.
8. WhatsApp, teléfono, mapa y agenda externa configurables. Un sistema nativo de reservas requiere alcance propio.
9. SEO ampliado: Open Graph, canonical, sitemap, robots, favicon e indexación de publicación frente a preview.

**Cierre:** el cliente puede gestionar una web completa y recibir contactos, conservando cambios y publicaciones anteriores.

### Fase 6 — Plataforma operable en producción

1. Incorporar persistencia de producción con migraciones; PostgreSQL es la dirección ya prevista. Migrar usuarios, sesiones y sitios, no solo el CMS.
2. Optimizar repositorios: el dashboard actual consulta documentos completos, incluidas publicaciones e imágenes, en lugar de resúmenes.
3. Recuperación de contraseña, verificación de email, ajustes de cuenta, limitación de intentos y gestión de sesiones.
4. Subdominio por sitio, dominio propio, verificación de titularidad DNS, resolución por host y certificados HTTPS.
5. Separar correctamente cookies y rutas de la plataforma frente a dominios de clientes; activar cookies seguras en producción.
6. Adaptar despliegue cuando se retome esa etapa: el Compose actual es de la demo, no monta los datos SQLite del constructor ni configura sus cookies seguras; Caddy solo contempla un dominio.
7. Definir el papel futuro de Payload: retirarlo si queda obsoleto o darle una responsabilidad concreta con permisos adecuados.
8. Backups de base y medios con restauración probada; monitoreo, logs, alertas y procedimientos de actualización.
9. Pruebas automáticas de permisos, migraciones, guardado/publicación, formularios y dominios; pruebas de navegador y regresión visual por familia.
10. Revisar accesibilidad, tiempos de carga, imágenes y consultas con sitios representativos.

**Cierre:** una cuenta real puede crear, editar y publicar en su dominio con persistencia, contacto y recuperación comprobados.

### Fase 7 — PWA y publicación en Google Play / App Store

Objetivo añadido: distribuir la plataforma de creación y administración de webs como aplicación móvil, reutilizando la base web y el mismo backend. Se asume que la aplicación a publicar es el constructor; convertir cada sitio de cliente en una app sería otro alcance. El usuario ya tiene pagada la cuenta de Google Play. La disponibilidad de cuenta Apple Developer queda por confirmar.

**Camino recomendado:** web responsive → PWA → Google Play → App Store si la experiencia y la revisión lo permiten.

1. Completar la PWA: manifest, iconos, identidad propia, instalación, modo standalone y service worker con estrategia explícita de actualizaciones y caché.
2. Dar una experiencia útil ante pérdida de conexión: estado de conexión visible, recuperación de borradores y reintentos sin sobrescribir cambios más recientes. Publicar y sincronizar requieren conexión; instalar la PWA no convierte automáticamente el editor en offline.
3. Android: empaquetar la web mediante Trusted Web Activity (TWA), por ejemplo con Bubblewrap, verificar el dominio mediante Digital Asset Links y generar el Android App Bundle firmado. Probar navegación, sesiones, archivos y enlaces externos en dispositivos reales.
4. Publicar primero en canales de prueba de Google Play y cumplir los requisitos de acceso a producción que correspondan a la cuenta; tener la cuenta pagada no sustituye la revisión de la app.
5. iOS: ofrecer instalación de la PWA desde Safari y, para aparecer en App Store, evaluar una aplicación híbrida con Capacitor que reutilice componentes y lógica del editor. Una PWA por sí sola no se envía directamente a App Store.
6. Hacer una prueba técnica de iOS antes del empaquetado definitivo: sesión, carga de imágenes, recuperación al volver del segundo plano y navegación. Si se empaqueta el frontend localmente, consumir el backend mediante API; no intentar incluir el servidor Next.js dentro de la app.
7. Diseñar una experiencia móvil completa de edición y administración. Integraciones útiles posibles: fotos/cámara para medios, compartir el sitio y notificaciones de consultas. Capacitor o agregar una función nativa no garantizan aprobación: Apple evalúa la utilidad y experiencia, y su regla 4.2 exige superar un simple sitio reempaquetado.
8. Preparar cuenta Apple Developer, firma y compilación con macOS/Xcode o un servicio de build compatible; probar con TestFlight antes de enviar a revisión.
9. Completar fichas de tienda, capturas, soporte, privacidad, declaración de datos y eliminación de cuenta/datos. Si se incorporan planes digitales pagos, definir facturación y derechos de acceso conforme a las reglas vigentes de cada tienda y región antes de implementar el checkout móvil.

**Cierre:** PWA instalable y probada, aplicación Android publicada en Google Play y versión iOS enviada y, si obtiene aprobación, publicada en App Store. Registrar por separado el estado de cada canal.

#### Decisiones de arquitectura que deben adelantarse

- **Desde fase 1:** mantener esquema, validación y lógica de negocio separados de UI y transporte. Las Server Actions pueden seguir sirviendo a la web; extraer servicios reutilizables para que una futura API móvil use las mismas reglas y permisos.
- **Desde fase 2:** diseñar el editor para interacción táctil real, teclado virtual, áreas seguras de pantalla, selección de archivos y controles sin dependencia de hover o arrastre con mouse. La vista previa móvil no equivale a que el editor sea cómodo en un teléfono.
- **Desde fase 5:** modelar revisiones y conflictos para recuperación de borradores al suspender/cerrar la app. No depender únicamente de `beforeunload`, que no es fiable en móviles.
- **Desde fase 6:** usar un origen estable para la plataforma y separar los dominios publicados de clientes. Limitar el alcance del service worker a la plataforma; no cachear indiscriminadamente respuestas autenticadas ni mezclar datos de cuentas al cerrar sesión.
- **Antes de la app híbrida:** definir sesión/autenticación para su origen, expiración, cierre de sesión y enlaces de recuperación. No asumir que las cookies y Server Actions actuales funcionarán sin cambios desde un frontend empaquetado.
- **Mantener una base compartida:** backend, documentos, renderizador, componentes y lógica reutilizables; reservar adaptadores para cámara, compartir y notificaciones según plataforma. Elegir TWA o Capacitor en Android según las necesidades nativas que confirme la prueba móvil.

Referencias oficiales: [Trusted Web Activity](https://developer.chrome.com/docs/android/trusted-web-activity/overview) y [App Store Review Guidelines, apartado 4.2](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality). Revisar requisitos vigentes al preparar cada lanzamiento.

## 6. Qué significa “100% custom” y “100% funcional”

Para esta propuesta, personalización completa significa poder controlar páginas, composición, contenido, medios, tipografía, colores, responsive, cabecera, pie y acciones usando elementos combinables. Agregar únicamente más secciones cerradas no alcanza.

Un lienzo de posicionamiento libre a nivel píxel, edición de código arbitrario o colaboración simultánea son ampliaciones diferentes del editor y requieren definir alcance adicional. La base recomendada es composición flexible con contenedores y grillas.

Para la primera versión funcional, el alcance recomendado son webs de presentación, portfolios, servicios y gastronomía con contacto e integraciones. E-commerce, pagos, reservas nativas, blog con flujo editorial, membresías y facturación SaaS son módulos posteriores si forman parte del negocio; no están implementados actualmente.

## 7. Orden recomendado y primer entregable

**Base verificable → modelo versionado → medios y controles → bloques/elementos → nuevas familias → flujos completos → operación en producción → PWA y tiendas móviles.**

El diseño visual de las nuevas familias puede comenzar durante la definición del modelo. Su implementación final debe apoyarse en los nuevos controles para evitar dos demos adicionales que el cliente no pueda personalizar.

Primer entregable recomendado: sitios existentes compatibles, catálogo preparado para familias, portada con tres composiciones, logo/imagen propia, destinos de botones editables y controles de tipografía/espaciado. Es la primera prueba concreta de que el constructor dejó de limitarse a cambiar textos y colores.
