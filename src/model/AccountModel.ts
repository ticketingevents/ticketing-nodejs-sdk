import { APIAdapter } from '../util/APIAdapter'
import { Collection } from '../util/Collection'
import { ItineraryService } from '../service/ItineraryService'
import { WalletService } from '../service/WalletService'
import { ManagedHostService } from '../service/ManagedHostService'
import { TransferHistoryService } from '../service/TransferHistoryService'
import { BaseModel } from './BaseModel'
import type { Account } from '../interface/Account'
import type { AccountData } from '../interface/data/AccountData'
import type { AccountPreferences } from '../interface/AccountPreferences'
import { AccountPreferencesModel } from './AccountPreferencesModel'
import type { Host } from '../interface/Host'
import type { Event } from '../interface/Event'
import type { Ticket } from '../interface/Ticket'
import type { Transfer } from '../interface/Transfer'
import { PermissionError } from '../errors'

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
  private __itineraryService: ItineraryService
  private __walletService: WalletService
  private __managedHostService: ManagedHostService
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
    this.__itineraryService = new ItineraryService(this._apiAdapter, this)
    this.__walletService = new WalletService(this._apiAdapter, this)
    this.__managedHostService = new ManagedHostService(this._apiAdapter, this)
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

  get hosts(): Collection<Host>{
    return this.__managedHostService.list()
  }

  get inbox(): Collection<Transfer>{
    return this.__transferHistoryService.list().filter({role: "recipient"})
  }

  get outbox(): Collection<Transfer>{
    return this.__transferHistoryService.list().filter({role: "sender"})
  }

  itinerary(pageLength: number = 25): Collection<Event>{
    return this.__itineraryService.list(pageLength)
  }

  wallet(pageLength: number = 25): Collection<Ticket>{
    return this.__walletService.list(pageLength)
  }

  deactivate(message?: string): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.post(
        `${this._self}/deletions`,
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
      id: this.id,
      uri: this.uri,
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