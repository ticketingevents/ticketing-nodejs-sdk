import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Account } from '../interface/Account'
import type { Event } from '../interface/Event'
import type { Section } from '../interface/Section'
import type { Transfer } from '../interface/Transfer'
import type { TransferData } from '../interface/data/TransferData'
import { EventModel } from './EventModel'
import { SectionModel } from './SectionModel'
import { BadDataError, InvalidStateError, PermissionError } from '../errors'

export class TransferModel extends BaseModel implements Transfer{
  public status: string
  public initiated: string
  public tickets: Array<{
    event: Event,
    section: Section,
  	quantity: number
  }>
  public sender: Account | string
  public recipient: Account | string

  private __claimsURI: string

  constructor(transfer: any, sender: Account | string, recipient: Account | string, adapter: APIAdapter){
    super(transfer.self, adapter)

    this.status = transfer.status
    this.initiated = transfer.initiated
    this.sender = sender
    this.recipient = recipient


    this.tickets = []
    for(const ticket of transfer.tickets){
      this.tickets.push({
        event: new EventModel(ticket.event, adapter),
        section: new SectionModel(ticket.section, adapter),
        quantity: ticket.quantity
      })
    }

    this.__claimsURI = transfer.claims
  }

  cancel(): Promise<boolean>{
  	return new Promise((resolve, reject) => {
  		this.delete().then(deleted => {
  			this.status = "Cancelled"
  			resolve(deleted)
  		}).catch(error => {
			if(error.code == 409){
				error = new InvalidStateError(error.code, error.message)
			}

			reject(error)
  		})
  	})
  }

  claim(): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.post(this.__claimsURI, {}).then(response => {
      	this.status = "Claimed"
    	resolve(response.data.success)
      }).catch(error => {
        if(error.code == 400){
          error = new BadDataError(error.code, error.message)
        }else if(error.code == 403){
          error = new PermissionError(error.code, error.message)
        }else if(error.code == 409){
          error = new InvalidStateError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  serialise(): TransferData{
  	const tickets = {}
  	for(const ticket of this.tickets){
  		tickets[ticket.section.uri] = ticket.quantity
  	}

    return {
      sender: (typeof this.sender == "object")?this.sender.number:this.sender,
      recipient: (typeof this.recipient == "object")?this.recipient.number:this.recipient,
      tickets: tickets
    }
  }
}