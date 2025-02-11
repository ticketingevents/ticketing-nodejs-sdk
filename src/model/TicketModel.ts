import { BaseModel } from './BaseModel'
import { APIAdapter } from '../util'
import { Ticket } from '../interface/Ticket'
import { TicketData } from '../interface/data/TicketData'
import { AccountModel } from './AccountModel'
import { EventModel } from './EventModel'
import { SectionModel } from './SectionModel'

export class TicketModel extends BaseModel implements Ticket{
  public serial: string
  public status: string
  public section: SectionModel
  public owner: AccountModel
  public issued: string
  public redeemed: string
  
  private __event: EventModel

  constructor(ticket: any, event: EventModel, adapter: APIAdapter){
    super(ticket.self, adapter)

    this.serial = ticket.serial
    this.status = ticket.status
    this.owner = new AccountModel(ticket.owner, adapter)
    this.section = new SectionModel(ticket.section, adapter)
    this.issued = ticket.issued
    this.redeemed = ticket.redeemed

    this.__event = event
  }

  serialise(): TicketData{
    const data: TicketData = {
      serial: this.serial,
      status: this.status,
      owner: this.owner.uri,
      section: this.section.uri,
      issued: this.issued,
      redeemed: this.redeemed
    }

    return data
  }
}