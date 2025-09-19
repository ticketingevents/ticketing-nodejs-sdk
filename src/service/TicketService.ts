import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import type { TicketData } from '../interface/data/TicketData'
import type { Ticket } from '../interface/Ticket'
import { EventModel } from '../model/EventModel'
import { TicketModel } from '../model/TicketModel'

export class TicketService extends BaseService<TicketData, Ticket>{
  private __apiAdapter: APIAdapter
  private __ticket: TicketModel
  private __event: EventModel

  constructor(apiAdapter: APIAdapter, event: EventModel){
    super(apiAdapter, `${event.uri}/tickets`, TicketModel, ["modified_since"])

    this.__apiAdapter = apiAdapter
    this.__event = event
  }

  protected _instantiateModel(data: any){
    return new TicketModel(data, this.__event, this.__apiAdapter)
  }
}