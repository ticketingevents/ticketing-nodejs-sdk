import { APIAdapter, Collection } from '../util'
import { BadDataError, ResourceExistsError, ResourceNotFoundError } from '../errors'

export class BaseService<RequestType, ResponseType>{
  private __adapter: APIAdapter
  private __baseUrl: string
  private __modelClass: any

  private __listCollection: Collection<ResponseType>
  private __listPageLength: number
  private __listCriteria: {[key: string]: string|number}

  constructor(apiAdapter: APIAdapter, baseUrl: string, modelClass: any){
    this.__adapter = apiAdapter
    this.__baseUrl = baseUrl
    this.__modelClass = modelClass

    this.__listCollection = new Collection<ResponseType>((resolve, reject) => {})
    this.__listPageLength = 0
    this.__listCriteria = {
      records: 25,
      page: 1
    }
  }

  public create(data: RequestType): Promise<ResponseType>{
    return new Promise<ResponseType>((resolve, reject) => {
      this.__adapter.post(this.__baseUrl, data).then(response => {
        resolve(new this.__modelClass(response.data, this.__adapter))
      }).catch(error => {
        if(error.code == 400){
          error = new BadDataError(error.code, error.message)
        }else if(error.code = 409){
          error = new ResourceExistsError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  public list(pageLength: number = 25): Collection<ResponseType>{
    this.__listPageLength = pageLength
    this.__listCriteria.records = pageLength  
    this.__listCollection = new Collection<ResponseType>(this.__listQuery.bind(this))

    this.__listCollection.onFilter((criteria: {[key: string]: string}) => {
      for(let criterion in Object.keys(criteria)){
        this.__listCriteria[criterion] = criteria[criterion]
      }
    })

    this.__listCollection.onPageChange((page: number) => {
      this.__listCriteria.page = page
    })

    return this.__listCollection
  }

  public find(id: number|string): Promise<ResponseType>{
    return new Promise((resolve, reject) => {
      this.__adapter.get(
        `${this.__baseUrl}/${id}`
      ).then(response => {
        resolve(new this.__modelClass(response.data, this.__adapter))
      }).catch(error => {
        if(error.code == 404){
          error = new ResourceNotFoundError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  private __listQuery(resolve, reject){
    this.__adapter.get(
      this.__baseUrl,
      this.__listCriteria
    ).then(response => {
      this.__listCollection.pages = Math.ceil(response.data.total / response.data.records)

      let entries: Array<ResponseType> = []
      for(let entry of response.data.entries){
        entries.push(new this.__modelClass(entry, this.__adapter))
      }

      resolve(entries)
    }).catch(error => {
      reject(error)
    })
  }
}