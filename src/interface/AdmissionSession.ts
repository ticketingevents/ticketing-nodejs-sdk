import { EventListing } from './EventListing'
import { TierListing } from './TierListing'
import {
  TicketService, AdmissionService
} from '../model/AdmissionSessionModel'

export interface AdmissionSession{
  started: string
  name: string
  device: string
  code: string
  event: EventListing
  tiers: Array<TierListing>

  tickets: TicketService
  admissions: AdmissionService
  end(): Promise<boolean>
}