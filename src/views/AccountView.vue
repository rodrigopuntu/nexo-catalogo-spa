<template>
  <section class="container page-space about-page" aria-labelledby="account-title">
    <p class="eyebrow accent">TU CUENTA</p>
    <h1 id="account-title">Mi cuenta</h1>
    <p class="intro">Ingresá con Google para acceder a tu cuenta de Nexo. Podés explorar el catálogo como visitante.</p>

    <div class="about-panel">
      <p v-if="!configured" role="status">El inicio de sesión no está disponible en esta versión.</p>
      <p v-else-if="loading" role="status">Comprobando tu sesión…</p>
      <template v-else>
        <p v-if="error" role="alert">{{ error }}</p>
        <template v-if="user">
          <h2>Sesión iniciada</h2>
          <p>{{ user.email }}</p>
          <button class="button" :disabled="busy" @click="signOut">Cerrar sesión</button>
        </template>
        <button v-else class="button" :disabled="busy" @click="signIn">{{ busy ? 'Abriendo Google…' : 'Ingresar con Google' }}</button>
      </template>
    </div>
  </section>
</template>

<script>
import { supabase } from '../services/supabase'

export default {
  name: 'AccountView',
  data() {
    return { configured: Boolean(supabase), loading: Boolean(supabase), busy: false, user: null, error: '', subscription: null }
  },
  mounted() {
    if (!supabase) return

    const params = new URLSearchParams(window.location.search)
    const returningFromGoogle = params.has('code') || params.has('error') || params.has('error_code')
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user ?? null
      this.loading = false
      if (event === 'INITIAL_SESSION' && returningFromGoogle && !session) {
        this.error = 'No se pudo completar el inicio de sesión con Google. Volvé a intentarlo.'
      }
    })
    this.subscription = data.subscription
  },
  beforeUnmount() {
    this.subscription?.unsubscribe()
  },
  methods: {
    async signIn() {
      this.busy = true
      this.error = ''
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
