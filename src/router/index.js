import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CatalogView from '../views/CatalogView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import AboutView from '../views/AboutView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import ExternalApiView from '../views/ExternalApiView.vue'
import AccountView from '../views/AccountView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Inicio' } },
  { path: '/productos', name: 'catalog', component: CatalogView, meta: { title: 'Catálogo' } },
  { path: '/productos/:id', name: 'product-detail', component: ProductDetailView, meta: { title: 'Detalle del producto' } },
  { path: '/acerca-de', name: 'about', component: AboutView, meta: { title: 'Acerca de' } },
  { path: '/api', name: 'external-api', component: ExternalApiView, meta: { title: 'API externa' } },
  { path: '/cuenta', name: 'account', component: AccountView, meta: { title: 'Mi cuenta' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView, meta: { title: 'Página no encontrada' } }
]

const router = createRouter({
  // La copia portátil se abre como archivo; el sitio publicado usa rutas normales.
  history: window.location.protocol === 'file:'
    ? createWebHashHistory()
    : createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() { return { top: 0 } }
})

router.afterEach(to => {
  document.title = to.meta.title + ' | Nexo'
})

export default router
