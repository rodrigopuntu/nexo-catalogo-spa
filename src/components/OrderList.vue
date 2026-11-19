<template>
  <div class="order-results">
    <div v-if="admin" class="order-toolbar">
      <label for="order-status-filter">Filtrar por estado</label>
      <div class="order-tools">
        <select id="order-status-filter" v-model="filter" :disabled="Boolean(savingId)" @change="reload">
          <option value="">Todos los estados</option>
          <option v-for="(label, status) in orderStatuses" :key="status" :value="status">{{ label }}</option>
        </select>
        <button class="button button-light" type="button" :disabled="loading || Boolean(savingId)" @click="reload">Actualizar pedidos</button>
      </div>
    </div>

    <p v-if="loading && !orders.length" class="notice" role="status">Cargando pedidos…</p>
    <p v-if="updateMessage" class="notice" role="status">{{ updateMessage }}</p>
    <p v-if="updateError" class="notice order-error" role="alert">{{ updateError }}</p>

    <ul v-if="orders.length" class="order-list" aria-label="Pedidos">
      <li v-for="order in orders" :key="order.id">
        <article class="about-panel order-card" :aria-labelledby="'order-heading-' + order.id">
          <header class="order-header">
            <div>
              <h2 :id="'order-heading-' + order.id">Pedido del <time :datetime="order.created_at">{{ formatOrderDate(order.created_at) }}</time></h2>
              <p class="order-reference">N.º de pedido {{ order.id }}</p>
              <p v-if="admin" class="order-customer">{{ order.customer_email || order.user_id || 'Cuenta eliminada' }}</p>
            </div>
            <span class="order-status" :class="'order-status-' + order.status">{{ orderStatuses[order.status] }}</span>
          </header>

          <ul class="order-items" aria-label="Productos del pedido">
            <li v-for="item in order.items" :key="item.product_id" class="order-item">
              <div>
                <strong>{{ item.product_name }}</strong>
                <p>{{ item.quantity }} × {{ formatPrice(item.unit_price) }}</p>
              </div>
              <strong class="order-price">{{ formatPrice(item.quantity * item.unit_price) }}</strong>
            </li>
          </ul>
          <div class="order-total"><span>Total</span><strong class="order-price">{{ formatPrice(order.total) }}</strong></div>

          <form v-if="admin && orderTransitions[order.status]?.length" class="order-update" @submit.prevent="saveStatus(order)">
            <label :for="'order-status-' + order.id">Cambiar estado</label>
            <div class="order-tools">
              <select :id="'order-status-' + order.id" v-model="selectedStatuses[order.id]" :disabled="loading || Boolean(savingId)" required>
                <option :value="undefined" disabled>Elegí un estado</option>
                <option v-for="status in orderTransitions[order.status]" :key="status" :value="status">{{ orderStatuses[status] }}</option>
              </select>
              <button class="button" type="submit" :disabled="loading || !selectedStatuses[order.id] || Boolean(savingId)">{{ savingId === order.id ? 'Guardando…' : 'Guardar estado' }}</button>
            </div>
          </form>
        </article>
      </li>
    </ul>

    <div v-if="loadError" class="notice">
      <p role="alert">No pudimos cargar los pedidos. Volvé a intentarlo.</p>
      <button class="button button-light" type="button" :disabled="Boolean(savingId)" @click="loadPage(nextPage)">Volver a intentar</button>
    </div>
    <button v-else-if="nextPage" class="button button-light order-more" type="button" :disabled="loading || Boolean(savingId)" @click="loadPage(nextPage)">{{ loading ? 'Cargando…' : 'Ver más pedidos' }}</button>
    <EmptyState v-else-if="!orders.length && !loading" :title="emptyTitle" :message="emptyMessage">
      <slot name="empty" />
    </EmptyState>
  </div>
</template>

<script>
import EmptyState from './EmptyState.vue'
import { formatPrice } from '../data/products'
import { formatOrderDate, listOrders, orderStatuses, orderTransitions, updateOrderStatus } from '../services/orders'

export default {
  name: 'OrderList',
  components: { EmptyState },
  props: {
    admin: { type: Boolean, default: false },
    userId: { type: String, default: undefined }
  },
  data() {
    return {
      orderStatuses, orderTransitions, orders: [], filter: '', nextPage: null,
      loading: false, loadError: false, version: 0, selectedStatuses: {},
      savingId: null, updateMessage: '', updateError: ''
    }
  },
  computed: {
    emptyTitle() {
      return this.admin ? 'No hay pedidos' : 'Todavía no tenés pedidos'
    },
    emptyMessage() {
      if (!this.admin) return 'Tus pedidos van a aparecer acá cuando confirmes una selección del carrito.'
      return this.filter ? 'No hay pedidos con el estado seleccionado.' : 'Los pedidos de los clientes van a aparecer acá.'
    }
  },
  created() { this.loadPage() },
  beforeUnmount() { this.version++ },
  methods: {
    formatOrderDate,
    formatPrice,
    reload() {
      if (this.savingId) return
      this.version++
      this.orders = []
      this.nextPage = null
      this.loading = false
      this.selectedStatuses = {}
      this.updateMessage = ''
      this.updateError = ''
      return this.loadPage()
    },
    async loadPage(before) {
      if (this.loading || this.savingId) return
      const version = this.version
      this.loading = true
      this.loadError = false
      try {
        const { orders, nextPage } = await listOrders({ userId: this.userId, status: this.filter, before })
        if (version !== this.version) return
        this.orders = before ? [...this.orders, ...orders] : orders
        this.nextPage = nextPage
      } catch {
        if (version === this.version) this.loadError = true
      } finally {
        if (version === this.version) this.loading = false
      }
    },
    async saveStatus(order) {
      const status = this.selectedStatuses[order.id]
      if (this.loading || this.savingId || !orderTransitions[order.status]?.includes(status)) return

      const version = this.version
      this.savingId = order.id
      this.updateMessage = ''
      this.updateError = ''
      try {
        await updateOrderStatus(order.id, status)
        if (version !== this.version) return
        this.orders = this.filter && this.filter !== status
          ? this.orders.filter(row => row.id !== order.id)
          : this.orders.map(row => row.id === order.id ? { ...row, status } : row)
        delete this.selectedStatuses[order.id]
        this.updateMessage = `Estado actualizado a «${orderStatuses[status]}».`
      } catch (error) {
        if (version !== this.version) return
        switch (error?.code) {
          case '42501':
            this.updateError = 'Tu cuenta necesita permiso para cambiar pedidos.'
            break
          case 'P0002':
          case '40001':
          case '22023':
            this.updateError = 'El pedido cambió. Actualizá la lista para ver su estado.'
            break
          default:
            this.updateError = 'No pudimos confirmar el cambio. Volvé a guardar el estado o actualizá la lista.'
        }
      } finally {
        if (version === this.version) this.savingId = null
      }
    }
  }
}
</script>

<style scoped>
.order-results { margin-top: 24px; }
.order-list, .order-items { display: grid; padding: 0; margin: 0; list-style: none; }
.order-list { gap: 14px; }
.order-card { margin: 0; }
.order-toolbar { margin-bottom: 16px; }
.order-toolbar label, .order-update label { display: block; margin-bottom: 6px; color: var(--muted); font-size: 14px; font-weight: 650; }
.order-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.order-tools select { flex: 1 1 170px; max-width: 245px; }
.order-header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.order-header > div { min-width: 0; }
.order-header h2 { font-size: 18px; letter-spacing: -.02em; }
.order-header p { margin: 5px 0 0; font-size: 13px; }
.order-reference, .order-customer { overflow-wrap: anywhere; }
.order-reference { font-variant-numeric: tabular-nums; }
.order-customer { font-weight: 650; }
.order-status { padding: 4px 10px; border: 1px solid var(--line); border-radius: 40px; color: var(--ink); background: var(--surface-soft); font-size: 13px; font-weight: 650; }
.order-status-pending { background: var(--pastel-sand); }
.order-status-processing { background: var(--pastel-lavender); }
.order-status-completed { background: var(--pastel-mint); }
.order-status-cancelled { color: var(--danger); background: var(--danger-bg); }
.order-item, .order-total { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 5px 18px; padding-block: 10px; border-top: 1px solid var(--line); }
.order-item > div { min-width: 0; overflow-wrap: anywhere; }
.order-item p { margin: 0; font-size: 13px; }
.order-price { margin-left: auto; font-variant-numeric: tabular-nums; }
.order-total { font-size: 17px; }
.order-update { margin-top: 10px; }
.order-error { border-left-color: var(--danger); }
.order-more { margin-top: 16px; }
</style>
