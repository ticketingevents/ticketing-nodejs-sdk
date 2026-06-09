import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { EventListingModel } from '../model/EventListingModel'
import type { Account } from '../interface/Account'
import type { EventListing } from '../interface/EventListing'

export class ItineraryService extends BaseService<EventListing, EventListing>{
  constructor(apiAdapter: APIAdapter, account: Account){
    super(apiAdapter, `${account.uri}/events`, EventListingModel,
      ["active"],
      ["alphabetical","published","popularity","start"]
    )
  }
}