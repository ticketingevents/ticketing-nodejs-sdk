import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { AccountModel } from '../model/AccountModel'
import type { Cart } from '../interface/Cart'
import { CartModel} from '../model/CartModel'
import { OrderData } from '../interface/data/OrderData'
import type { Order } from '../interface/Order'
import { OrderModel} from '../model/OrderModel'
import { UnsupportedOperationError } from '../errors'

export class OrderService extends BaseService<OrderData, Order>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/orders", OrderModel,
      ["customer", "status"],
      ["date"]
    )

    this.__apiAdapter = apiAdapter
  }

  start(): Promise<Cart>{
    return new Promise<Cart>((resolve) => {
		  resolve(new CartModel(this.__apiAdapter))
    })
  }

  create(): Promise<Order>{
    return new Promise<Order>((resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  batchCreate(): Promise<Array<Order>>{
    return new Promise<Array<Order>>((resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  protected _instantiateModel(data: any){
    const customer = new AccountModel(data.customer, this.__apiAdapter)
    return new OrderModel(data, customer, this.__apiAdapter)
  }

  protected _preprocessCriteria(criteria: {[key: string]: any}){
    criteria.customer = criteria.customer?criteria.customer.number:null
    return criteria
  }
}