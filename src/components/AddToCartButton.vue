<template>
  <button class="button cart-add-button" type="button" :aria-label="quantity >= maxCartQuantity ? 'Límite alcanzado para ' + name : 'Agregar ' + name + ' al carrito'" :disabled="quantity >= maxCartQuantity" @click="add">
    {{ quantity >= maxCartQuantity ? 'Límite alcanzado' : 'Agregar al carrito' }}<span v-if="quantity" aria-hidden="true"> ({{ quantity }})</span>
  </button>
  <span class="sr-only" role="status">{{ quantity ? name + ' en el carrito: ' + quantity : '' }}</span>
</template>

<script>
import { cart, changeCartQuantity, maxCartQuantity } from '../services/cart'

export default {
  name: 'AddToCartButton',
  props: {
    productId: { type: Number, required: true },
    name: { type: String, required: true }
  },
  data() { return { maxCartQuantity } },
  computed: {
    quantity() { return cart.items.find(item => item.id === this.productId)?.quantity ?? 0 }
  },
  methods: {
    add() { changeCartQuantity(this.productId, 1) }
  }
}
</script>
