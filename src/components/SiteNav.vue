<template>
  <header class="site-header">
    <div class="container nav-inner">
      <router-link class="brand" to="/" aria-label="Nexo, inicio"><span class="brand-mark">n.</span> nexo<span class="brand-dot">.</span></router-link>
      <nav aria-label="Navegación principal">
        <router-link to="/" exact-active-class="is-active">Inicio</router-link>
        <router-link to="/productos" active-class="is-active">Catálogo</router-link>
        <router-link to="/api" active-class="is-active">API externa</router-link>
        <router-link to="/acerca-de" active-class="is-active">Acerca de</router-link>
        <router-link to="/cuenta" active-class="is-active">Mi cuenta</router-link>
      </nav>
      <router-link class="cart-nav-link" :to="{ name: 'cart' }" :aria-label="'Carrito, ' + cart.count + (cart.count === 1 ? ' unidad' : ' unidades')">
        Carrito <span aria-hidden="true">{{ cart.count }}</span>
      </router-link>
    </div>
  </header>
</template>

<script>
import { cart } from '../services/cart'

export default {
  name: 'SiteNav',
  data() { return { cart } }
}
</script>
