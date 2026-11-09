<template>
  <div class="container page-space">
    <router-link class="back-link" :to="{ name: 'catalog', query: $route.query }">← Volver al catálogo</router-link>
    <p v-if="catalog.loading" class="notice" role="status">Cargando producto…</p>
    <p v-if="catalog.source === 'fallback'" class="notice" role="status">No pudimos cargar Supabase. Estás viendo los datos de muestra.</p>
    <section v-if="product && !catalog.loading" class="detail-layout">
      <ProductArtwork :product="product" />
      <div class="detail-copy">
        <p class="eyebrow accent">{{ product.category }}</p>
        <h1>{{ product.name }}</h1>
        <p class="detail-price">{{ formatPrice(product.price) }}</p>
        <p class="intro">{{ product.description }}</p>
        <div class="detail-cart-actions">
          <AddToCartButton :product-id="product.id" :name="product.name" />
          <router-link class="button button-light" to="/carrito">Ver carrito</router-link>
        </div>
      </div>
    </section>
    <EmptyState v-else-if="!catalog.loading" title="Producto no encontrado" message="Este producto no está disponible en el catálogo actual.">
      <router-link class="button" :to="{ name: 'catalog', query: $route.query }">Ver catálogo</router-link>
    </EmptyState>
  </div>
</template>

<script>
import { formatPrice } from '../data/products'
import { catalog, loadCatalog } from '../services/catalog'
import ProductArtwork from '../components/ProductArtwork.vue'
import EmptyState from '../components/EmptyState.vue'
import AddToCartButton from '../components/AddToCartButton.vue'

export default {
  name: 'ProductDetailView',
  components: { AddToCartButton, ProductArtwork, EmptyState },
  data() { return { catalog } },
  computed: {
    product() { return this.catalog.products.find(product => String(product.id) === this.$route.params.id) }
  },
  mounted() { loadCatalog() },
  methods: { formatPrice }
}
</script>
