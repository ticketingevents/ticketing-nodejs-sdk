import { APIAdapter } from '../util/APIAdapter'
import type { Account } from '../interface/Account'
import type { Parcel } from '../interface/Parcel'
import type { Transfer } from '../interface/Transfer'
import type { Lookup } from '../interface/Lookup'
import { AccountModel } from './AccountModel'
import { TransferModel } from './TransferModel'
import type { Section } from '../interface/Section'
import { BadDataError, InvalidStateError, UnsupportedOperationError } from '../errors'

export class ParcelModel implements Parcel{
  public initiated: string
  public tickets: Array<{section: Section, quantity: number}>

  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter){
    this.initiated = (new Date()).toISOString()
    this.tickets = []

    this.__apiAdapter = apiAdapter
  }

  add(section: Section, quantity: number): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      //See if section already exists
      const sectionIndex = this.__hasSection(section)

      //Check that quantity is a valid number
      if(quantity < 1){
        reject(new BadDataError(400, "The number of tickets to be added to the parcel must be a positive integer."))
      }else if(sectionIndex < 0){
        this.tickets.push({
          section: section,
          quantity: quantity
        })

        resolve(true)
      }else{
        this.tickets[sectionIndex].quantity += quantity

        resolve(true)
      }
    })
  }

  remove(section: Section, quantity: number): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      //See if section already exists
      const sectionIndex = this.__hasSection(section)

      //Check that quantity is a valid number
      if(quantity < 1){
        reject(new BadDataError(400, "The number of tickets to be removed from the parcel must be a positive integer."))
      }else if(sectionIndex < 0 || this.tickets[sectionIndex].quantity < quantity){
        reject(new UnsupportedOperationError(400, "The parcel contains fewer tickets than the quantity to be removed."))
      }else{
        this.tickets[sectionIndex].quantity -= quantity

        resolve(true)
      }
    })
  }

  set(section: Section, quantity: number): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      //See if section already exists
      const sectionIndex = this.__hasSection(section)

      //Check that quantity is a valid number
      if(quantity < 1){
        reject(new BadDataError(400, "The ticket quantity must be a positive integer."))
      }else if(sectionIndex < 0){
        this.add(section, quantity).then(success => {
          resolve(success)
        }).catch(error => {
          reject(error)
        })
      }else{
        this.tickets[sectionIndex].quantity = quantity

        resolve(true)
      }
    })
  }

  send(sender: Account, recipient: Lookup): Promise<Transfer>{
    return new Promise<Transfer>((resolve, reject) => {
		if(recipient.identification == sender.username || recipient.identification == sender.email){
      reject(new InvalidStateError(409, "The sender cannot transfer tickets to themselves."))
		}else{
			const tickets = {}
			for(const ticket of this.tickets){
				tickets[ticket.section.uri] = ticket.quantity
			}

			this.__apiAdapter.post("/transfers", {
				sender: sender.number,
				recipient: recipient.identification,
				tickets: tickets
			}).then(transfer => {
				resolve(new TransferModel(transfer.data, sender, new AccountModel(transfer.data.recipient, this.__apiAdapter), this.__apiAdapter))
			}).catch(error => {
				if(error.code == 400){
			  		error = new BadDataError(error.code, error.message)
				}

				reject(error)
			})
		}
    })
  }

  private __hasSection(section: Section): number{
    let sectionIndex = -1

    for(let i=0; i < this.tickets.length; i++){
      if(this.tickets[i].section.uri == section.uri){
        sectionIndex = i
      }
    }

    return sectionIndex
  }
}