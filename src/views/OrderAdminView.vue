<template>
  <section class="container page-space about-page" aria-labelledby="order-admin-title">
    <router-link class="back-link" :to="{ name: 'account' }">← Mi cuenta</router-link>
    <h1 id="order-admin-title">Administrar pedidos</h1>

    <p v-if="!auth.configured" class="notice" role="status">La administración de pedidos está disponible en la versión web conectada a Supabase.</p>
    <p v-else-if="auth.loading || auth.adminLoading" class="notice" role="status">Comprobando tu acceso…</p>
    <div v-else-if="!auth.user" class="about-panel">
      <p>Ingresá con Google para administrar pedidos.</p>
      <router-link class="button" :to="{ name: 'account', query: { returnTo: 'order-admin' } }">Ir a Mi cuenta</router-link>
    </div>
    <div v-else-if="auth.adminError" class="notice">
      <p role="alert">No pudimos comprobar tu permiso para administrar pedidos.</p>
      <button class="button button-light" type="button" @click="checkAdmin()">Volver a intentar</button>
    </div>
    <p v-else-if="!auth.admin" class="notice" role="status">Esta cuenta necesita permiso para administrar pedidos.</p>
    <OrderList v-else :key="auth.user.id" admin />
  </section>
</template>

<script>
import OrderList from '../components/OrderList.vue'
import { auth, checkAdmin } from '../services/auth'

export default {
  name: 'OrderAdminView',
  components: { OrderList },
  data() { return { auth } },
  methods: { checkAdmin }
}
</script>
