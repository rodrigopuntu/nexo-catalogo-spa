<template>
  <section class="container page-space about-page" aria-labelledby="admin-title">
    <p class="eyebrow accent">ADMINISTRACIÓN</p>
    <h1 id="admin-title">Administrar productos</h1>
    <p class="intro">Creá un producto nuevo o elegí uno del catálogo para editarlo o eliminarlo.</p>

    <div v-if="status !== 'ready'" class="about-panel">
      <p v-if="status === 'loading'" role="status">Comprobando el acceso y cargando el catálogo…</p>
      <p v-else-if="status === 'unavailable'" role="status">La administración está disponible en la versión web conectada a Supabase.</p>
      <template v-else-if="status === 'signed-out'">
        <p>Iniciá sesión para acceder a la administración.</p>
        <router-link class="button" to="/cuenta">Ir a Mi cuenta</router-link>
      </template>
      <template v-else-if="status === 'denied'">
        <p>Esta cuenta necesita permiso para administrar el catálogo.</p>
        <router-link class="text-link" to="/productos">Ver catálogo</router-link>
      </template>
      <template v-else>
        <p role="alert">No pudimos comprobar tu acceso o cargar los productos. Volvé a intentarlo.</p>
        <button class="button" type="button" @click="initialize">Volver a intentar</button>
      </template>
    </div>

    <form v-else class="about-panel product-form" novalidate @submit.prevent="submit">
      <fieldset :disabled="saving || deleting">
        <legend>{{ selectedId === '' ? 'Nuevo producto' : 'Editar producto' }}</legend>
        <label for="product-selection">Producto</label>
        <select id="product-selection" v-model="selectedId" @change="chooseProduct">
          <option value="">Crear producto nuevo</option>
          <option v-for="product in catalog.products" :key="product.id" :value="product.id">{{ product.name }} (#{{ product.id }})</option>
        </select>

        <div class="product-form-fields">
          <div>
            <label for="product-name">Nombre</label>
            <input id="product-name" v-model.trim="form.name" type="text" maxlength="100" required :aria-invalid="Boolean(errors.name)" :aria-describedby="errors.name ? 'product-name-error' : undefined">
            <p v-if="errors.name" id="product-name-error" class="field-error">{{ errors.name }}</p>
          </div>
          <div>
            <label for="product-category">Categoría</label>
            <input id="product-category" v-model.trim="form.category" type="text" maxlength="50" required :aria-invalid="Boolean(errors.category)" :aria-describedby="errors.category ? 'product-category-error' : undefined">
            <p v-if="errors.category" id="product-category-error" class="field-error">{{ errors.category }}</p>
          </div>
          <div>
            <label for="product-price">Precio en pesos</label>
            <input id="product-price" v-model.trim="form.price" type="text" inputmode="numeric" maxlength="10" required :aria-invalid="Boolean(errors.price)" :aria-describedby="errors.price ? 'product-price-error' : undefined">
            <p v-if="errors.price" id="product-price-error" class="field-error">{{ errors.price }}</p>
          </div>
          <div>
            <label for="product-symbol">Símbolo</label>
            <input id="product-symbol" v-model.trim="form.symbol" type="text" maxlength="12" required :aria-invalid="Boolean(errors.symbol)" :aria-describedby="errors.symbol ? 'product-symbol-error' : undefined">
            <p v-if="errors.symbol" id="product-symbol-error" class="field-error">{{ errors.symbol }}</p>
          </div>
          <div>
            <label for="product-color">Color de la tarjeta</label>
            <select id="product-color" v-model="form.color">
              <option v-for="(label, color) in colors" :key="color" :value="color">{{ label }}</option>
            </select>
          </div>
          <div class="product-form-description">
            <label for="product-description">Descripción</label>
            <textarea id="product-description" v-model.trim="form.description" rows="4" maxlength="500" required :aria-invalid="Boolean(errors.description)" :aria-describedby="errors.description ? 'product-description-error' : undefined"></textarea>
            <p v-if="errors.description" id="product-description-error" class="field-error">{{ errors.description }}</p>
          </div>
        </div>

        <p v-if="message" role="alert" class="field-error">{{ message }}</p>
        <p v-if="savedId" role="status">Producto guardado. <router-link :to="{ name: 'product-detail', params: { id: savedId } }">Ver ficha</router-link></p>
        <p v-if="deletedName" role="status">Se eliminó «{{ deletedName }}» del catálogo.</p>
        <div v-if="pendingDelete" class="notice delete-notice" role="group" aria-labelledby="delete-title">
          <h2 id="delete-title">¿Eliminar «{{ pendingDelete.name }}»?</h2>
          <p>Se quitará del catálogo de forma permanente.</p>
          <div class="product-form-actions">
            <button ref="cancelDelete" class="button" type="button" @click="cancelDeletion">Cancelar</button>
            <button class="button danger-button" type="button" @click="confirmDeletion">{{ deleting ? 'Eliminando…' : 'Confirmar eliminación' }}</button>
          </div>
        </div>
        <div v-else class="product-form-actions">
          <button class="button" type="submit">{{ saving ? 'Guardando…' : 'Guardar producto' }}</button>
          <button v-if="selectedId !== ''" ref="askDelete" class="button danger-button" type="button" @click="askDeletion">Eliminar producto</button>
        </div>
      </fieldset>
    </form>
  </section>
</template>

<script>
import { supabase } from '../services/supabase'
import { catalog, deleteProduct, loadCatalog, saveProduct } from '../services/catalog'

const colors = { lavender: 'Lavanda', mint: 'Menta', sand: 'Arena', peach: 'Durazno' }
const emptyForm = () => ({ name: '', category: '', price: '', symbol: '📦', color: 'sand', description: '' })

export default {
  name: 'ProductAdminView',
  data() {
    return {
      catalog, colors, status: 'loading', selectedId: '', form: emptyForm(),
      errors: {}, message: '', savedId: null, saving: false,
      pendingDelete: null, deleting: false, deletedName: ''
    }
  },
  mounted() { this.initialize() },
  methods: {
    async initialize() {
      this.status = 'loading'
      if (!supabase) {
        this.status = 'unavailable'
        return
      }

      try {
        const { data: auth, error: authError } = await supabase.auth.getUser()
        if (authError?.name === 'AuthSessionMissingError' || (!authError && !auth.user)) {
          this.status = 'signed-out'
          return
        }
        if (authError) throw authError
        const { data: admin, error } = await supabase.from('product_admins')
          .select('user_id').eq('user_id', auth.user.id).maybeSingle()
        if (error) throw error
        if (!admin) {
          this.status = 'denied'
          return
        }
        await loadCatalog()
        this.status = catalog.source === 'supabase' ? 'ready' : 'failed'
      } catch {
        this.status = 'failed'
      }
    },
    chooseProduct() {
      const product = this.catalog.products.find(item => item.id === this.selectedId)
      if (product) {
        const { name, category, price, symbol, color, description } = product
        this.form = { name, category, price: String(price), symbol, color, description }
      } else {
        this.form = emptyForm()
      }
      this.errors = {}
      this.message = ''
      this.savedId = null
      this.pendingDelete = null
      this.deletedName = ''
    },
    async submit() {
      if (this.saving || this.deleting || this.pendingDelete || this.status !== 'ready') return

      this.savedId = null
      this.deletedName = ''
      this.message = ''
      const { name, category, price, symbol, color, description } = this.form
      const errors = {}
      if (Array.from(name).length < 3 || name.length > 100) errors.name = 'Ingresá entre 3 y 100 caracteres.'
      if (!category || category.length > 50) errors.category = 'Ingresá una categoría de hasta 50 caracteres.'
      if (!/^\d+$/.test(price) || Number(price) > 2147483647) errors.price = 'Ingresá un precio entero entre 0 y 2.147.483.647, sin puntos ni comas.'
      if (!symbol || symbol.length > 12) errors.symbol = 'Ingresá un símbolo corto, por ejemplo 📦.'
      if (!description || description.length > 500) errors.description = 'Ingresá una descripción de hasta 500 caracteres.'
      this.errors = errors
      if (Object.keys(errors).length) {
        this.message = 'Revisá los campos marcados antes de guardar.'
        return
      }

      this.saving = true
      try {
        const data = await saveProduct({ name, category, price: Number(price), symbol, color, description },
          this.selectedId === '' ? null : this.selectedId)
        this.selectedId = data.id
        this.chooseProduct()
        this.savedId = data.id
      } catch {
        this.message = 'No pudimos confirmar el guardado. Revisá el catálogo y tu acceso antes de volver a intentar.'
      } finally {
        this.saving = false
      }
    },
    askDeletion() {
      if (this.saving || this.deleting) return
      const product = this.catalog.products.find(item => item.id === this.selectedId)
      if (!product) return

      this.pendingDelete = { id: product.id, name: product.name }
      this.message = ''
      this.savedId = null
      this.$nextTick(() => this.$refs.cancelDelete?.focus())
    },
    cancelDeletion() {
      this.pendingDelete = null
      this.message = ''
      this.$nextTick(() => this.$refs.askDelete?.focus())
    },
    async confirmDeletion() {
      if (this.saving || this.deleting || !this.pendingDelete) return

      const { id, name } = this.pendingDelete
      this.deleting = true
      this.message = ''
      try {
        await deleteProduct(id)
        this.selectedId = ''
        this.chooseProduct()
        this.deletedName = name
      } catch {
        this.message = 'No pudimos confirmar la eliminación. Revisá el catálogo antes de volver a intentar.'
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>

<style scoped>
.product-form fieldset { border: 0; padding: 0; margin: 0; min-width: 0; }
.product-form legend { font-weight: 700; margin-bottom: 1rem; }
.product-form label { display: block; font-size: .9rem; font-weight: 600; margin-bottom: .35rem; }
.product-form-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 1rem; margin: 1rem 0; }
.product-form-description { grid-column: 1 / -1; }
.product-form textarea { width: 100%; font: inherit; color: inherit; border: 1px solid #cdd6cb; border-radius: 6px; padding: 12px; resize: vertical; }
.product-form .field-error { color: #8a351e; }
.product-form [aria-invalid='true'] { border-color: #a34b2b; }
.product-form-actions { display: flex; flex-wrap: wrap; gap: .75rem; }
.product-form .delete-notice { background: #fff0e9; border-color: #a34b2b; }
.product-form .delete-notice h2 { font-size: 1rem; }
.product-form .danger-button { color: white; background: #8a351e; border-color: #8a351e; }
.product-form .danger-button:hover:not(:disabled) { background: #672613; }
</style>
