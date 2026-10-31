import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { CountryList } from '../interface/CountryList'
import type { CountryListData } from '../interface/data/CountryListData'

export class CountryListModel extends BaseModel implements CountryList{
  public countries: Array<string>

  constructor(countryList: any, adapter: APIAdapter){
    super("/countries", adapter)

    this.countries = countryList.countries
  }

  serialise(): CountryListData{
    return {
      countries: this.countries
    }
  }
}