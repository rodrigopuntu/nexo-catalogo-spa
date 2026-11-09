<template>
  <section class="container page-space" aria-labelledby="cart-title">
    <p class="eyebrow accent">TU SELECCIÓN</p>
    <h1 id="cart-title">Carrito</h1>
    <p class="intro">Revisá tu selección y ajustá las cantidades.</p>

    <p v-if="!cart.persistent" class="notice" role="status">El navegador no pudo guardar el carrito. Tu selección se conserva mientras esta página siga abierta.</p>
    <EmptyState v-if="!cart.items.length" title="Tu carrito está vacío" message="Explorá el catálogo y agregá tus favoritos.">
      <router-link class="button" to="/productos">Ver catálogo</router-link>
    </EmptyState>
    <p v-else-if="catalog.loading" class="notice" role="status">Cargando los productos del carrito…</p>
    <template v-else>
      <p v-if="catalog.source !== 'supabase'" class="notice" role="status">Estás viendo precios de muestra. Los productos que no figuran en esta copia quedan fuera del total.</p>
      <div class="cart-layout">
        <ul class="cart-items" aria-label="Productos en el carrito">
          <li v-for="line in lines" :key="line.id" class="cart-line">
            <div class="cart-line-product">
              <ProductArtwork v-if="line.product" :product="line.product" />
              <div>
                <router-link v-if="line.product" :to="{ name: 'product-detail', params: { id: line.id } }">{{ line.name }}</router-link>
                <strong v-else>{{ line.name }}</strong>
                <p>{{ line.product ? formatPrice(line.product.price) + ' por unidad' : 'No disponible en el catálogo actual' }}</p>
              </div>
            </div>
            <div class="cart-line-actions">
              <div class="cart-quantity" role="group" :aria-label="'Cantidad de ' + line.name">
                <button type="button" :aria-label="'Restar una unidad de ' + line.name" :disabled="line.quantity === 1" @click="changeCartQuantity(line.id, -1)">−</button>
                <span aria-live="polite">{{ line.quantity }}</span>
                <button type="button" :aria-label="'Sumar una unidad de ' + line.name" :disabled="!line.product || line.quantity >= maxCartQuantity" @click="changeCartQuantity(line.id, 1)">+</button>
              </div>
              <button class="cart-remove" type="button" :aria-label="'Quitar ' + line.name + ' del carrito'" @click="removeFromCart(line.id)">Quitar</button>
            </div>
            <strong class="cart-subtotal">{{ line.product ? formatPrice(line.subtotal) : '—' }}</strong>
          </li>
        </ul>
        <aside class="about-panel cart-summary" aria-labelledby="cart-summary-title">
          <h2 id="cart-summary-title">Resumen</h2>
          <p>{{ cart.count }} {{ cart.count === 1 ? 'unidad' : 'unidades' }} en el carrito</p>
          <p class="cart-total" role="status"><span>Total estimado</span><strong>{{ formatPrice(total) }}</strong></p>
          <p v-if="unavailable">{{ unavailable === 1 ? 'Un producto no está disponible' : unavailable + ' productos no están disponibles' }} y queda{{ unavailable === 1 ? '' : 'n' }} fuera del total.</p>
          <router-link class="button button-light" to="/productos">Seguir explorando</router-link>
        </aside>
      </div>
    </template>
  </section>
</template>

<script>
import EmptyState from '../components/EmptyState.vue'
import ProductArtwork from '../components/ProductArtwork.vue'
import { formatPrice } from '../data/products'
import { cart, changeCartQuantity, maxCartQuantity, removeFromCart } from '../services/cart'
import { catalog, loadCatalog } from '../services/catalog'

export default {
  name: 'CartView',
  components: { EmptyState, ProductArtwork },
  data() { return { cart, catalog, maxCartQuantity } },
  computed: {
    lines() {
      const products = new Map(this.catalog.products.map(product => [product.id, product]))
      return this.cart.items.map(item => {
        const product = products.get(item.id)
        return { ...item, product, name: product?.name ?? 'Producto #' + item.id, subtotal: (product?.price ?? 0) * item.quantity }
      })
    },
    total() { return this.lines.reduce((sum, line) => sum + line.subtotal, 0) },
    unavailable() { return this.lines.filter(line => !line.product).length }
  },
  mounted() { loadCatalog() },
  methods: { changeCartQuantity, removeFromCart, formatPrice }
}
</script>
