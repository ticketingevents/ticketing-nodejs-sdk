import { APIAdapter } from '../util/APIAdapter'
import { Collection } from '../util/Collection'
import { BaseService } from '../service/BaseService'
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
import type { Parcel } from '../interface/Parcel'
import { ParcelModel } from './ParcelModel'
import type { Privilege } from '../interface/Privilege'
import type { PrivilegeData } from '../interface/data/PrivilegeData'
import { PrivilegeModel } from './PrivilegeModel'
import type { EventListing } from '../interface/EventListing'
import { EventListingModel } from './EventListingModel'
import type { Ticket } from '../interface/Ticket'
import type { TicketData } from '../interface/data/TicketData'
import { TicketModel } from './TicketModel'
import type { Transfer } from '../interface/Transfer'
import type { TransferData } from '../interface/data/TransferData'
import { TransferModel } from './TransferModel'
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
  private __customerItineraryService: CustomerItineraryService
  private __customerWalletService: CustomerWalletService
  private __parcelService: ParcelService
  private __customerTransferService: CustomerTransferService

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
    this.__customerItineraryService = new CustomerItineraryService(this._apiAdapter, this)
    this.__customerWalletService = new CustomerWalletService(this._apiAdapter, this)
    this.__parcelService = new ParcelService(this._apiAdapter, this)
    this.__customerTransferService = new CustomerTransferService(this._apiAdapter, this)
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

  get itinerary(): CustomerItineraryService{
    return this.__customerItineraryService
  }

  get wallet(): CustomerWalletService{
    return this.__customerWalletService
  }

  get parcels(): ParcelService{
    return this.__parcelService
  }

  get transfers(): CustomerTransferService{
    return this.__customerTransferService
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

export class CustomerItineraryService extends BaseService<EventListing, EventListing>{
  constructor(apiAdapter: APIAdapter, customer: Account){
    super(apiAdapter, `/accounts/${customer.number}/events`, EventListingModel,
      ["active"],
      ["alphabetical","published","popularity","start"]
    )
  }

  create(): Promise<EventListing>{
    return new Promise<EventListing>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  batchCreate(): Promise<Array<EventListing>>{
    return new Promise<Array<EventListing>>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }
}

export class CustomerWalletService extends BaseService<TicketData, Ticket>{
  private __apiAdapter: APIAdapter
  private __customer: Account

  constructor(apiAdapter: APIAdapter, customer: Account){
    super(apiAdapter, `/accounts/${customer.number}/tickets`, TicketModel,
      ["event", "tier", "serial", "status"],
      [],
      {event: "id", tier: "id"}
    )

    this.__apiAdapter = apiAdapter
    this.__customer = customer
  }

  create(): Promise<Ticket>{
    return new Promise<Ticket>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  batchCreate(): Promise<Array<Ticket>>{
    return new Promise<Array<Ticket>>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  protected _instantiateModel(data: any){
    return new TicketModel(data, this.__customer, this.__apiAdapter)
  }
}

export class ParcelService{
  private __apiAdapter: APIAdapter
  private __sender: Account

  constructor(apiAdapter: APIAdapter, sender: Account){
    this.__apiAdapter = apiAdapter
    this.__sender = sender
  }

  create(): Promise<Parcel>{
    return new Promise<Parcel>((resolve) => {
      resolve(new ParcelModel(this.__apiAdapter, this.__sender))
    })
  }

  batchCreate(): Promise<Array<Parcel>>{
    return new Promise<Array<Parcel>>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  list(): Collection<Parcel>{
    return new Collection<Parcel>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }
}

export class CustomerTransferService extends BaseService<TransferData, Transfer>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter, sender: Account){
    super(
      apiAdapter,
      `/accounts/${sender.number}/transfers`,
      TransferModel,
      ["outgoing","status"]
    )

    this.__apiAdapter = apiAdapter
  }

  create(): Promise<Transfer>{
    return new Promise<Transfer>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  batchCreate(): Promise<Array<Transfer>>{
    return new Promise<Array<Transfer>>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  list(_pageLength: number = 25): Collection<Transfer>{
    return new Collection<Transfer>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  outgoing(pageLength: number = 25): Collection<Transfer>{
    return super.list(pageLength).filter({outgoing: true})
  }

  incoming(pageLength: number = 25): Collection<Transfer>{
    return super.list(pageLength).filter({outgoing: false})
  }

  protected _instantiateModel(data: any){
    return new TransferModel(data, this.__apiAdapter)
  }
}