import { APIAdapter } from '../util/APIAdapter'
import { BaseService } from '../service/BaseService'
import { EventRevisionModel } from '../model/EventRevisionModel'
import type { EventRevisionData } from '../interface/data/EventRevisionData'
import type { EventRevision } from '../interface/EventRevision'
import type { Host } from '../interface/Host'

export class HostedEventService extends BaseService<EventRevisionData, EventRevision>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter, host: Host){
    super(apiAdapter, `${host.uri}/events`, EventRevisionModel,
      ["region", "host", "title", "status", "active", "public", "section"],
      ["alphabetical","published","popularity","start"],
      {region: "id"}
    )

    this.__apiAdapter = apiAdapter
  }
}