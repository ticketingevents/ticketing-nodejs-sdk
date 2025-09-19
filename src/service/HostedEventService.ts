import { APIAdapter } from '../util/APIAdapter'
import { BaseService } from '../service/BaseService'
import { BaseEventModel } from '../model/BaseEventModel'
import type { EventData } from '../interface/data/EventData'
import type { Event } from '../interface/Event'
import type { Host } from '../interface/Host'

export class HostedEventService extends BaseService<EventData, Event>{
  constructor(apiAdapter: APIAdapter, host: Host){
    super(apiAdapter, `${host.uri}/events`, BaseEventModel,
      ["region", "host", "title", "status", "active", "public", "section"],
      ["alphabetical","published","popularity","start"]
    )
  }
}