<template>
  <div class="product-art" :class="product.color" aria-hidden="true">
    <span>{{ product.symbol }}</span>
    <span class="art-circle"></span>
  </div>
</template>

<script>
export default {
  name: 'ProductArtwork',
  props: { product: { type: Object, required: true } }
}
</script>
