// Respaldo del catálogo para la demo portátil o cuando Supabase no responde.
export const products = [
  { id: 1, name: 'Auriculares Studio', category: 'Audio', price: 89900, symbol: '🎧', color: 'lavender', description: 'Auriculares de diadema para acompañar tus sesiones de estudio y música.' },
  { id: 2, name: 'Teclado compacto', category: 'Escritorio', price: 64900, symbol: '⌨️', color: 'sand', description: 'Un teclado de formato compacto para un escritorio más despejado.' },
  { id: 3, name: 'Parlante portátil', category: 'Audio', price: 45900, symbol: '🔊', color: 'mint', description: 'Un parlante de tamaño reducido para llevar tu música a distintos espacios.' },
  { id: 4, name: 'Cámara instantánea', category: 'Accesorios', price: 159900, symbol: '📷', color: 'peach', description: 'Una cámara de estilo instantáneo para guardar tus momentos favoritos.' },
  { id: 5, name: 'Mouse inalámbrico', category: 'Escritorio', price: 24900, symbol: '🖱️', color: 'mint', description: 'Un mouse cómodo para las tareas de todos los días.' },
  { id: 6, name: 'Reloj digital', category: 'Accesorios', price: 72900, symbol: '⌚', color: 'lavender', description: 'Un reloj digital de diseño sencillo para complementar tu rutina.' },
  { id: 7, name: 'Micrófono de mesa', category: 'Audio', price: 99900, symbol: '🎙️', color: 'sand', description: 'Un micrófono para videollamadas, grabaciones y proyectos personales.' },
  { id: 8, name: 'Lámpara de escritorio', category: 'Escritorio', price: 38900, symbol: '💡', color: 'peach', description: 'Una lámpara para iluminar tu espacio de lectura y trabajo.' },
  { id: 9, name: 'Mochila urbana', category: 'Accesorios', price: 54900, symbol: '🎒', color: 'sand', description: 'Una mochila para organizar tus objetos y llevarlos con vos.' },
  { id: 10, name: 'Auriculares compactos', category: 'Audio', price: 39900, symbol: '🎵', color: 'peach', description: 'Una alternativa pequeña para escuchar música durante tus recorridos.' },
  { id: 11, name: 'Monitor de escritorio', category: 'Escritorio', price: 229900, symbol: '🖥️', color: 'lavender', description: 'Una pantalla para ampliar tu espacio de trabajo y estudio.' },
  { id: 12, name: 'Soporte para teléfono', category: 'Accesorios', price: 12900, symbol: '📱', color: 'mint', description: 'Un soporte para mantener el teléfono a la vista sobre el escritorio.' },
  { id: 13, name: 'Radio de mesa', category: 'Audio', price: 58900, symbol: '📻', color: 'mint', description: 'Una radio de inspiración clásica para tu rincón favorito.' },
  { id: 14, name: 'Calculadora de mesa', category: 'Escritorio', price: 18900, symbol: '🧮', color: 'peach', description: 'Una calculadora práctica para estudiar y organizar tus cuentas.' },
  { id: 15, name: 'Batería portátil', category: 'Accesorios', price: 32900, symbol: '🔋', color: 'lavender', description: 'Una batería portátil para acompañarte fuera de casa.' }
]

export function formatPrice(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0
  }).format(value)
}

export function categoryKey(category) {
  return category.trim().normalize('NFC').toLocaleLowerCase('es')
}

export function getCategories(products) {
  const categories = new Map()
  for (const { category, symbol } of products) {
    const key = categoryKey(category)
    if (!key || categories.has(key)) continue
    const name = category.trim()
    categories.set(key, { name: name.charAt(0).toLocaleUpperCase('es') + name.slice(1), symbol })
  }
  return [...categories.values()]
}
