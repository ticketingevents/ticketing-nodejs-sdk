import { APIAdapter } from '../util/APIAdapter'
import type { TierListing } from '../interface/TierListing'
import { BaseModel } from './BaseModel'

export class TierListingModel extends BaseModel implements TierListing{
	public name: string
	public description: string
	public price: number
	public available_from: string
	public available_to: string
	public unit_size: number
	public remaining: number
	public upgrades: Array<TierListing>

	private __artworkUrl: string
	private __artworkData: string

  constructor(tier: any, adapter: APIAdapter){
		super(tier.self, adapter)

		this.name = tier.name
		this.description = tier.description
		this.price = tier.price
		this.available_from = tier.available_from
		this.available_to = tier.available_to
		this.unit_size = tier.unit_size

		this.upgrades = []
		for(const upgrade of tier.upgrades){
			this.upgrades.push(new TierListingModel(upgrade, adapter))
		}

		this.__artworkUrl = tier.artwork
		this.__artworkData = ""
  }

  get artwork(){
    return this.__artworkUrl
  }

  set artwork(artworkData: string){
    this.__artworkData = artworkData
  }
}