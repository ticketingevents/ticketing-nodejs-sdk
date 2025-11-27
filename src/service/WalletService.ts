import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { TicketModel } from '../model/TicketModel'
import type { Account } from '../interface/Account'
import type { TicketData } from '../interface/data/TicketData'
import type { Ticket } from '../interface/Ticket'

export class WalletService extends BaseService<TicketData, Ticket>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter, account: Account){
    super(apiAdapter, `${account.uri}/tickets`, TicketModel,
      ["event", "section", "serial", "status"],
      [],
      {event: "id", section: "id"}
    )

    this.__apiAdapter = apiAdapter
  }

  protected _instantiateModel(data: any){
    const owner = `${data.owner.firstName} ${data.owner.lastName} (${data.owner.username})`
    return new TicketModel(data, owner, this.__apiAdapter)
  }
}