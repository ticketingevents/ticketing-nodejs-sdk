import type { Base } from './Base'
import type { Account } from './Account'
import type { CreditCard } from './CreditCard'

export interface Order extends Base{
  number: string
  status: string
  placed: string
  subtotal: number
  fees: number
  total: number
  items: Array<{
  	section: string,
  	number: string,
  	name: string,
  	description: string,
  	price: number,
  	quantity: number
  }>
  customer: Account

  cancel(): Promise<boolean>
  settle(card: CreditCard): Promise<boolean>
  refund(reason: string): Promise<boolean>
}