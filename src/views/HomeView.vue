<template>
  <div class="container">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow accent">DISEÑO SIMPLE. TODOS LOS DÍAS.</p>
        <h1>Tu día,<br>un poco <em>mejor.</em></h1>
        <p>Descubrí objetos para escuchar, crear y disfrutar. Una selección pensada para acompañar tu rutina.</p>
        <router-link class="button" to="/productos">Explorar catálogo <span aria-hidden="true">↗</span></router-link>
        <div class="hero-caption"><span class="small-dot"></span> 15 productos para descubrir</div>
      </div>
      <router-link class="hero-feature" :to="{ name: 'product-detail', params: { id: featured.id } }" :aria-label="'Ver ' + featured.name">
        <div class="feature-top"><span>LA SELECCIÓN NEXO</span><span aria-hidden="true">↗</span></div>
        <ProductArtwork :product="featured" />
        <div class="feature-bottom"><div><span>AUDIO / 01</span><h2>{{ featured.name }}</h2></div><span class="feature-pill">Conocelo →</span></div>
      </router-link>
    </section>
    <div class="benefits"><span><b>01</b> Explorá a tu ritmo</span><span><b>02</b> Encontrá tu estilo</span><span><b>03</b> Conocé cada detalle</span></div>
    <section class="featured-section" aria-labelledby="featured-title">
      <div class="section-heading"><div><p class="eyebrow accent">UN BUEN LUGAR PARA EMPEZAR</p><h2 id="featured-title">Elegidos para tu día.</h2></div><router-link class="text-link" to="/productos">Ver los 15 productos ↗</router-link></div>
      <div class="product-grid"><ProductCard v-for="product in selection" :key="product.id" :product="product" /></div>
    </section>
    <section class="home-note"><div><p class="eyebrow">HECHO PARA APRENDER</p><h2>Una idea que va tomando forma.</h2><p>Este catálogo es un proyecto académico en desarrollo. Explorá la primera colección de muestra.</p></div><router-link class="button button-light" to="/acerca-de">Conocer el proyecto ↗</router-link></section>
  </div>
</template>

<script>
import ProductCard from '../components/ProductCard.vue'
import ProductArtwork from '../components/ProductArtwork.vue'
import { products } from '../data/products'

export default {
  name: 'HomeView',
  components: { ProductCard, ProductArtwork },
  data() {
    return { featured: products[0], selection: products.slice(0, 4) }
  }
}
</script>
