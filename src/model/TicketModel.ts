import { BaseModel } from './BaseModel'
import { APIAdapter } from '../util/APIAdapter'
import type { Account } from '../interface/Account'
import type { Section } from '../interface/Section'
import type { Ticket } from '../interface/Ticket'
import type { TicketData } from '../interface/data/TicketData'
import { SectionModel } from './SectionModel'

export class TicketModel extends BaseModel implements Ticket{
  public serial: string
  public status: string
  public section: Section
  public owner: Account | string
  public issued: string
  public redeemed: string

  constructor(ticket: any, owner: Account | string, adapter: APIAdapter){
    super(ticket.self, adapter)

    this.serial = ticket.serial
    this.status = ticket.status
    this.owner = owner
    this.section = new SectionModel(ticket.section, adapter)
    this.issued = ticket.issued
    this.redeemed = ticket.redeemed
  }

  serialise(): TicketData{
    const data: TicketData = {
      id: this.id,
      uri: this.uri,
      serial: this.serial,
      status: this.status,
      owner: (typeof this.owner == "object")?this.owner.uri:this.owner,
      section: this.section.uri,
      issued: this.issued,
      redeemed: this.redeemed
    }

    return data
  }
}