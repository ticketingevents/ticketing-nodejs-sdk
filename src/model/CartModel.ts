import { APIAdapter } from '../util/APIAdapter'
import type { Account } from '../interface/Account'
import type { Cart } from '../interface/Cart'
import type { Order } from '../interface/Order'
import { OrderModel } from './OrderModel'
import type { Section } from '../interface/Section'
import { BadDataError, UnsupportedOperationError } from '../errors'

export class CartModel implements Cart{
  public created: string
  public items: Array<{section: Section, quantity: number, total: number}>

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
    let fees = 0
    for(const item of this.items){
      fees += item.section.fees * item.quantity
    }

    return fees
  }

  get total(): number{
    return this.subtotal + this.fees
  }

  add(section: Section, quantity: number): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      //See if section already exists
      const sectionIndex = this.__hasSection(section)

      //Check that quantity is a valid number
      if(quantity < 1){
        reject(new BadDataError(400, "The number of items to be added to the cart must be a positive integer."))
      }else if(quantity > section.remaining){
        reject(new UnsupportedOperationError(400, "Adding the specified quantity of this item would exceed the section capacity."))
      }else if(sectionIndex < 0){
        this.items.push({
          section: section,
          quantity: quantity,
          total: section.price.base*quantity
        })

        resolve(true)
      }else if(this.items[sectionIndex].quantity + quantity > section.remaining){
        reject(new UnsupportedOperationError(400, "Adding the specified quantity of this item would exceed the section capacity."))
      }else{
        this.items[sectionIndex].quantity += quantity
        this.items[sectionIndex].total = (section.price.base*this.items[sectionIndex].quantity)

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
        reject(new BadDataError(400, "The number of items to be removed from the cart must be a positive integer."))
      }else if(sectionIndex < 0 || this.items[sectionIndex].quantity < quantity){
        reject(new UnsupportedOperationError(400, "The cart contains fewer items than the quantity to be removed."))
      }else{
        this.items[sectionIndex].quantity -= quantity
        this.items[sectionIndex].total = (section.price.base*this.items[sectionIndex].quantity)

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
        reject(new BadDataError(400, "The target item quantity must be a positive integer."))
      }else if(quantity > section.remaining){
        reject(new UnsupportedOperationError(400, "Setting the item quantity to the specified value would exceed the section capacity."))
      }else if(sectionIndex < 0){
        this.add(section, quantity).then(success => {
          resolve(success)
        }).catch(error => {
          reject(error)
        })
      }else{
        this.items[sectionIndex].quantity = quantity
        this.items[sectionIndex].total = (section.price.base*quantity)

        resolve(true)
      }
    })
  }

  checkout(customer: Account): Promise<Order>{
    return new Promise<Order>((resolve, reject) => {
      const items = {}
      for(const item of this.items){
        items[item.section.uri] = item.quantity
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

  private __hasSection(section: Section): number{
    let sectionIndex = -1

    for(let i=0; i < this.items.length; i++){
      if(this.items[i].section.uri == section.uri){
        sectionIndex = i
      }
    }

    return sectionIndex
  }
}