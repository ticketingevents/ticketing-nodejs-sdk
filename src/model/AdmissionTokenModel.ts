import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { AdmissionToken } from '../interface/AdmissionToken'
import type { AdmissionTokenData } from '../interface/data/AdmissionTokenData'
import type { EventListing } from '../interface/EventListing'
import type { TierListing } from '../interface/TierListing'
import { TierListingModel } from './TierListingModel'

export class AdmissionTokenModel extends BaseModel implements AdmissionToken{
  public label: string
  public code: string
  public tiers: Array<TierListing>
  public event: EventListing
  public api_key: string

  constructor(token: any, adapter: APIAdapter){
    super(token.self, adapter)

    this.label = token.label
    this.code = token.code
    this.tiers = []
    this.api_key = token.api_key
    this.event = {
      id: token.event.self ? /([A-Za-z0-9\-]+)$/.exec(token.event.self)[1] : "",
      uri: token.event.self,
      title: token.event.title,
      description: token.event.description,
      start: token.event.start,
      end: token.event.end,
      host: token.event.host,
      venue: token.event.venue,
      category: token.event.category,
      subcategory: token.event.subcategory,
      disclaimer: token.event.disclaimer,
      tags: token.event.tags,
      published: token.event.published,
      banner: token.event.banner,
      thumbnail: token.event.thumbnail,
      save: (() => new Promise<boolean>((resolve) => {resolve(false)})),
      delete: (() => new Promise<boolean>((resolve) => {resolve(false)}))
    }

    for(const tier of token.tiers){
      this.tiers.push(new TierListingModel(tier, adapter))
    }
  }

  serialise(): AdmissionTokenData{
  	const tiers = []
  	for(const tier of this.tiers){
  		tiers.push(tier.id)
  	}

    const data: AdmissionTokenData = {
      label: this.label,
      tiers: tiers
    }

    return data
  }
}