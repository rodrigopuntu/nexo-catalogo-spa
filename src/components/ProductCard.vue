<template>
  <article class="product-card catalog-card">
    <router-link class="card-link" :to="{ name: 'product-detail', params: { id: product.id } }">
      <ProductArtwork :product="product" />
      <div class="card-body">
        <p class="eyebrow">{{ product.category }}</p>
        <h3>{{ product.name }}</h3>
        <div class="card-bottom"><strong>{{ formatPrice(product.price) }}</strong><span class="round-arrow" aria-hidden="true">↗</span></div>
        <span class="sr-only">Ver detalle de {{ product.name }}</span>
      </div>
    </router-link>
    <div class="card-cart">
      <AddToCartButton :product-id="product.id" :name="product.name" />
    </div>
  </article>
</template>

<script>
import ProductArtwork from './ProductArtwork.vue'
import AddToCartButton from './AddToCartButton.vue'
import { formatPrice } from '../data/products'

export default {
  name: 'ProductCard',
  components: { AddToCartButton, ProductArtwork },
  props: { product: { type: Object, required: true } },
  methods: { formatPrice }
}
</script>
