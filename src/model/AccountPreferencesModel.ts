import { APIAdapter } from '../util'
import { BaseModel } from './BaseModel'
import { AccountPreferences } from '../interface/AccountPreferences'
import { AccountPreferencesData } from '../interface/data/AccountPreferencesData'
import { RegionModel } from './RegionModel'

export class AccountPreferencesModel extends BaseModel implements AccountPreferences{
  public region: RegionModel | null

  constructor(uri: string, accountPreferences: any, adapter: APIAdapter){
    super(uri, adapter)

    this.region = accountPreferences.region?
      new RegionModel({self: `/regions/${accountPreferences.region}`}, adapter):
      null
  }

  serialise(): AccountPreferencesData{
    return {
      region: this.region?this.region.id:null
    }
  }
}