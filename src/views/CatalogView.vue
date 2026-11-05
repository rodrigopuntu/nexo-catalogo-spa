<template>
  <div class="container page-space">
    <p class="eyebrow accent">EXPLORÁ LA COLECCIÓN</p>
    <h1>Encontrá tu próximo favorito.</h1>
    <p class="intro">Audio, escritorio y accesorios. Pequeños objetos para grandes rutinas.</p>
    <CatalogFilters v-model:search="search" v-model:category="category" v-model:sort="sort" :categories="categories" />
    <div class="results-bar"><p role="status">{{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados' }}</p><span class="demo-tag">Datos de muestra</span></div>
    <div v-if="filteredProducts.length" class="product-grid">
      <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
    </div>
    <EmptyState v-else title="No encontramos productos" message="Probá otra búsqueda o elegí una categoría diferente.">
      <button class="button" @click="resetFilters">Limpiar filtros</button>
    </EmptyState>
  </div>
</template>

<script>
import { products } from '../data/products'
import CatalogFilters from '../components/CatalogFilters.vue'
import ProductCard from '../components/ProductCard.vue'
import EmptyState from '../components/EmptyState.vue'

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default {
  name: 'CatalogView',
  components: { CatalogFilters, ProductCard, EmptyState },
  data() {
    return { search: '', category: '', sort: 'name' }
  },
  computed: {
    categories() {
      return [...new Set(products.map(product => product.category))]
    },
    filteredProducts() {
      const query = normalize(this.search.trim())
      const result = products.filter(product =>
        normalize(product.name).includes(query) && (!this.category || product.category === this.category)
      )
      return result.sort((a, b) => {
        if (this.sort === 'price-asc') return a.price - b.price
        if (this.sort === 'price-desc') return b.price - a.price
        return a.name.localeCompare(b.name, 'es')
      })
    }
  },
  methods: {
    resetFilters() { this.search = ''; this.category = ''; this.sort = 'name' }
  }
}
</script>
