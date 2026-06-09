import { Base } from './Base'

export interface TierListing extends Base{
	name: string
	description: string
	price: number
	available_from: string
	available_to: string
  	artwork: string
	unit_size: number
	remaining: number
	upgrades: Array<TierListing>
}