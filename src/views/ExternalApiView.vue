<template>
  <section class="container page-space" aria-labelledby="api-title">
    <p class="eyebrow accent">CONEXIÓN CON UN SERVICIO EXTERNO</p>
    <h1 id="api-title">Productos desde una API.</h1>
    <p class="intro">Esta sección consulta DummyJSON mediante Fetch. Sus productos de prueba son independientes del catálogo local y no requieren una clave.</p>
    <div class="api-toolbar">
      <button class="button" :disabled="loading" @click="loadProducts">{{ loading ? 'Consultando…' : 'Volver a consultar' }}</button>
      <p class="muted" role="status" aria-live="polite">{{ statusText }}</p>
    </div>
    <Transition name="notice" mode="out-in">
      <div v-if="loading" key="loading" class="notice" role="status">Consultando el servicio. La espera máxima es de 12 segundos.</div>
      <div v-else-if="error" key="error" class="notice api-error" role="alert">
        <strong>No se pudo completar la consulta</strong>
        <p>{{ error }}</p>
        <p>Comprobá la conexión a Internet y volvé a consultar. El catálogo local sigue disponible.</p>
        <router-link class="text-link" to="/productos">Ver catálogo local</router-link>
      </div>
      <div v-else-if="loaded" key="success" class="notice"><strong>Consulta completada</strong><p>{{ products.length }} productos recibidos del servicio externo.</p></div>
    </Transition>
    <TransitionGroup v-if="!loading && !error && products.length" name="api-list" tag="div" class="product-grid" aria-label="Productos recibidos de DummyJSON">
      <article v-for="product in products" :key="product.id" class="product-card api-card">
        <p class="eyebrow accent">{{ product.category }}</p>
        <h2>{{ product.title }}</h2>
        <p>{{ product.description }}</p>
        <strong>{{ formatUsd(product.price) }}</strong>
      </article>
    </TransitionGroup>
    <p v-if="loaded && !loading && !error && !products.length" class="muted">La consulta fue correcta, pero el servicio no devolvió productos.</p>
    <div class="about-panel api-info"><h2>Qué estamos probando</h2><p>Una consulta real a Internet, la lectura de la respuesta JSON y el manejo de estados HTTP, espera y errores. Los precios de esta sección se muestran en USD, sin conversión a pesos.</p><p>Fuente: <a href="https://dummyjson.com/docs/products" target="_blank" rel="noopener noreferrer">documentación de DummyJSON</a>.</p></div>
  </section>
</template>

<script>
import { fetchExternalProducts } from '../services/productApi'

export default {
  name: 'ExternalApiView',
  data() {
    return { products: [], loading: false, loaded: false, error: '', checkedAt: '', controller: null, timer: null, usdFormatter: null }
  },
  computed: {
    statusText() {
      if (this.loading) return 'Consulta en curso'
      if (this.error) return 'Consulta fallida'
      return this.checkedAt ? 'Última consulta: ' + this.checkedAt : 'Sin consultar'
    }
  },
  created() {
    this.usdFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })
  },
  mounted() {
    this.loadProducts()
  },
  beforeUnmount() {
    this.controller?.abort()
    clearTimeout(this.timer)
  },
  methods: {
    formatUsd(price) { return this.usdFormatter.format(price) },
    async loadProducts() {
      if (this.loading) return
      this.loading = true
      this.loaded = false
      this.error = ''
      this.products = []
      this.controller = new AbortController()
      this.timer = setTimeout(() => this.controller.abort(), 12000)
      try {
        this.products = await fetchExternalProducts(this.controller.signal)
        this.loaded = true
        this.checkedAt = new Date().toLocaleTimeString('es-AR')
      } catch (error) {
        if (error.name === 'AbortError') this.error = 'La consulta se interrumpió o superó el tiempo de espera.'
        else if (error instanceof TypeError) this.error = 'No se pudo acceder al servicio. Puede haber un problema de red o una restricción del navegador.'
        else this.error = error.message || 'Ocurrió un error inesperado.'
      } finally {
        clearTimeout(this.timer)
        this.loading = false
      }
    }
  }
}
</script>
