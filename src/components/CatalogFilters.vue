<template>
  <div class="filters">
    <label class="search-field">Buscar productos
      <input type="search" :value="search" placeholder="¿Qué estás buscando?" @input="$emit('update:search', $event.target.value)">
    </label>
    <label>Categoría
      <select :value="category" @change="$emit('update:category', $event.target.value)">
        <option value="">Todas las categorías</option>
        <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
      </select>
    </label>
    <label>Ordenar por
      <select :value="sort" @change="$emit('update:sort', $event.target.value)">
        <option value="name">Nombre: A a Z</option>
        <option value="price-asc">Menor precio</option>
        <option value="price-desc">Mayor precio</option>
      </select>
    </label>
  </div>
</template>

<script>
export default {
  name: 'CatalogFilters',
  props: {
    search: { type: String, default: '' },
    category: { type: String, default: '' },
    sort: { type: String, default: 'name' },
    categories: { type: Array, required: true }
  },
  emits: ['update:search', 'update:category', 'update:sort']
}
</script>
