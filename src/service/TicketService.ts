import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import type { TicketData } from '../interface/data/TicketData'
import type { Ticket } from '../interface/Ticket'
import { AccountModel } from '../model/AccountModel'
import { EventListingModel } from '../model/EventListingModel'
import { TicketModel } from '../model/TicketModel'

export class TicketService extends BaseService<TicketData, Ticket>{
  private __apiAdapter: APIAdapter
  private __ticket: TicketModel

  constructor(apiAdapter: APIAdapter, event: EventListingModel){
    super(apiAdapter, `${event.uri}/tickets`, TicketModel, ["modified_since"])

    this.__apiAdapter = apiAdapter
  }

  protected _instantiateModel(data: any){
    const owner = new AccountModel(data.owner, this.__apiAdapter)
    return new TicketModel(data, owner, this.__apiAdapter)
  }
}