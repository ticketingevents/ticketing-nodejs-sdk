import { BaseModel } from './BaseModel'
import { APIAdapter } from '../util/APIAdapter'
import type { AccountListing } from '../interface/AccountListing'
import { AccountListingModel } from './AccountListingModel'
import type { Ticket } from '../interface/Ticket'
import type { TicketData } from '../interface/data/TicketData'
import type { TierListing } from '../interface/TierListing'
import { TierListingModel } from './TierListingModel'

export class TicketModel extends BaseModel implements Ticket{
  public serial: string
  public status: string
  public tier: TierListing
  public customer: AccountListing
  public issued: string
  public redeemed: string
  public details: {[key: string]: string}

  constructor(ticket: any, adapter: APIAdapter){
    super(ticket.self, adapter)

    this.serial = ticket.serial
    this.status = ticket.status
    this.customer = new AccountListingModel(ticket.customer, adapter)
    this.tier = new TierListingModel(ticket.tier, adapter)
    this.issued = ticket.issued
    this.redeemed = ticket.redeemed
    this.details = ticket.details
  }

  serialise(): TicketData{
    const data: TicketData = {
      serial: this.serial,
      status: this.status,
      customer: this.customer.uri,
      tier: this.tier.uri,
      issued: this.issued,
      redeemed: this.redeemed,
      details: this.details
    }

    return data
  }
}