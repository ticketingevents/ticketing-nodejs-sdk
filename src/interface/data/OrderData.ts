export interface OrderData{
  customer: string
  items: Array<{tier: string, quantity: number}>
}