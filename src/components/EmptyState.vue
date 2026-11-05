<template>
  <section class="empty-state">
    <span aria-hidden="true">⌕</span>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <slot />
  </section>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    title: { type: String, required: true },
    message: { type: String, required: true }
  }
}
</script>
