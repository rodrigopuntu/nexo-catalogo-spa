<template>
  <a class="skip-link" href="#contenido" @click.prevent="$refs.content.focus()">Saltar al contenido</a>
  <SiteNav />
  <main id="contenido" ref="content" tabindex="-1">
    <router-view />
  </main>
  <SiteFooter />
</template>

<script>
import SiteNav from './components/SiteNav.vue'
import SiteFooter from './components/SiteFooter.vue'
import './styles/main.css'

export default {
  components: { SiteNav, SiteFooter }
}
</script>
