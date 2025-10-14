import type { Account } from './Account'
import type { Order } from './Order'
import type { Section } from './Section'

export interface Cart{
  created: string
  subtotal: number
  fees: number
  total: number
  items: Array<{section: Section, quantity: number, total: number}>

  add(section: Section, quantity: number): Promise<boolean>
  remove(section: Section, quantity: number): Promise<boolean>
  set(section: Section, quantity: number): Promise<boolean>
  checkout(customer: Account): Promise<Order>
}