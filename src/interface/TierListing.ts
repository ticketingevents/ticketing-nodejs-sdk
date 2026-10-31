import { Base } from './Base'
import { Form } from './Form'

export interface TierListing extends Base{
	name: string
	description: string
	price: number
	available_from: string
	available_to: string
  	artwork: string
	unit_size: number
	transferrable: boolean
	purchase_limit: number
	remaining: number
	upgrades: Array<TierListing>
  	form: Form
}