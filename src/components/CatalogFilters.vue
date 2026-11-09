<template>
  <div class="filters">
    <div class="filter-fields">
      <label class="search-field">Buscar productos
        <span class="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 4 4"/></svg>
          <input type="search" :value="search" maxlength="100" placeholder="Ej. auriculares, escritorio…" @input="$emit('update:search', $event.target.value)">
        </span>
      </label>
      <label>Ordenar por
        <select :value="sort" @change="$emit('update:sort', $event.target.value)">
          <option value="name">Nombre: A a Z</option>
          <option value="price-asc">Menor precio</option>
          <option value="price-desc">Mayor precio</option>
        </select>
      </label>
    </div>
    <div class="filter-categories" role="group" aria-label="Filtrar por categoría">
      <button type="button" :aria-pressed="category === ''" @click="$emit('update:category', '')">Todas</button>
      <button v-for="item in categories" :key="item" type="button" :aria-pressed="categoryKey(category) === categoryKey(item)" @click="$emit('update:category', item)">{{ item }}</button>
    </div>
  </div>
</template>

<script>
import { categoryKey } from '../data/products'

export default {
  name: 'CatalogFilters',
  props: {
    search: { type: String, default: '' },
    category: { type: String, default: '' },
    sort: { type: String, default: 'name' },
    categories: { type: Array, required: true }
  },
  emits: ['update:search', 'update:category', 'update:sort'],
  methods: { categoryKey }
}
</script>
