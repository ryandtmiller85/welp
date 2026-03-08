// Printify API client for welp. merch fulfillment
const PRINTIFY_API = 'https://api.printify.com/v1'
function getToken(): string {
  const token = process.env.PRINTIFY_API_TOKEN
  if (!token) throw new Error('PRINTIFY_API_TOKEN is not set')
  return token
}
async function printifyFetch(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${PRINTIFY_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const msg = data?.message || data?.error || `Printify API error ${res.status}`
    console.error('Printify API error:', { status: res.status, path, data })
    throw new Error(msg)
  }
  return data
}
export async function getShops(): Promise<{ id: number; title: string }[]> {
  return printifyFetch('/shops.json')
}
export async function getShopId(): Promise<number> {
  if (process.env.PRINTIFY_SHOP_ID) {
    return parseInt(process.env.PRINTIFY_SHOP_ID, 10)
  }
  const shops = await getShops()
  if (shops.length === 0) throw new Error('No Printify shops found')
  return shops[0].id
}
export interface Blueprint {
  id: number
  title: string
  description: string
  brand: string
  model: string
}
export async function getBlueprints(): Promise<Blueprint[]> {
  return printifyFetch('/catalog/blueprints.json')
}
export async function getBlueprintProviders(blueprintId: number) {
  return printifyFetch(`/catalog/blueprints/${blueprintId}/print_providers.json`)
}
export async function getProviderVariants(blueprintId: number, providerId: number) {
  return printifyFetch(`/catalog/blueprints/${blueprintId}/print_providers/${providerId}/variants.json`)
}
export interface PrintifyImage {
  id: string
  file_name: string
  height: number
  width: number
  size: number
  mime_type: string
  preview_url: string
  upload_time: string
}
export async function uploadImageFromUrl(fileName: string, url: string): Promise<PrintifyImage> {
  return printifyFetch('/uploads/images.json', { method: 'POST', body: JSON.stringify({ file_name: fileName, url }) })
}
export async function uploadImageBase64(fileName: string, contents: string): Promise<PrintifyImage> {
  return printifyFetch('/uploads/images.json', { method: 'POST', body: JSON.stringify({ file_name: fileName, contents }) })
}
export async function getImages(): Promise<PrintifyImage[]> {
  const result = await printifyFetch('/uploads/images.json')
  return result.data || result
}
export interface ProductVariant {
  id: number
  price: number
  is_enabled: boolean
}
export interface PrintArea {
  variant_ids: number[]
  placeholders: { position: string; images: { id: string; x: number; y: number; scale: number; angle: number }[] }[]
}
export interface CreateProductPayload {
  title: string
  description: string
  blueprint_id: number
  print_provider_id: number
  variants: ProductVariant[]
  print_areas: PrintArea[]
}
export async function createProduct(shopId: number, product: CreateProductPayload) {
  return printifyFetch(`/shops/${shopId}/products.json`, { method: 'POST', body: JSON.stringify(product) })
}
export async function getProducts(shopId: number) {
  return printifyFetch(`/shops/${shopId}/products.json`)
}
export async function getProduct(shopId: number, productId: string) {
  return printifyFetch(`/shops/${shopId}/products/${productId}.json`)
}
export async function publishProduct(shopId: number, productId: string) {
  return printifyFetch(`/shops/${shopId}/products/${productId}/publish.json`, { method: 'POST', body: JSON.stringify({ title: true, description: true, images: true, variants: true, tags: true }) })
}
export interface OrderLineItem {
  product_id: string
  variant_id: number
  quantity: number
}
export interface OrderAddress {
  first_name: string
  last_name: string
  email: string
  phone?: string
  country: string
  region: string
  address1: string
  address2?: string
  city: string
  zip: string
}
export interface CreateOrderPayload {
  external_id: string
  label: string
  line_items: OrderLineItem[]
  shipping_method: number
  send_shipping_notification: boolean
  address_to: OrderAddress
}
export async function updateProduct(shopId: number, productId: string, data: Partial<CreateProductPayload>) {
  return printifyFetch(`/shops/${shopId}/products/${productId}.json`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteProduct(shopId: number, productId: string) {
  return printifyFetch(`/shops/${shopId}/products/${productId}.json`, {
    method: 'DELETE',
  })
}

export async function unpublishProduct(shopId: number, productId: string) {
  return printifyFetch(`/shops/${shopId}/products/${productId}/unpublish.json`, {
    method: 'POST',
    body: JSON.stringify({ title: true, description: true, images: true, variants: true, tags: true }),
  })
}

export async function notifyPublishingSucceeded(shopId: number, productId: string, externalId: string) {
  return printifyFetch(`/shops/${shopId}/products/${productId}/publishing_succeeded.json`, {
    method: 'POST',
    body: JSON.stringify({ external: { id: externalId, handle: `https://alliswelp.com/merch` } }),
  })
}

export async function createOrder(shopId: number, order: CreateOrderPayload) {
  return printifyFetch(`/shops/${shopId}/orders.json`, { method: 'POST', body: JSON.stringify(order) })
}
export async function getOrders(shopId: number) {
  return printifyFetch(`/shops/${shopId}/orders.json`)
}
export async function getOrder(shopId: number, orderId: string) {
  return printifyFetch(`/shops/${shopId}/orders/${orderId}.json`)
}