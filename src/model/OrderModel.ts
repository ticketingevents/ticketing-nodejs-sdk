import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Account } from '../interface/Account'
import type { CreditCard } from '../interface/CreditCard'
import type { Order } from '../interface/Order'
import type { OrderData } from '../interface/data/OrderData'
import type { Payment } from '../interface/Payment'
import type { TierListing } from '../interface/TierListing'
import { TierListingModel } from '../model/TierListingModel'
import { BadDataError, InvalidStateError, PermissionError } from '../errors'

export class OrderModel extends BaseModel implements Order{
  public number: string
  public status: string
  public placed: string
  public subtotal: number
  public fees: number
  public total: number
  public items: Array<{
    tier: TierListing,
    quantity: number
  }>
  public customer: Account
  public payment: Payment

  private __paymentsURI: string
  private __refundsURI: string

  constructor(order: any, customer: Account, adapter: APIAdapter){
    super(order.self, adapter)

    this.number = order.number
    this.status = order.status
    this.placed = order.placed
    this.subtotal = order.subtotal
    this.fees = order.fees
    this.total = order.total
    this.customer = customer
    this.payment = order.payment

    this.items = []
    for(const item of order.items){
      this.items.push({
        tier: new TierListingModel(item.tier, adapter),
        quantity: item.quantity
      })
    }

    this.__paymentsURI = order.payments
  }

  cancel(): Promise<boolean>{
  	return new Promise((resolve, reject) => {
  		this.delete().then(deleted => {
  			this.status = "Cancelled"
  			resolve(deleted)
  		}).catch(error => {
  			reject(error)
  		})
  	})
  }

  settle(card: CreditCard): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.post(this.__paymentsURI, card).then(response => {
      	this.status = "Fulfilled"
    	resolve(response.data.status == "Authorised")
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

  refund(reason: string): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.post(this.__refundsURI, {reason: reason}).then(response => {
      	this.status = "Refunded"
    	resolve(response.data.status == "Authorised")
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

  serialise(): OrderData{
  	const items = []
  	for(const item of this.items){
  		items.push({
        tier: item.tier.id,
        quantity: item.quantity
      })
  	}

    return {
      customer: this.customer.number,
      items: items
    }
  }
}