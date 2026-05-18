import { Base } from './Base'
import { EventRevision } from './EventRevision'

export interface Tier extends Base{
	name: string
	description: string
	price: number
	capacity: number
	available_from: string
	available_to: string
	events: Promise<Array<{
		event: EventRevision,
		share: number
	}>>
  	artwork: string
	unit_size: number
	purchase_limit: number
	purchase_note: string
	complimentary: boolean
	transferrable: boolean
	upgrades: Array<Tier>
}