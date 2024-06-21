import { APIAdapter } from '../util'
import { BaseModel } from './BaseModel'
import { Account } from '../interface/Account'
import { AccountData } from '../interface/data/AccountData'
import { AccountPreferences } from '../interface/AccountPreferences'
import { AccountPreferencesModel } from './AccountPreferencesModel'


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

  serialise(): AccountData{
    return {
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