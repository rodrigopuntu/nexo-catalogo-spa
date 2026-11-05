export const API_URL = 'https://dummyjson.com/products?limit=6&select=id,title,description,category,price'

export async function fetchExternalProducts(signal) {
  const response = await fetch(API_URL, { signal })
  if (!response.ok) throw new Error(`El servicio respondió con el estado HTTP ${response.status}.`)
  const data = await response.json()
  if (!Array.isArray(data.products) || !data.products.every(product =>
    Number.isInteger(product.id) && typeof product.title === 'string' &&
    typeof product.description === 'string' && typeof product.category === 'string' &&
    Number.isFinite(product.price) && product.price >= 0
  )) {
    throw new Error('El servicio devolvió datos con un formato inesperado.')
  }
  return data.products
}
