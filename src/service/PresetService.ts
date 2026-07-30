import { APIAdapter } from '../util/APIAdapter'
import { Collection } from '../util/Collection'
import { UnsupportedOperationError } from '../errors'
import type { CountryListData } from '../interface/data/CountryListData'
import type { CountryList } from '../interface/CountryList'
import { CountryListModel } from '../model/CountryListModel'
import { BaseService } from './BaseService'

export class PresetService{
  private __countryService: CountryService
 
  constructor(apiAdapter: APIAdapter){
    this.__countryService = new CountryService(apiAdapter)
  }

  countries(): Promise<Array<string>>{
    return new Promise<Array<string>>((resolve, reject) => {
      this.__countryService.list().then(countryList => {
        resolve(countryList[0].countries)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export class CountryService extends BaseService<CountryListData, CountryList>{
  private __apiAdapter: APIAdapter;

  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, '/countries', CountryListModel)

    this.__apiAdapter = apiAdapter
  }

  list(_pageLength: number = 25): Collection<CountryList>{
    return new Collection<CountryList>((resolve, reject) => {
      this.__apiAdapter.get("/countries").then(response => {
        resolve([response.data])
      }).catch(error => {
        reject(error)
      })
    })
  }

  create(): Promise<CountryList>{
    return new Promise<CountryList>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  batchCreate(_data: CountryListData): Promise<Array<CountryList>>{
    return new Promise<Array<CountryList>>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  find(_id: number|string): Promise<CountryList>{
    return new Promise<CountryList>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }
}