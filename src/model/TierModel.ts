import { APIAdapter } from '../util/APIAdapter'
import type { Tier } from '../interface/Tier'
import type { TierData } from '../interface/data/TierData'
import { BaseModel } from './BaseModel'
import type { EventRevision } from '../interface/EventRevision'
import { EventRevisionModel } from './EventRevisionModel'
import { BadDataError } from '../errors'

export class TierModel extends BaseModel implements Tier{
	public name: string
	public description: string
	public price: number
	public capacity: number
	public available_from: string
	public available_to: string
	public unit_size: number
	public purchase_limit: number
	public purchase_note: string
	public complimentary: boolean
	public transferrable: boolean
	public upgrades: Array<Tier>

	private __events: Array<{id: string, share: number}>
	private __loaded_events: Array<{event: EventRevision, share: number}>
	private __artworkUrl: string
	private __artworkData: string

  constructor(tier: any, adapter: APIAdapter){
		super(tier.self, adapter)

		this.name = tier.name
		this.description = tier.description
		this.price = tier.price
		this.capacity = tier.capacity
		this.available_from = tier.available_from
		this.available_to = tier.available_to
		this.unit_size = tier.unit_size
		this.purchase_limit = tier.purchase_limit
		this.purchase_note = tier.purchase_note
		this.complimentary = tier.complimentary
		this.transferrable = tier.transferrable

		this.upgrades = []
		for(const upgrade of tier.upgrades){
			this.upgrades.push(new TierModel(upgrade, adapter))
		}

		this.__events = tier.events
		this.__loaded_events = []
		this.__artworkUrl = tier.artwork
		this.__artworkData = ""
  }

  get events(): Promise<Array<{event: EventRevision, share: number}>>{
  	return new Promise((resolve, reject) => {
			const eventShares = {}
			for(const event of this.__events){
				eventShares[event.id] = event.share
			}

			this._apiAdapter.get(
				this.uri.replace(`tiers/${this.id}`,`events?tier=${this.id}`)
			).then(response => {
				this.__loaded_events = []
				
				for(const entry of response.data.entries){
					this.__loaded_events.push({
						event: new EventRevisionModel(entry, this._apiAdapter),
						share: eventShares[/([A-Za-z0-9\-]+)$/.exec(entry.self)[1]]
					})
				}

				resolve(new Proxy(this.__loaded_events, {
				  get(target, property) {
					  if (typeof property !== 'string') {
					    return Reflect.get(target, property)
					  }

				    if (['pop', 'shift', 'splice'].includes(property)) {
				      return function(...args) {
				        const result = target[property](...args)
				        return result
				      }
				    }

				    return target[property];
				  },
					set(target, property, value, receiver){
					  if (typeof property !== 'string') {
					    return Reflect.set(target, property, value)
					  }

						const index = parseInt(property)
						if(!isNaN(index)){
			        if(!(value.event instanceof EventRevisionModel)){
			          reject(new BadDataError(400, "One or more of the specified events is not a valid EventRevision."))
			        }

			        target[index] = value
						}

						return Reflect.set(target, property, value, receiver)
					}
				}))
			}).catch(error => {
				reject(error)
			})
  	})
  }

  get artwork(){
    return this.__artworkUrl
  }

  set artwork(artworkData: string){
    this.__artworkData = artworkData
  }

  serialise(): TierData{
  	const events = []
  	for(const event of this.__loaded_events){
  		events.push({
  			id: event.event.id,
  			share: event.share
  		})
  	}

  	const upgrades = []
  	for(const upgrade of this.upgrades){
  		upgrades.push(upgrade.id)
  	}

		const data: TierData = {
			name: this.name,
			description: this.description,
			price: this.price,
			capacity: this.capacity,
			available_from: this.available_from,
			available_to: this.available_to,
			events: events,
			unit_size: this.unit_size,
			purchase_limit: this.purchase_limit,
			purchase_note: this.purchase_note,
			complimentary: this.complimentary,
			transferrable: this.transferrable,
			upgrades: upgrades
		}

    if(this.__artworkData){
      data.artwork = this.__artworkData
    }

    return data
  }
}