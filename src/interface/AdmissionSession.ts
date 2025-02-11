import { Collection } from '../util'
import { Admission } from './Admission'
import { Event } from './Event'
import { Section } from './Section'
import { Ticket } from './Ticket'

export interface AdmissionSession{
  started: string
  name: string
  device: string
  code: string
  event: Event
  sections: Array<Section>
  admissions: Collection<Admission>
  tickets: Collection<Ticket>

  admit(serials: string[]): Promise<Array<Admission>>
  end(): Promise<boolean>
}