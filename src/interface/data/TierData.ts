import { Tier } from '../Tier'
import { EventRevision } from '../EventRevision'

export interface TierData{
	name: string
	description: string
	price: number
	capacity: number
	available_from: string
	available_to: string
	events: Array<{
		id?: string,
		event?: EventRevision,
		share: number
	}>
  	artwork?: string
	unit_size?: number
	purchase_limit?: number
	purchase_note?: string
	complimentary?: boolean
	transferrable?: boolean
	upgrades?: Array<Tier>
}