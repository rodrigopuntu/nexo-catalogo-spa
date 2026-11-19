<template>
  <section class="container page-space about-page" aria-labelledby="order-history-title">
    <router-link class="back-link" :to="{ name: 'account' }">← Mi cuenta</router-link>
    <h1 id="order-history-title">Mis pedidos</h1>

    <p v-if="!auth.configured" class="notice" role="status">El historial está disponible en la versión web conectada a Supabase.</p>
    <p v-else-if="auth.loading" class="notice" role="status">Comprobando tu sesión…</p>
    <div v-else-if="!auth.user" class="about-panel">
      <p>Ingresá con Google para ver tus pedidos.</p>
      <router-link class="button" :to="{ name: 'account', query: { returnTo: 'order-history' } }">Ir a Mi cuenta</router-link>
    </div>
    <OrderList v-else :key="auth.user.id" :user-id="auth.user.id">
      <template #empty>
        <router-link class="button" :to="{ name: 'catalog' }">Ver catálogo</router-link>
      </template>
    </OrderList>
  </section>
</template>

<script>
import OrderList from '../components/OrderList.vue'
import { auth } from '../services/auth'

export default {
  name: 'OrderHistoryView',
  components: { OrderList },
  data() { return { auth } }
}
</script>
