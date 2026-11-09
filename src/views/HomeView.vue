<template>
  <div class="container">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow hero-kicker"><span aria-hidden="true"></span> EQUIPÁ TU DÍA</p>
        <h1>Tecnología<br>que va <em>con vos.</em></h1>
        <p>Audio, accesorios y objetos de escritorio para armar tu espacio a tu manera.</p>
        <router-link class="button" to="/productos">Explorar catálogo <span aria-hidden="true">↗</span></router-link>
        <p v-if="catalog.loading" class="hero-caption" role="status">Cargando catálogo…</p>
        <p v-else-if="featured" class="hero-caption">{{ catalog.products.length }} {{ catalog.products.length === 1 ? 'producto' : 'productos' }} para descubrir<span v-if="catalog.source !== 'supabase'"> · Datos de muestra</span></p>
      </div>
      <router-link v-if="featured && !catalog.loading" class="hero-feature" :to="{ name: 'product-detail', params: { id: featured.id } }" :aria-label="'Ver ' + featured.name">
        <div class="feature-top"><span>DESTACADO</span><span class="feature-index" aria-hidden="true">01 / NEXO</span></div>
        <ProductArtwork :product="featured" />
        <div class="feature-bottom"><div><span>{{ featured.category }}</span><h2>{{ featured.name }}</h2></div><span class="feature-pill">Ver ficha ↗</span></div>
      </router-link>
      <div v-else class="hero-feature hero-placeholder" aria-hidden="true">N<span>.</span></div>
    </section>
    <section v-if="categories.length && !catalog.loading" class="category-section" aria-labelledby="categories-title">
      <div class="section-heading"><div><p class="eyebrow accent">ENCONTRÁ LO QUE BUSCÁS</p><h2 id="categories-title">Explorá por categoría</h2></div></div>
      <div class="category-grid">
        <router-link v-for="category in categories" :key="category.name" class="category-link" :to="{ name: 'catalog', query: { categoria: category.name } }">
          <span class="category-symbol" aria-hidden="true">{{ category.symbol }}</span>
          <span>{{ category.name }}</span><span class="category-arrow" aria-hidden="true">↗</span>
        </router-link>
      </div>
    </section>
    <section v-if="selection.length && !catalog.loading" class="featured-section" aria-labelledby="featured-title">
      <div class="section-heading"><div><p class="eyebrow accent">SELECCIÓN NEXO</p><h2 id="featured-title">Elegidos para tu día</h2></div><router-link class="text-link" to="/productos">Ver todo ↗</router-link></div>
      <div class="product-grid"><ProductCard v-for="product in selection" :key="product.id" :product="product" /></div>
    </section>
  </div>
</template>

<script>
import ProductCard from '../components/ProductCard.vue'
import ProductArtwork from '../components/ProductArtwork.vue'
import { getCategories } from '../data/products'
import { catalog, loadCatalog } from '../services/catalog'

export default {
  name: 'HomeView',
  components: { ProductCard, ProductArtwork },
  data() { return { catalog } },
  computed: {
    featured() { return this.catalog.products[0] },
    selection() { return this.catalog.products.slice(0, 4) },
    categories() { return getCategories(this.catalog.products) }
  },
  mounted() { loadCatalog() }
}
</script>
