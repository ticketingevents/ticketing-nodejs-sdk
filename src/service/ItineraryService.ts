import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { EventModel } from '../model/EventModel'
import type { Account } from '../interface/Account'
import type { EventData } from '../interface/data/EventData'
import type { Event } from '../interface/Event'

export class ItineraryService extends BaseService<EventData, Event>{
  constructor(apiAdapter: APIAdapter, account: Account){
    super(apiAdapter, `${account.uri}/events`, EventModel,
      ["active"],
      ["alphabetical","published","popularity","start"]
    )
  }
}