<template>
  <div class="container page-space">
    <EmptyState title="Esta página no existe" message="Podés volver al inicio o explorar nuestro catálogo.">
      <router-link class="button" to="/">Volver al inicio</router-link>
    </EmptyState>
  </div>
</template>

<script>
import EmptyState from '../components/EmptyState.vue'
export default { name: 'NotFoundView', components: { EmptyState } }
</script>
