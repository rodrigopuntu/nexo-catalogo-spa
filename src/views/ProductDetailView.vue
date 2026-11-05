<template>
  <div class="container page-space">
    <router-link class="back-link" to="/productos">← Volver al catálogo</router-link>
    <section v-if="product" class="detail-layout">
      <ProductArtwork :product="product" />
      <div class="detail-copy">
        <p class="eyebrow accent">{{ product.category }}</p>
        <h1>{{ product.name }}</h1>
        <p class="detail-price">{{ formatPrice(product.price) }}</p>
        <p class="intro">{{ product.description }}</p>
        <div class="notice"><strong>Producto de demostración</strong><p>Los datos y precios son ilustrativos. El carrito se incorporará en una próxima etapa.</p></div>
        <router-link class="button" to="/productos">Seguir explorando <span aria-hidden="true">→</span></router-link>
      </div>
    </section>
    <EmptyState v-else title="Producto no encontrado" message="Este producto no forma parte del catálogo de muestra.">
      <router-link class="button" to="/productos">Ver catálogo</router-link>
    </EmptyState>
  </div>
</template>

<script>
import { products, formatPrice } from '../data/products'
import ProductArtwork from '../components/ProductArtwork.vue'
import EmptyState from '../components/EmptyState.vue'

export default {
  name: 'ProductDetailView',
  components: { ProductArtwork, EmptyState },
  computed: {
    product() { return products.find(product => String(product.id) === this.$route.params.id) }
  },
  methods: { formatPrice }
}
</script>
