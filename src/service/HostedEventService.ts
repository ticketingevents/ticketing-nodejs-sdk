import { APIAdapter } from '../util/APIAdapter'
import { BaseService } from '../service/BaseService'
import { BaseEventModel } from '../model/BaseEventModel'
import type { EventData } from '../interface/data/EventData'
import type { Event } from '../interface/Event'
import type { Host } from '../interface/Host'

export class HostedEventService extends BaseService<EventData, Event>{
  private __apiAdapter: APIAdapter
  private __host: Host

  constructor(apiAdapter: APIAdapter, host: Host){
    super(apiAdapter, `${host.uri}/events`, BaseEventModel,
      ["region", "host", "title", "status", "active", "public", "section"],
      ["alphabetical","published","popularity","start"]
    )

    this.__apiAdapter = apiAdapter
    this.__host = host
  }

  protected _preprocessCriteria(criteria: {[key: string]: any}){
    criteria.region = criteria.region?criteria.region.id:null
    return criteria
  }

  protected _instantiateModel(data: any){
    const event: Event = new BaseEventModel(data, this.__apiAdapter)
    event.host = this.__host

    return event
  }
}