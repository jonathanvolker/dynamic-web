# Auditoría de CTAs y acciones

Auditoría del renderizado actual, basada en inspección del código y los recorridos E2E existentes. Los destinos internos se resuelven contra las anclas existentes; si una sección fue eliminada, el enlace no se renderiza. Los destinos externos aceptados son `https://`, `mailto:`, `tel:` y anclas internas.

| Componente | Acción | Qué hace | Estado |
| --- | --- | --- | --- |
| Header | Logo | Vuelve al inicio de la página (`#main`). | Funcional |
| Header | Menú | Abre y cierra la navegación móvil. | Funcional |
| Header | Navegación | Desplaza a una sección existente; se oculta si el ancla ya no existe. | Corregido y funcional |
| Header | Botón principal | Abre sección, URL HTTPS, email o teléfono configurado. | Funcional |
| Footer | Logo | Vuelve al inicio de la página. | Funcional |
| Footer | Navegación | Repite los destinos válidos del menú. | Corregido y funcional |
| Footer | Email | Abre el cliente de correo. | Funcional |
| Hero | CTA principal | Abre el destino configurable de portada. | Funcional |
| Hero | Descubrir | Desplaza a proyectos, servicios o galería según la familia. | Funcional si la sección existe |
| Contacto | CTA y flecha | Abren el destino configurable, normalmente email o formulario. | Funcional |
| CTA destacado | Acciones | Abren cada destino configurado. | Corregido y funcional |
| Planes | Botón de plan | Abre el destino de cada plan. | Funcional |
| Comparativa | Botón de plan | Abre el destino de cada plan. | Corregido y funcional |
| Logos | Logo enlazado | Abre el perfil o URL configurada; un logo sin destino queda informativo. | Corregido y funcional |
| Equipo | Ver perfil | Abre el perfil configurado. | Corregido y funcional |
| Horarios | Teléfono | Abre el marcador del dispositivo. | Funcional |
| Horarios | Cómo llegar | Abre el mapa HTTPS configurado. | Corregido y funcional |
| Formulario | Enviar | Valida y persiste una consulta; muestra éxito, error o rate limit. | Funcional |
| Newsletter | Suscribirme | Valida consentimiento/email y persiste una suscripción; muestra estado. | Funcional |
| Proyectos | Tarjeta | Abre un modal con detalle del proyecto. | Funcional |
| Proyectos | Cerrar/volver | Cierra el modal. | Funcional |
| Editor | Guardar | Persiste el borrador del sitio propietario. | Funcional |
| Editor | Publicar | Copia el borrador a la publicación pública. | Funcional |
| Editor | Ver sitio | Abre la publicación en otra pestaña. | Funcional |
| Dashboard | Ver web | Abre el sitio publicado. | Funcional |
| Dashboard | Retirar publicación | Despublica el sitio mediante Server Action. | Funcional |
| Dashboard | Eliminar sitio | Confirma y elimina el sitio propietario. | Funcional |
| Dashboard | Leads | Abre la bandeja de contactos y marca notificaciones como leídas. | Nuevo y funcional |

## Acciones que no son CTAs

- Selector de secciones, agregar, duplicar, eliminar y reordenar modifican el documento del editor.
- Deshacer y rehacer modifican el historial en memoria.
- Vista escritorio/móvil cambia únicamente el viewport del preview.
- Selector de familia y plantilla cambia la selección del alta, no publica ni reemplaza un sitio existente.
- Video renderiza un embed de YouTube o Vimeo; no es un enlace editable.
- Servicios, galería, testimonios, estadísticas, proceso, menú y preguntas muestran contenido sin acción interactiva propia.

## Criterio de verificación

- Todo `href` dinámico pasa por `resolveHref` antes de renderizarse.
- Toda ancla interna renderizada tiene una sección destino.
- Los formularios no quedan bloqueados si falla la red.
- Cada lead válido genera una notificación interna para el propietario.
- Los envíos públicos tienen límite persistente por sitio, tipo, IP y ventana de 15 minutos.

## Plataforma y editor

| Componente | Acción | Qué hace | Estado |
| --- | --- | --- | --- |
| Landing | Crear web / Ver plantillas | Lleva al alta o al catálogo público. | Funcional |
| Landing | Iniciar sesión | Lleva al login. | Funcional |
| Catálogo | Ver plantilla | Abre el preview completo. | Funcional |
| Catálogo | Usar esta base | Conserva la plantilla en el registro/alta. | Funcional |
| Preview | Todas las plantillas | Vuelve al catálogo. | Funcional |
| Preview | Usar plantilla | Lleva al registro con `template` seleccionado. | Funcional |
| Registro/login | Enviar formulario | Crea sesión o autentica y redirige al dashboard. | Funcional |
| Registro/login | Cambiar formulario | Cambia entre registro y login conservando plantilla. | Funcional |
| Dashboard | Crear sitio | Abre el alta de sitio. | Funcional |
| Dashboard | Cerrar sesión | Elimina la sesión y vuelve al acceso. | Funcional |
| Alta | Familia visual | Cambia las plantillas disponibles. | Funcional |
| Alta | Vista completa | Abre el preview de la plantilla en otra pestaña. | Funcional |
| Alta | Empezar a diseñar | Crea el sitio y abre el editor. | Funcional |
| Editor | Secciones / Preview / Propiedades | Cambia el panel visible en móvil. | Funcional |
| Editor | Agregar sección | Inserta un bloque del catálogo. | Funcional |
| Editor | Seleccionar sección | Abre sus propiedades. | Funcional |
| Editor | Subir / bajar | Reordena secciones. | Funcional |
| Editor | Duplicar / eliminar | Clona o quita la sección seleccionada con confirmación al eliminar. | Funcional |
| Editor | Agregar/quitar elemento | Modifica las listas editables de cada bloque. | Funcional |
| Editor | Deshacer/rehacer | Cambia el historial local de edición. | Funcional |
| Editor | Escritorio/móvil | Cambia el viewport de preview. | Funcional |
| Editor | Guardar/publicar | Persiste borrador o actualiza publicación. | Funcional |
| Editor | Ver sitio | Abre la publicación vigente. | Funcional |
| Editor | Volver a sitios | Regresa al dashboard y advierte cambios pendientes. | Funcional |
