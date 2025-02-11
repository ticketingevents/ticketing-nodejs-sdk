import { BaseService } from './BaseService'

import { APIAdapter } from '../util'
import { TicketData, Ticket } from '../interface'
import { TicketModel, EventModel } from '../model'

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