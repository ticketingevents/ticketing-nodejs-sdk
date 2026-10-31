import { APIAdapter } from '../util/APIAdapter'
import type { Account } from '../interface/Account'
import type { Cart } from '../interface/Cart'
import type { Order } from '../interface/Order'
import { OrderModel } from './OrderModel'
import type { TierListing } from '../interface/TierListing'
import { BadDataError, InvalidStateError, UnsupportedOperationError } from '../errors'

export class CartModel implements Cart{
  public created: string
  public items: Array<{
    tier: TierListing,
    quantity: number,
    details?: Array<{[key: string]: any}>
    total: number
  }>

  private __apiAdapter: APIAdapter
  private __customer: Account

  constructor(apiAdapter: APIAdapter, customer: Account){
    this.created = (new Date()).toISOString()
    this.items = []

    this.__apiAdapter = apiAdapter
    this.__customer = customer
  }

  get total(): number{
    let total = 0
    for(const item of this.items){
      total += item.total
    }

    return total
  }

  add(tier: TierListing, quantity: number): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      //See if tier already exists
      const tierIndex = this.__hasTier(tier)

      //Check that quantity is a valid number
      if(quantity < 1){
        reject(new BadDataError(400, "The number of items to be added to the cart must be a positive integer."))
      }else if(quantity > tier.remaining){
        reject(new UnsupportedOperationError(400, "Adding the specified quantity of this item would exceed the tier capacity."))
      }else if(tierIndex < 0){
        this.items.push({
          tier: tier,
          quantity: quantity,
          total: tier.price*quantity
        })

        resolve(true)
      }else if(this.items[tierIndex].quantity + quantity > tier.remaining){
        reject(new UnsupportedOperationError(400, "Adding the specified quantity of this item would exceed the tier capacity."))
      }else{
        this.items[tierIndex].quantity += quantity
        this.items[tierIndex].total = (tier.price*this.items[tierIndex].quantity)

        resolve(true)
      }
    })
  }

  remove(tier: TierListing, quantity: number): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      //See if tier already exists
      const tierIndex = this.__hasTier(tier)

      //Check that quantity is a valid number
      if(quantity < 1){
        reject(new BadDataError(400, "The number of items to be removed from the cart must be a positive integer."))
      }else if(tierIndex < 0 || this.items[tierIndex].quantity < quantity){
        reject(new UnsupportedOperationError(400, "The cart contains fewer items than the quantity to be removed."))
      }else{
        this.items[tierIndex].quantity -= quantity
        this.items[tierIndex].total = (tier.price*this.items[tierIndex].quantity)

        resolve(true)
      }
    })
  }

  set(tier: TierListing, quantity: number): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      //See if tier already exists
      const tierIndex = this.__hasTier(tier)

      //Check that quantity is a valid number
      if(quantity < 1){
        reject(new BadDataError(400, "The target item quantity must be a positive integer."))
      }else if(quantity > tier.remaining){
        reject(new UnsupportedOperationError(400, "Setting the item quantity to the specified value would exceed the tier capacity."))
      }else if(tierIndex < 0){
        this.add(tier, quantity).then(success => {
          resolve(success)
        }).catch(error => {
          reject(error)
        })
      }else{
        this.items[tierIndex].quantity = quantity
        this.items[tierIndex].total = (tier.price*quantity)

        resolve(true)
      }
    })
  }

  add_details(tier: TierListing, details: Array<{[key: string]: any}>): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      const tierIndex = this.__hasTier(tier)

      //See if tier exists in cart and whether it requires additional details
      if(tierIndex < 0 || !tier.form){
        reject(
          new InvalidStateError(409, "The specified tier does not require additional details."
          )
        )
      }
      //See if provided details match tier item quantity
      else if(details.length != this.items[tierIndex].quantity){
        reject(new BadDataError(400, "The number of provided details must match the item quantity for this tier."))
      //Add details to items array
      }else{
        this.items[tierIndex].details = details
        resolve(true)
      }
    })
  }

  checkout(): Promise<Order>{
    return new Promise<Order>((resolve, reject) => {
      const items = []
      for(const item of this.items){
        const payload = {
          tier: item.tier.id,
          quantity: item.quantity
        }

        if(item.details){
          payload["details"] = item.details
        }

        items.push(payload)
      }

      this.__apiAdapter.post(`/accounts/${this.__customer.id}/orders`, {
        items: items
      }).then(order => {
        resolve(new OrderModel(order.data, this.__customer, this.__apiAdapter))
      }).catch(error => {
        if(error.code == 400){
          error = new BadDataError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  private __hasTier(tier: TierListing): number{
    let tierIndex = -1

    for(let i=0; i < this.items.length; i++){
      if(this.items[i].tier.uri == tier.uri){
        tierIndex = i
      }
    }

    return tierIndex
  }
}