import { APIAdapter } from '../util/APIAdapter'
import { Collection } from '../util/Collection'
import { BaseService } from '../service/BaseService'
import { ItineraryService } from '../service/ItineraryService'
import { WalletService } from '../service/WalletService'
import { TransferHistoryService } from '../service/TransferHistoryService'
import { BaseModel } from './BaseModel'
import type { Account } from '../interface/Account'
import type { AccountData } from '../interface/data/AccountData'
import type { AccountPreferences } from '../interface/AccountPreferences'
import { AccountPreferencesModel } from './AccountPreferencesModel'
import type { Cart } from '../interface/Cart'
import { CartModel } from './CartModel'
import type { Host } from '../interface/Host'
import type { HostData } from '../interface/data/HostData'
import { HostModel } from './HostModel'
import type { Order } from '../interface/Order'
import type { OrderData } from '../interface/data/OrderData'
import { OrderModel } from './OrderModel'
import type { Privilege } from '../interface/Privilege'
import type { PrivilegeData } from '../interface/data/PrivilegeData'
import { PrivilegeModel } from './PrivilegeModel'
import type { EventListing } from '../interface/EventListing'
import type { Ticket } from '../interface/Ticket'
import type { Transfer } from '../interface/Transfer'
import { PermissionError, UnsupportedOperationError } from '../errors'

export class AccountModel extends BaseModel implements Account{
  public number: string
  public username: string
  public email: string
  public role: string
  public verified: boolean
  public activated: boolean
  public firstName: string
  public lastName: string
  public title: string
  public dateOfBirth: string
  public phone: string
  public country: string
  public firstAddressLine: string
  public secondAddressLine: string
  public city: string
  public state: string

  private __preferences: string
  private __accountPrivilegeService: AccountPrivilegeService
  private __privilegedHostService: PrivilegedHostService
  private __cartService: CartService
  private __customerOrderService: CustomerOrderService


  private __itineraryService: ItineraryService
  private __walletService: WalletService
  private __transferHistoryService: TransferHistoryService

  constructor(account: any, adapter: APIAdapter){
    super(account.self, adapter)

    this.number = account.number
    this.username = account.username
    this.email = account.email
    this.role = account.role
    this.verified = account.verified
    this.activated = account.activated
    this.firstName = account.firstName
    this.lastName = account.lastName
    this.title = account.title
    this.dateOfBirth = account.dateOfBirth
    this.phone = account.phone
    this.country = account.country
    this.firstAddressLine = account.firstAddressLine
    this.secondAddressLine = account.secondAddressLine
    this.city = account.city
    this.state = account.state

    this.__preferences = account.preferences
    this.__privilegedHostService = new PrivilegedHostService(this._apiAdapter, this)
    this.__accountPrivilegeService = new AccountPrivilegeService(this._apiAdapter, this)
    this.__cartService = new CartService(this._apiAdapter, this)
    this.__customerOrderService = new CustomerOrderService(this._apiAdapter, this)

    this.__itineraryService = new ItineraryService(this._apiAdapter, this)
    this.__walletService = new WalletService(this._apiAdapter, this)
    this.__transferHistoryService = new TransferHistoryService(this._apiAdapter, this)
  }

  get preferences(): Promise<AccountPreferences>{
    return new Promise<AccountPreferences>((resolve, reject)=>{
      this._apiAdapter.get(this.__preferences).then(preferences => {
        resolve(new AccountPreferencesModel(this.__preferences, preferences.data, this._apiAdapter))
      }).catch(error => {
        reject(error)
      })
    })
  }

  get privileges(): AccountPrivilegeService{
    return this.__accountPrivilegeService
  }

  get hosts(): PrivilegedHostService{
    return this.__privilegedHostService
  }

  get carts(): CartService{
    return this.__cartService
  }

  get orders(): CustomerOrderService{
    return this.__customerOrderService
  }

  get inbox(): Collection<Transfer>{
    return this.__transferHistoryService.list().filter({role: "recipient"})
  }

  get outbox(): Collection<Transfer>{
    return this.__transferHistoryService.list().filter({role: "sender"})
  }

  itinerary(pageLength: number = 25): Collection<EventListing>{
    return this.__itineraryService.list(pageLength)
  }

  wallet(pageLength: number = 25): Collection<Ticket>{
    return this.__walletService.list(pageLength)
  }

  deactivate(message?: string): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.post(
        `${this.uri}/deletions`,
        {message: message}
      ).then(() => {
        this.activated = false
        resolve(true)
      }).catch(error => {
        if(error.code == 403){
          error = new PermissionError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  serialise(): AccountData{
    return {
      number: this.number,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      title: this.title,
      dateOfBirth: this.dateOfBirth,
      phone: this.phone,
      country: this.country,
      firstAddressLine: this.firstAddressLine,
      secondAddressLine: this.secondAddressLine,
      city: this.city,
      state: this.state
    }
  }
}

export class AccountPrivilegeService extends BaseService<PrivilegeData, Privilege>{
  constructor(apiAdapter: APIAdapter, account: Account){
    super(apiAdapter, `${account.uri}/privileges`, PrivilegeModel, ["role", "type"])
  }
}

export class PrivilegedHostService extends BaseService<HostData, Host>{
  constructor(apiAdapter: APIAdapter, account: Account){
    super(apiAdapter, `${account.uri}/hosts`, HostModel)
  }
}

export class CartService{
  private __apiAdapter: APIAdapter
  private __customer: Account

  constructor(apiAdapter: APIAdapter, customer: Account){
    this.__apiAdapter = apiAdapter
    this.__customer = customer
  }

  create(): Promise<Cart>{
    return new Promise<Cart>((resolve) => {
      resolve(new CartModel(this.__apiAdapter, this.__customer))
    })
  }
}

export class CustomerOrderService extends BaseService<OrderData, Order>{
  private __apiAdapter: APIAdapter
  private __customer: Account

  constructor(apiAdapter: APIAdapter, customer: Account){
    super(apiAdapter, `/accounts/${customer.number}/orders`, OrderModel,
      ["number", "status"],
      ["date"]
    )

    this.__customer = customer
  }

  create(): Promise<Order>{
    return new Promise<Order>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  batchCreate(): Promise<Array<Order>>{
    return new Promise<Array<Order>>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  protected _instantiateModel(data: any){
    return new OrderModel(data, this.__customer, this.__apiAdapter)
  }
}