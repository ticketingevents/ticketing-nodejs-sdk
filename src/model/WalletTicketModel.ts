import { BaseModel } from './BaseModel'
import { APIAdapter } from '../util/APIAdapter'
import type { Ticket } from '../interface/Ticket'
import type { TicketData } from '../interface/data/TicketData'
import { SectionModel } from './SectionModel'

export class WalletTicketModel extends BaseModel implements Ticket{
  public serial: string
  public status: string
  public section: SectionModel
  public issued: string
  public redeemed: string

  constructor(ticket: any, adapter: APIAdapter){
    super(ticket.self, adapter)

    this.serial = ticket.serial
    this.status = ticket.status
    this.section = new SectionModel(ticket.section, adapter)
    this.issued = ticket.issued
    this.redeemed = ticket.redeemed
  }

  serialise(): TicketData{
    const data: TicketData = {
      serial: this.serial,
      status: this.status,
      section: this.section.uri,
      issued: this.issued,
      redeemed: this.redeemed
    }

    return data
  }
}