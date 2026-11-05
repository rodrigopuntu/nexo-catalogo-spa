# Nexo — Versión para mostrar al profesor

SPA de catálogo de productos, creada con Vue 3, Vue CLI 5 y Vue Router 4.
Integrantes: pendiente de completar.

## Funcionalidades disponibles
- Inicio, listado de 15 productos de demostración, detalle y Acerca de.
- Búsqueda por texto sin distinción de tildes o mayúsculas.
- Filtro por categoría y orden por nombre o precio.
- Seis componentes reutilizables, props, emits y propiedades computadas.
- Diseño adaptable a celular, tablet y escritorio.
- Sección API externa (/api): Fetch real a DummyJSON, carga, resultados,
  error HTTP, tiempo máximo de 12 segundos, validación de respuesta y reintento.
- Hooks created(), mounted() y beforeUnmount() en la consulta externa.
- Transition para los estados y TransitionGroup para los resultados.
- Páginas para productos y rutas inexistentes.

Los precios del catálogo local son ficticios y se muestran en ARS.
Los precios de DummyJSON se muestran en USD sin conversión.
Las ilustraciones locales son emojis; pueden verse diferentes según el sistema.
No se realizan compras.

## Ejecutar
Entorno de creación: Node 20.16.0 y npm 10.8.1.
En una terminal dentro de la carpeta del proyecto:

    npm ci
    npm run serve

Abrir la dirección Local que indique la terminal. Detener con Ctrl+C.
No instalar Vue CLI globalmente y no sustituir por Vite.

## Verificar y generar versión publicable
    npm run lint -- --no-fix
    npm run build

La carpeta dist se genera con build. No editar los archivos generados.
La etapa 1 pasó lint y build en la terminal del usuario.
La etapa 2 se verificó en navegador: navegación, búsqueda, filtros, detalle,
estados vacíos y vista móvil de 390 px, sin errores de consola.
El cliente de API pasó cinco pruebas: resultado correcto, HTTP 503, formato
inválido, lista vacía y cancelación. La validación final de esta versión
se registra en VERIFICACION.md.

La instalación inicial informó 15 alertas de dependencias de Vue CLI.
No se aplicaron actualizaciones forzadas que cambien el scaffold.

## Publicar en Vercel
Importar el repositorio desde GitHub.
- Framework: Vue.js (Vue CLI), nunca Vite.
- Instalación: npm ci.
- Compilación: npm run build.
- Carpeta de salida: dist.
- Raíz: carpeta que contiene este package.json.
- Variables de entorno: ninguna para esta demostración.

vercel.json incluye la reescritura a index.html para las rutas de Vue Router.
Comprobar /productos/1 y /api también al abrirlos directamente y actualizar.

## Estructura y defensa oral
- src/main.js: monta Vue e instala el router.
- src/App.vue: navegación, contenido activo y pie comunes.
- src/router/index.js: rutas, título y desplazamiento.
- src/views/: pantallas de la aplicación.
- src/components/: SiteNav, SiteFooter, ProductArtwork, ProductCard,
  CatalogFilters y EmptyState.
- src/data/products.js: los 15 productos locales y formato de precios.
- src/services/productApi.js: Fetch y validación de la respuesta externa.
- src/styles/main.css: estilos, tamaños adaptables y animaciones.
- public/index.html: HTML donde Vue monta la SPA.

CatalogView guarda búsqueda, categoría y orden en data().
Pasa los valores como props a CatalogFilters, que emite los cambios.
Las computed filtran y ordenan sin modificar el catálogo original.
ProductCard recibe un producto y enlaza al detalle por identificador.
ExternalApiView consulta en mounted(), prepara el formato en created() y
cancela la petición al salir. Un error externo no impide ver el catálogo local.
Los filtros se restablecen al volver al listado; no se guardan.

## Alcance pendiente
Esta es una demostración de avance, no el examen completo.
Faltan CRUD, Alta/Edición, validaciones de formulario, Supabase y carrito
persistido en LocalStorage. También completar integrantes y video de entrega.
El catálogo actual se importa desde un archivo local y no se guarda en una base.

Google Cloud NO está integrado. Hace falta conocer:
1. Servicio y API exactos.
2. Ejemplo de petición y respuesta.
3. Método de autenticación.
4. Restricciones de dominio/origen y permisos de la clave.
5. Si requiere backend para custodiar credenciales.
No pegar credenciales privadas en el navegador, código o repositorio.
Las variables VUE_APP_* se incluyen en el JavaScript público; no son una bóveda.

## Referencias
- API: https://dummyjson.com/docs/products
- Vue CLI: https://cli.vuejs.org/guide/
- Router en Vercel: https://router.vuejs.org/guide/essentials/history-mode
