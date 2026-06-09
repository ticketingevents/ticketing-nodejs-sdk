import { Collection } from '../util/Collection'
import { Admission } from './Admission'
import { EventListing } from './EventListing'
import { TierListing } from './TierListing'
import { Ticket } from './Ticket'

export interface AdmissionSession{
  started: string
  name: string
  device: string
  code: string
  event: EventListing
  tiers: Array<TierListing>

  admissions(pageLength: number): Collection<Admission>
  tickets(pageLength: number): Collection<Ticket>
  admit(serials: string[]): Promise<Array<Admission>>
  end(): Promise<boolean>
}