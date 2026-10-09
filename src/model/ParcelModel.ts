import { APIAdapter } from '../util/APIAdapter'
import type { Account } from '../interface/Account'
import type { Parcel } from '../interface/Parcel'
import type { Transfer } from '../interface/Transfer'
import type { Lookup } from '../interface/Lookup'
import { TransferModel } from './TransferModel'
import type { TierListing } from '../interface/TierListing'
import { BadDataError, InvalidStateError, UnsupportedOperationError, PermissionError } from '../errors'

export class ParcelModel implements Parcel{
  public created: string
  public tickets: Array<{tier: TierListing, quantity: number}>

  private __apiAdapter: APIAdapter
  private __sender: Account

  constructor(apiAdapter: APIAdapter, sender: Account){
    this.created = (new Date()).toISOString()
    this.tickets = []

    this.__apiAdapter = apiAdapter
    this.__sender = sender
  }

  add(tier: TierListing, quantity: number): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      //See if tier already exists
      const tierIndex = this.__hasTier(tier)

      //Check that quantity is a valid number
      this.__sender.wallet.list().filter({tier: tier}).then(tickets => {
        if(quantity < 1){
          reject(new BadDataError(400, "The number of tickets to be added to the parcel must be a positive integer."))
        }else if(quantity > tickets.length){
          reject(new UnsupportedOperationError(400, "The customer does not own sufficient tickets in this tier to add to the parcel."))
        }else if(tierIndex < 0){
          this.tickets.push({
            tier: tier,
            quantity: quantity
          })
        }else{
          this.tickets[tierIndex].quantity += quantity
        }

        resolve(true)
      })
    })
  }

  remove(tier: TierListing, quantity: number): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      //See if tier already exists
      const tierIndex = this.__hasTier(tier)

      //Check that quantity is a valid number
      if(quantity < 1){
        reject(new BadDataError(400, "The number of tickets to be removed from the parcel must be a positive integer."))
      }else if(tierIndex < 0 || this.tickets[tierIndex].quantity < quantity){
        reject(new UnsupportedOperationError(400, "The parcel contains fewer tickets than the quantity to be removed."))
      }else{
        this.tickets[tierIndex].quantity -= quantity

        resolve(true)
      }
    })
  }

  set(tier: TierListing, quantity: number): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      //See if tier already exists
      const tierIndex = this.__hasTier(tier)

      //Check that quantity is a valid number
      this.__sender.wallet.list().filter({tier: tier}).then(tickets => {
        if(quantity < 1){
          reject(new BadDataError(400, "The target ticket quantity must be a positive integer."))
        }else if(quantity > tickets.length){
          reject(new UnsupportedOperationError(400, "The customer does not own sufficient tickets to set the quantity to the specified value."))
        }else if(tierIndex < 0){
          this.add(tier, quantity).then(success => {
            resolve(success)
          }).catch(error => {
            reject(error)
          })
        }else{
          this.tickets[tierIndex].quantity = quantity
          resolve(true)
        }
      })
    })
  }

  send(recipient: Lookup): Promise<Transfer>{
    return new Promise<Transfer>((resolve, reject) => {
      const tickets = []
      for(const item of this.tickets){
        const payload = {
          tier: item.tier.id,
          quantity: item.quantity
        }

        tickets.push(payload)
      }

      this.__apiAdapter.post(`/accounts/${this.__sender.id}/transfers`, {
        recipient: recipient.number,
        tickets: tickets
      }).then(transfer => {
        resolve(new TransferModel(transfer.data, this.__apiAdapter))
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

  private __hasTier(tier: TierListing): number{
    let tierIndex = -1

    for(let i=0; i < this.tickets.length; i++){
      if(this.tickets[i].tier.uri == tier.uri){
        tierIndex = i
      }
    }

    return tierIndex
  }
}