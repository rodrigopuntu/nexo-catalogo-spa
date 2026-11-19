<template>
  <section class="container page-space about-page" aria-labelledby="account-title">
    <p class="eyebrow accent">TU CUENTA</p>
    <h1 id="account-title">Mi cuenta</h1>
    <p class="intro">Ingresá con Google para acceder a tu cuenta de Nexo. Podés explorar el catálogo como visitante.</p>

    <div class="about-panel">
      <p v-if="!auth.configured" role="status">El inicio de sesión no está disponible en esta versión.</p>
      <p v-else-if="auth.loading" role="status">Comprobando tu sesión…</p>
      <template v-else>
        <p v-if="error || (auth.signInError && !busy)" role="alert">{{ error || 'No se pudo completar el inicio de sesión con Google. Volvé a intentarlo.' }}</p>
        <template v-if="auth.user">
          <h2>Sesión iniciada</h2>
          <p>{{ auth.user.email }}</p>
          <p><router-link class="text-link" :to="{ name: 'order-history' }">Mis pedidos</router-link></p>
          <template v-if="auth.admin">
            <p><router-link class="text-link" :to="{ name: 'order-admin' }">Administrar pedidos</router-link></p>
            <p><router-link class="text-link" :to="{ name: 'product-admin' }">Administrar productos</router-link></p>
          </template>
          <p v-if="auth.adminError" role="status">No pudimos comprobar los permisos de administración. <button class="button button-light" type="button" @click="checkAdmin">Reintentar</button></p>
          <button class="button" :disabled="busy" @click="signOut">Cerrar sesión</button>
        </template>
        <button v-else class="button" :disabled="busy" @click="signIn">{{ busy ? 'Abriendo Google…' : 'Ingresar con Google' }}</button>
      </template>
    </div>
  </section>
</template>

<script>
import { auth, checkAdmin, returningFromGoogle } from '../services/auth'
import { supabase } from '../services/supabase'

const returnKey = 'nexo.auth.returnTo'
const returnRoutes = ['cart', 'order-history', 'order-admin']

export default {
  name: 'AccountView',
  data() { return { auth, busy: false, error: '' } },
  watch: {
    'auth.user': {
      immediate: true,
      handler(user) {
        const destination = this.returnRoute()
        if (!user || !destination) return
        try { window.sessionStorage.removeItem(returnKey) } catch { /* La navegación sigue disponible. */ }
        this.$router.replace({ name: destination })
      }
    }
  },
  methods: {
    checkAdmin,
    returnRoute() {
      let destination = this.$route.query.returnTo
      if (returningFromGoogle) {
        try { destination ??= window.sessionStorage.getItem(returnKey) } catch { /* El retorno es opcional. */ }
      }
      return returnRoutes.includes(destination) ? destination : null
    },
    async signIn() {
      this.busy = true
      this.error = ''
      try {
        const destination = this.returnRoute()
        if (destination) window.sessionStorage.setItem(returnKey, destination)
        else window.sessionStorage.removeItem(returnKey)
      } catch { /* Se puede iniciar sesión aunque el navegador no guarde el destino. */ }
      try {
        const redirectTo = new URL(this.$router.resolve({ name: 'account' }).href, window.location.origin).href
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
        if (error) throw error
      } catch {
        this.error = 'No se pudo abrir el inicio de sesión con Google. Volvé a intentarlo.'
        this.busy = false
      }
    },
    async signOut() {
      this.busy = true
      this.error = ''
      try {
        const { error } = await supabase.auth.signOut({ scope: 'local' })
        if (error) throw error
      } catch {
        this.error = 'No se pudo cerrar la sesión. Volvé a intentarlo.'
      } finally {
        this.busy = false
      }
    }
  }
}
</script>
