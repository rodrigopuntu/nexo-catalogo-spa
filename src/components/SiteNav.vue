<template>
  <header class="site-header">
    <div class="container nav-inner">
      <router-link class="brand" to="/" aria-label="Nexo, inicio"><span class="brand-mark" aria-hidden="true">N</span> nexo<span class="brand-dot">.</span></router-link>
      <nav aria-label="Navegación principal">
        <router-link to="/" exact-active-class="is-active">Inicio</router-link>
        <router-link to="/productos" :class="{ 'is-active': $route.name === 'product-detail' }" active-class="is-active">Catálogo</router-link>
        <router-link to="/cuenta" active-class="is-active">Mi cuenta</router-link>
      </nav>
      <div class="nav-actions">
        <button class="theme-toggle" type="button" aria-label="Modo noche" :aria-pressed="theme.dark" :title="theme.dark ? 'Usar tema claro' : 'Usar modo noche'" @click="toggleTheme">
          <svg v-if="theme.dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M20.9 13.3A9 9 0 0 1 10.7 3.1a9 9 0 1 0 10.2 10.2Z"/></svg>
        </button>
        <router-link class="cart-nav-link" :to="{ name: 'cart' }" :aria-label="'Carrito, ' + cart.count + (cart.count === 1 ? ' unidad' : ' unidades')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>
          <span class="cart-label">Carrito</span><span class="cart-count" aria-hidden="true">{{ cart.count }}</span>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
import { cart } from '../services/cart'
import { theme, toggleTheme } from '../services/theme'

export default {
  name: 'SiteNav',
  data() { return { cart, theme } },
  methods: { toggleTheme }
}
</script>
