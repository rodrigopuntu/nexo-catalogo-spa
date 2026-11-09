<template>
  <div class="container page-space">
    <div class="catalog-heading">
      <p class="eyebrow accent">LA COLECCIÓN</p>
      <h1>Catálogo</h1>
      <p class="intro">Buscá por nombre o explorá lo que tenemos para tu día.</p>
    </div>
    <p v-if="catalog.loading" class="notice" role="status">Cargando catálogo…</p>
    <template v-else>
      <Transition name="feedback" appear>
        <div v-if="catalog.source === 'fallback'" class="notice" role="status">
          <p>Estás viendo el catálogo de muestra. Volvé a intentar para cargar los productos actuales.</p>
          <button class="button button-light" type="button" @click="retry">Volver a intentar</button>
        </div>
      </Transition>
      <CatalogFilters v-if="catalog.products.length" v-model:search="search" v-model:category="category" v-model:sort="sort" :categories="categories" />
      <div class="results-bar">
        <p role="status">{{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados' }}</p>
        <button v-if="filtersActive" class="text-button" type="button" @click="resetFilters">Limpiar filtros</button>
        <span v-else-if="catalog.source !== 'supabase'" class="demo-tag">Datos de muestra</span>
      </div>
      <TransitionGroup v-if="filteredProducts.length" name="catalog-list" tag="div" class="product-grid">
        <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" :detail-query="filterQuery" />
      </TransitionGroup>
      <EmptyState v-else-if="catalog.products.length" title="No encontramos productos" message="Probá otra búsqueda o elegí una categoría diferente.">
        <button class="button" @click="resetFilters">Limpiar filtros</button>
      </EmptyState>
      <EmptyState v-else title="El catálogo está vacío" message="Todavía no hay productos para mostrar." />
    </template>
  </div>
</template>

<script>
import { catalog, loadCatalog } from '../services/catalog'
import CatalogFilters from '../components/CatalogFilters.vue'
import ProductCard from '../components/ProductCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { categoryKey, getCategories } from '../data/products'

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const queryString = value => typeof value === 'string' ? value : ''
const validOrders = ['price-asc', 'price-desc']
const filtersFromQuery = query => ({
  search: queryString(query.q).slice(0, 100),
  category: queryString(query.categoria),
  sort: validOrders.includes(query.orden) ? query.orden : 'name'
})

export default {
  name: 'CatalogView',
  components: { CatalogFilters, ProductCard, EmptyState },
  data() {
    return { catalog, search: '', category: '', sort: 'name' }
  },
  computed: {
    categories() {
      return getCategories(this.catalog.products).map(category => category.name).sort((a, b) => a.localeCompare(b, 'es'))
    },
    filtersActive() { return Boolean(this.search || this.category || this.sort !== 'name') },
    filterQuery() {
      return { q: this.search || undefined, categoria: this.category || undefined, orden: this.sort === 'name' ? undefined : this.sort }
    },
    filteredProducts() {
      const query = normalize(this.search.trim())
      const selectedCategory = categoryKey(this.category)
      const result = this.catalog.products.filter(product =>
        normalize(product.name + ' ' + product.category).includes(query) && (!selectedCategory || categoryKey(product.category) === selectedCategory)
      )
      return result.sort((a, b) => {
        if (this.sort === 'price-asc') return a.price - b.price
        if (this.sort === 'price-desc') return b.price - a.price
        return a.name.localeCompare(b.name, 'es')
      })
    }
  },
  watch: {
    '$route.query'(query) {
      if (this.$route.name === 'catalog') Object.assign(this, filtersFromQuery(query))
    },
    filterQuery(query) {
      if (this.$route.name === 'catalog' && Object.keys(query).some(key => this.$route.query[key] !== query[key])) {
        this.$router.replace({ name: 'catalog', query })
      }
    }
  },
  created() { Object.assign(this, filtersFromQuery(this.$route.query)) },
  mounted() { loadCatalog() },
  methods: {
    resetFilters() { this.search = ''; this.category = ''; this.sort = 'name' },
    retry() {
      loadCatalog()
    }
  }
}
</script>
