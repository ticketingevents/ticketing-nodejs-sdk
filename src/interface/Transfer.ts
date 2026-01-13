import type { Base } from './Base'
import type { Account } from './Account'
import type { Event } from './Event'
import type { Section } from './Section'

export interface Transfer extends Base{
  status: string
  initiated: string
  tickets: Array<{
    event: Event,
    section: Section,
    quantity: number
  }>
  sender: Account | string
  recipient: Account | string

  cancel(): Promise<boolean>
  claim(): Promise<boolean>
}