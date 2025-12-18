import type { Account } from './Account'
import type { Lookup } from './Lookup'
import type { Transfer } from './Transfer'
import type { Section } from './Section'

export interface Parcel{
  initiated: string
  tickets: Array<{section: Section, quantity: number}>

  add(section: Section, quantity: number): Promise<boolean>
  remove(section: Section, quantity: number): Promise<boolean>
  set(section: Section, quantity: number): Promise<boolean>
  send(sender: Account, recipient: Lookup): Promise<Transfer>
}