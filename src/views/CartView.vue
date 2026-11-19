<template>
  <section class="container page-space" aria-labelledby="cart-title">
    <p class="eyebrow accent">TU SELECCIÓN</p>
    <h1 id="cart-title">Carrito</h1>
    <p class="intro">Revisá tu selección y ajustá las cantidades.</p>

    <p v-if="!cart.persistent" class="notice" role="status">El navegador no pudo guardar el carrito. Tu selección se conserva mientras esta página siga abierta.</p>
    <p v-if="checkoutResult?.orderId" class="notice" role="status">
      Tu pedido quedó registrado. Podés seguir su estado en <router-link class="text-link" :to="{ name: 'order-history' }">Mis pedidos</router-link>.
    </p>
    <p v-if="checkoutResult?.error" class="notice" role="alert">{{ checkoutResult.error }}</p>
    <EmptyState v-if="!cart.items.length && !pendingCheckout && !checkoutResult?.orderId" title="Tu carrito está vacío" message="Explorá el catálogo y agregá tus favoritos.">
      <router-link class="button" to="/productos">Ver catálogo</router-link>
    </EmptyState>
    <p v-else-if="catalog.loading && !pendingCheckout && cart.items.length" class="notice" role="status">Cargando los productos del carrito…</p>
    <template v-else-if="cart.items.length || pendingCheckout">
      <p v-if="cart.items.length && !catalog.loading && catalog.source !== 'supabase'" class="notice" role="status">Estás viendo precios de muestra. Los productos que no figuran en esta copia quedan fuera del total.</p>
      <div class="cart-layout" :class="{ 'cart-without-items': !cart.items.length || catalog.loading }">
        <ul v-if="cart.items.length && !catalog.loading" class="cart-items" aria-label="Productos en el carrito">
          <li v-for="line in lines" :key="line.id" class="cart-line">
            <div class="cart-line-product">
              <ProductArtwork v-if="line.product" :product="line.product" />
              <div>
                <router-link v-if="line.product" :to="{ name: 'product-detail', params: { id: line.id } }">{{ line.name }}</router-link>
                <strong v-else>{{ line.name }}</strong>
                <p>{{ line.product ? formatPrice(line.product.price) + ' por unidad' : 'No disponible en el catálogo actual' }}</p>
              </div>
            </div>
            <div class="cart-line-actions">
              <div class="cart-quantity" role="group" :aria-label="'Cantidad de ' + line.name">
                <button type="button" :aria-label="'Restar una unidad de ' + line.name" :disabled="line.quantity === 1" @click="changeCartQuantity(line.id, -1)">−</button>
                <span aria-live="polite">{{ line.quantity }}</span>
                <button type="button" :aria-label="'Sumar una unidad de ' + line.name" :disabled="!line.product || line.quantity >= maxCartQuantity" @click="changeCartQuantity(line.id, 1)">+</button>
              </div>
              <button class="cart-remove" type="button" :aria-label="'Quitar ' + line.name + ' del carrito'" @click="removeFromCart(line.id)">Quitar</button>
            </div>
            <strong class="cart-subtotal">{{ line.product ? formatPrice(line.subtotal) : '—' }}</strong>
          </li>
        </ul>
        <aside class="about-panel cart-summary" aria-labelledby="cart-summary-title">
          <h2 id="cart-summary-title">{{ cart.items.length ? 'Resumen' : 'Confirmar pedido' }}</h2>
          <template v-if="cart.items.length && !catalog.loading">
            <p>{{ cart.count }} {{ cart.count === 1 ? 'unidad' : 'unidades' }} en el carrito</p>
            <p class="cart-total" role="status"><span>Total estimado</span><strong>{{ formatPrice(total) }}</strong></p>
            <p v-if="unavailable && catalog.source === 'supabase'">Quitá del carrito los productos que ya no están disponibles para poder confirmar tu pedido.</p>
          </template>
          <div class="cart-checkout">
            <template v-if="pendingCheckout">
              <p v-if="!submitting && !checkoutResult?.error">Tenés un pedido por confirmar. Al reintentar se mantienen los productos y las cantidades de la solicitud original.</p>
              <button class="button" type="button" :disabled="submitting" @click="submitOrder">{{ submitting ? 'Registrando pedido…' : 'Reintentar pedido' }}</button>
            </template>
            <p v-else-if="!auth.configured">Los pedidos no están disponibles en esta versión.</p>
            <p v-else-if="catalog.source !== 'supabase'">Para confirmar un pedido, primero recargá el catálogo.</p>
            <p v-else-if="auth.loading" role="status">Comprobando tu sesión…</p>
            <router-link v-else-if="!auth.user" class="button" :to="{ name: 'account', query: { returnTo: 'cart' } }">Ingresar para hacer un pedido</router-link>
            <template v-else-if="!unavailable">
              <button class="button" type="button" :disabled="submitting" @click="submitOrder">{{ submitting ? 'Registrando pedido…' : 'Confirmar pedido' }}</button>
              <p>El pedido se registra sin pago en línea.</p>
            </template>
            <button v-if="catalog.source === 'fallback' && !pendingCheckout" class="button button-light" type="button" @click="loadCatalog()">Recargar catálogo</button>
            <router-link class="button button-light" to="/productos">Seguir explorando</router-link>
          </div>
        </aside>
      </div>
    </template>
  </section>
</template>

<script>
import EmptyState from '../components/EmptyState.vue'
import ProductArtwork from '../components/ProductArtwork.vue'
import { formatPrice } from '../data/products'
import { auth } from '../services/auth'
import { beginCartCheckout, cart, changeCartQuantity, finishCartCheckout, maxCartQuantity, removeFromCart } from '../services/cart'
import { catalog, loadCatalog } from '../services/catalog'
import { createOrder } from '../services/orders'

const orderErrors = {
  P0002: 'Algún producto dejó de estar disponible. Revisá el carrito antes de volver a confirmar.',
  22023: 'No se pudo registrar el pedido con esa selección. Revisá el carrito y volvé a intentarlo.',
  42501: 'Tu sesión no pudo confirmar el pedido. Volvé a ingresar a tu cuenta.'
}

export default {
  name: 'CartView',
  components: { EmptyState, ProductArtwork },
  data() { return { auth, cart, catalog, maxCartQuantity, submitting: false, result: null } },
  computed: {
    lines() {
      const products = new Map(this.catalog.products.map(product => [product.id, product]))
      return this.cart.items.map(item => {
        const product = products.get(item.id)
        return { ...item, product, name: product?.name ?? 'Producto #' + item.id, subtotal: (product?.price ?? 0) * item.quantity }
      })
    },
    total() { return this.lines.reduce((sum, line) => sum + line.subtotal, 0) },
    unavailable() { return this.lines.filter(line => !line.product).length },
    pendingCheckout() { return this.cart.checkouts.find(checkout => checkout.userId === this.auth.user?.id) },
    checkoutResult() { return this.result?.userId === this.auth.user?.id ? this.result : null }
  },
  mounted() { loadCatalog() },
  methods: {
    changeCartQuantity,
    removeFromCart,
    formatPrice,
    loadCatalog,
    async submitOrder() {
      const userId = this.auth.user?.id
      const retryId = this.pendingCheckout?.requestId
      if (!userId || this.submitting || (!retryId && (this.catalog.source !== 'supabase' || this.unavailable))) return

      this.submitting = true
      this.result = null
      let checkout
      try {
        checkout = await beginCartCheckout(userId, this.cart.items, retryId)
        if (!checkout) {
          this.result = { userId, error: 'El carrito o el pedido cambió en otra pestaña. Revisá tu selección y Mis pedidos.' }
          return
        }
        if (this.auth.user?.id !== userId) return

        const orderId = await createOrder(checkout.items, checkout.requestId, userId)
        await finishCartCheckout(userId, checkout.requestId, true)
        this.result = { userId, orderId }
      } catch (error) {
        const message = orderErrors[error?.code]
        if (checkout && ['P0002', '22023'].includes(error?.code)) {
          await finishCartCheckout(userId, checkout.requestId, false)
        }
        if (error?.code === 'P0002') loadCatalog({ refresh: true })
        this.result = {
          userId,
          error: message ?? (checkout
            ? 'No pudimos confirmar si el pedido se registró. Reintentá para consultar el mismo pedido.'
            : 'No se pudo iniciar el pedido. Volvé a intentarlo.')
        }
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.cart-checkout {
  display: grid;
  gap: 8px;
}

.cart-checkout p {
  margin: 0;
}

.cart-without-items {
  grid-template-columns: minmax(0, 360px);
}
</style>
