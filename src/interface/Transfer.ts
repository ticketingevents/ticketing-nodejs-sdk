import type { Base } from './Base'
import type { Account } from './Account'

export interface Transfer extends Base{
  status: string
  initiated: string
  tickets: Array<{
  	section: string,
  	name: string,
  	description: string
  	quantity: number
  }>
  sender: Account | string
  recipient: Account | string

  cancel(): Promise<boolean>
  claim(): Promise<boolean>
}