<template>
  <SiteNav />
  <main id="contenido">
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
