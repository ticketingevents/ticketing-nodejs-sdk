import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { WalletTicketModel } from '../model/WalletTicketModel'
import type { Account } from '../interface/Account'
import type { TicketData } from '../interface/data/TicketData'
import type { Ticket } from '../interface/Ticket'

export class WalletService extends BaseService<TicketData, Ticket>{
  constructor(apiAdapter: APIAdapter, account: Account){
    super(apiAdapter, `${account.uri}/tickets`, WalletTicketModel,
      ["event", "section", "serial", "status"]
    )
  }

  protected _preprocessCriteria(criteria: {[key: string]: any}){
    criteria.event = criteria.event?criteria.event.id:null
    criteria.section = criteria.section?criteria.section.id:null

    return criteria
  }
}