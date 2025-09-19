import { APIAdapter } from '../util/APIAdapter'
import { BaseEventModel } from './BaseEventModel'
import { HostModel } from './HostModel'
import type { Event } from '../interface/Event'

export class EventModel extends BaseEventModel implements Event{
  public host: HostModel

  constructor(event: any, adapter: APIAdapter){
    super(event, adapter)
    this.host = new HostModel(event.host, adapter)
  }
}