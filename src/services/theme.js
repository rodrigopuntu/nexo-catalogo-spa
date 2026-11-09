import { reactive, readonly } from 'vue'

const storageKey = 'nexo.theme'
const root = document.documentElement
const state = reactive({ dark: root.dataset.theme === 'dark' })

export const theme = readonly(state)

export function toggleTheme() {
  state.dark = !state.dark
  root.dataset.theme = state.dark ? 'dark' : 'light'
  try {
    window.localStorage.setItem(storageKey, root.dataset.theme)
  } catch {
    // The toggle still works when the browser blocks persistent storage.
  }
}
