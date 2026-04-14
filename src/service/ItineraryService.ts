import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { EventRevisionModel } from '../model/EventRevisionModel'
import type { Account } from '../interface/Account'
import type { EventRevisionData } from '../interface/data/EventRevisionData'
import type { EventRevision } from '../interface/EventRevision'

export class ItineraryService extends BaseService<EventRevisionData, EventRevision>{
  constructor(apiAdapter: APIAdapter, account: Account){
    super(apiAdapter, `${account.uri}/events`, EventRevisionModel,
      ["active"],
      ["alphabetical","published","popularity","start"]
    )
  }
}