import { Collection } from '../util/Collection'
import { Admission } from './Admission'
import { EventRevision } from './EventRevision'
import { Section } from './Section'
import { Ticket } from './Ticket'

export interface AdmissionSession{
  started: string
  name: string
  device: string
  code: string
  event: EventRevision
  sections: Array<Section>

  admissions(pageLength: number): Collection<Admission>
  tickets(pageLength: number): Collection<Ticket>
  admit(serials: string[]): Promise<Array<Admission>>
  end(): Promise<boolean>
}