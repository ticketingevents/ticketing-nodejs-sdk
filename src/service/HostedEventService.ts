import { APIAdapter } from '../util'
import { BaseService } from '../service/BaseService'
import { EventModel } from '../model'
import { EventData, Event, Host } from '../interface'

export class HostedEventService extends BaseService<EventData, Event>{
  constructor(apiAdapter: APIAdapter, host: Host){
    super(apiAdapter, `${host.uri}/events`, EventModel,
      ["region", "host", "title", "status", "active", "public", "section"],
      ["alphabetical","published","popularity","start"]
    )
  }
}