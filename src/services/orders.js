import { supabase } from './supabase'

export const orderStatuses = {
  pending: 'Pendiente',
  processing: 'En preparación',
  completed: 'Completado',
  cancelled: 'Cancelado'
}

export const orderTransitions = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
}

const pageSize = 20
const dateFormat = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires'
})

export function formatOrderDate(value) {
  return dateFormat.format(new Date(value))
}

export async function createOrder(items, requestId, userId) {
  const { data, error } = await supabase.rpc('create_order', {
    p_items: items, p_request_id: requestId, p_expected_user_id: userId
  })
  if (error) throw error
  if (typeof data !== 'string') throw new Error('El pedido no devolvió un identificador.')
  return data
}

export async function listOrders({ userId, status, before } = {}) {
  let query = supabase.from('orders')
    .select('id,user_id,customer_email,created_at,status,total,items:order_items(product_id,product_name,unit_price,quantity)')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .order('product_id', { referencedTable: 'items' })
    .limit(pageSize + 1)

  if (userId) query = query.eq('user_id', userId)
  if (status) query = query.eq('status', status)
  if (before) {
    query = query.or(`created_at.lt.${before.created_at},and(created_at.eq.${before.created_at},id.lt.${before.id})`)
  }

  const { data, error } = await query
  if (error) throw error

  const orders = data.slice(0, pageSize)
  const last = orders[orders.length - 1]
  const nextPage = data.length > pageSize ? { created_at: last.created_at, id: last.id } : null
  return { orders, nextPage }
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase.rpc('update_order_status', { p_order_id: orderId, p_status: status })
  if (error) throw error
}
