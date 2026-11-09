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
- Variables de entorno: las dos variables públicas de Supabase en `.env.example`.

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
- src/services/catalog.js: lectura compartida del catálogo y respaldo de muestra.
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
Falta el carrito persistido en LocalStorage.
También completar integrantes y video de entrega.

## Catálogo de Supabase

En SQL Editor del proyecto de Nexo, ejecutar el archivo
`supabase/migrations/20261109000000_create_products.sql` una sola vez.
Crea `public.products` y carga los 15 productos con sus IDs originales.
El resultado esperado es `productos_cargados = 15`. Los visitantes y las
cuentas con sesión pueden leer el catálogo, con permisos de solo lectura.

En el navegador, abrir Catálogo y comprobar que diga **Datos de Supabase**.
Probar una búsqueda, un filtro, una ficha directa en `/productos/1` y su
recarga. Si la consulta falla, se identifican los datos de muestra y se
ofrece reintentar. La versión portátil usa el respaldo local.

## Administración del catálogo

Ejecutar una vez `supabase/migrations/20261109081622_add_product_admins.sql`
en SQL Editor, después de crear el catálogo. Para habilitar una cuenta que ya
inició sesión, copiar su UID desde **Authentication → Users** y ejecutar:

```sql
insert into public.product_admins (user_id)
values ('REEMPLAZAR-POR-EL-UID')
on conflict (user_id) do nothing;
```

En Nexo, entrar a **Mi cuenta → Administrar productos**. Elegir crear un
producto o seleccionar uno existente. Comprobar que el formulario rechace
campos inválidos y que los cambios guardados aparezcan al volver al catálogo.
Ejecutar también `supabase/migrations/20261109083537_allow_product_deletion.sql`
para habilitar la eliminación. Seleccionar un producto y pulsar **Eliminar
producto** para ver su nombre antes de confirmar. Para la prueba, crear un
producto temporal, cancelar una vez y luego confirmar su eliminación.
Las reglas de Supabase limitan la escritura a las cuentas autorizadas. Los
visitantes conservan el acceso de lectura al catálogo.

## Inicio de sesión con Google

Mi cuenta (`/cuenta`) usa Supabase Auth con OAuth y PKCE. El catálogo sigue
disponible para visitantes. Para probar el inicio de sesión:

1. Copiar `.env.example` a `.env.local` y completar la clave pública de Supabase.
2. En Supabase, abrir **Authentication → Sign In / Providers → Google** y
   configurar el ID del cliente OAuth web y el secreto vigente de Google.
3. En el cliente OAuth de Google Cloud, agregar como URI de redirección
   autorizada `https://ubxelincfpaqluvqantq.supabase.co/auth/v1/callback`.
4. En Supabase, configurar **Authentication → URL Configuration**. Usar
   `https://nexo-catalogo-spa-rosy.vercel.app` como Site URL y permitir
   `https://nexo-catalogo-spa-rosy.vercel.app/cuenta` y
   `http://localhost:8080/cuenta` como Redirect URLs. Si el servidor local
   usa otro puerto, autorizar la URL de retorno con ese puerto.
5. Ejecutar `npm run serve`, abrir Mi cuenta e iniciar sesión. Comprobar que
   aparece el correo, recargar la página y probar Cerrar sesión.

Para publicar, configurar las dos variables públicas de `.env.example` en
Vercel y volver a compilar. El secreto de Google se guarda en el proveedor
Google de Supabase. Las variables `VUE_APP_*` son visibles en el navegador.

Estado de la prueba: el usuario confirmó el inicio de sesión local y la
versión pública sirve la ruta `/cuenta` con la configuración de Supabase.

## Referencias
- API: https://dummyjson.com/docs/products
- Vue CLI: https://cli.vuejs.org/guide/
- Router en Vercel: https://router.vuejs.org/guide/essentials/history-mode
