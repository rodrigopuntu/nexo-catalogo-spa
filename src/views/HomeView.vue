<template>
  <div class="container">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow accent">DISEÑO SIMPLE. TODOS LOS DÍAS.</p>
        <h1>Tu día,<br>un poco <em>mejor.</em></h1>
        <p>Descubrí objetos para escuchar, crear y disfrutar. Una selección pensada para acompañar tu rutina.</p>
        <router-link class="button" to="/productos">Explorar catálogo <span aria-hidden="true">↗</span></router-link>
        <div v-if="catalog.loading" class="hero-caption" role="status">Cargando catálogo…</div>
        <div v-else-if="featured" class="hero-caption"><span class="small-dot"></span> {{ catalog.products.length }} {{ catalog.products.length === 1 ? 'producto' : 'productos' }} para descubrir<span v-if="catalog.source !== 'supabase'"> · Datos de muestra</span></div>
      </div>
      <router-link v-if="featured && !catalog.loading" class="hero-feature" :to="{ name: 'product-detail', params: { id: featured.id } }" :aria-label="'Ver ' + featured.name">
        <div class="feature-top"><span>LA SELECCIÓN NEXO</span><span aria-hidden="true">↗</span></div>
        <ProductArtwork :product="featured" />
        <div class="feature-bottom"><div><span>{{ featured.category }}</span><h2>{{ featured.name }}</h2></div><span class="feature-pill">Conocelo →</span></div>
      </router-link>
    </section>
    <div class="benefits"><span><b>01</b> Explorá a tu ritmo</span><span><b>02</b> Encontrá tu estilo</span><span><b>03</b> Conocé cada detalle</span></div>
    <section v-if="selection.length && !catalog.loading" class="featured-section" aria-labelledby="featured-title">
      <div class="section-heading"><div><p class="eyebrow accent">UN BUEN LUGAR PARA EMPEZAR</p><h2 id="featured-title">Elegidos para tu día.</h2></div><router-link class="text-link" to="/productos">Ver todo el catálogo ↗</router-link></div>
      <div class="product-grid"><ProductCard v-for="product in selection" :key="product.id" :product="product" /></div>
    </section>
    <section class="home-note"><div><p class="eyebrow">HECHO PARA APRENDER</p><h2>Una idea que va tomando forma.</h2><p>Este catálogo es un proyecto académico en desarrollo. Explorá la primera colección de muestra.</p></div><router-link class="button button-light" to="/acerca-de">Conocer el proyecto ↗</router-link></section>
  </div>
</template>

<script>
import ProductCard from '../components/ProductCard.vue'
import ProductArtwork from '../components/ProductArtwork.vue'
import { catalog, loadCatalog } from '../services/catalog'

export default {
  name: 'HomeView',
  components: { ProductCard, ProductArtwork },
  data() { return { catalog } },
  computed: {
    featured() { return this.catalog.products[0] },
    selection() { return this.catalog.products.slice(0, 4) }
  },
  mounted() { loadCatalog() }
}
</script>
