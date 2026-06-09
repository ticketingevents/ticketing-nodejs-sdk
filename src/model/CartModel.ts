import { APIAdapter } from '../util/APIAdapter'
import type { Account } from '../interface/Account'
import type { Cart } from '../interface/Cart'
import type { Order } from '../interface/Order'
import { OrderModel } from './OrderModel'
import type { TierListing } from '../interface/TierListing'
import { BadDataError, UnsupportedOperationError } from '../errors'

export class CartModel implements Cart{
  public created: string
  public items: Array<{tier: TierListing, quantity: number, total: number}>

  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter){
    this.created = (new Date()).toISOString()
    this.items = []

    this.__apiAdapter = apiAdapter
  }

  get subtotal(): number{
    let subtotal = 0
    for(const item of this.items){
      subtotal += item.total
    }

    return subtotal
  }

  get fees(): number{
    const fees = 0
    /*for(const item of this.items){
      fees += item.tier.fees * item.quantity
    }*/

    return fees
  }

  get total(): number{
    return this.subtotal + this.fees
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

  checkout(customer: Account): Promise<Order>{
    return new Promise<Order>((resolve, reject) => {
      const items = {}
      for(const item of this.items){
        items[item.tier.uri] = item.quantity
      }

      this.__apiAdapter.post("/orders", {
        customer: customer.number,
        items: items
      }).then(order => {
        resolve(new OrderModel(order.data, customer, this.__apiAdapter))
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