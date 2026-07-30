import type { Base } from './Base'
import type { Account } from './Account'
import type { CreditCard } from './CreditCard'
import type { Payment } from './Payment'
import type { TierListing } from './TierListing'

export interface Order extends Base{
  number: string
  status: string
  placed: string
  subtotal: number
  fees: number
  total: number
  items: Array<{
    tier: TierListing,
    quantity: number
  }>
  payment: Payment
  customer: Account

  cancel(): Promise<boolean>
  settle(card: CreditCard): Promise<boolean>
  refund(reason: string): Promise<boolean>
}