import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Transfer } from '../interface/Transfer'
import type { TierListing } from '../interface/TierListing'
import { TierListingModel } from '../model/TierListingModel'
import type { AccountListing } from '../interface/AccountListing'
import { AccountListingModel } from '../model/AccountListingModel'
import { InvalidStateError, PermissionError } from '../errors'

export class TransferModel extends BaseModel implements Transfer{
  public status: string
  public initiated: string
  public completed: string
  public sender: AccountListing
  public recipient: AccountListing
  public tickets: Array<{
    tier: TierListing,
    quantity: number
  }>

  constructor(transfer: any, adapter: APIAdapter){
    super(transfer.self, adapter)

    this.status = transfer.status
    this.initiated = transfer.initiated
    this.completed = transfer.completed
    this.sender = new AccountListingModel(transfer.sender, adapter)
    this.recipient = new AccountListingModel(transfer.recipient, adapter)

    this.tickets = []
    for(const ticket of transfer.tickets){
      this.tickets.push({
        tier: new TierListingModel(ticket.tier, adapter),
        quantity: ticket.quantity
      })
    }
  }

  cancel(): Promise<boolean>{
    return this.__complete("cancelled")
  }

  accept(): Promise<boolean>{
    return this.__complete("accepted")
  }

  reject(): Promise<boolean>{
    return this.__complete("rejected")
  }

  private __complete(status: string): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.patch(
        this.uri,
        {status: status}
      ).then(() => {
        resolve(true)
      }).catch(error => {
        if(error.code == 403){
          error = new PermissionError(error.code, error.message)
        }else if(error.code == 409){
          error = new InvalidStateError(error.code, error.message)
        }

        reject(error)
      })
    })
  }
}