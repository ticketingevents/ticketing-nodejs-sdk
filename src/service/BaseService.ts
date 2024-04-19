import { APIAdapter, Collection, PaginatedCollection } from '../util'

export class BaseService<RequestType, ResponseType>{
  private __adapter: APIAdapter
  private __baseUrl: string
  private __modelClass: any

  constructor(apiAdapter: APIAdapter, baseUrl: string, modelClass: any){
    this.__adapter = apiAdapter
    this.__baseUrl = baseUrl
    this.__modelClass = modelClass
  }

  public create(data: RequestType){
    return new this.__modelClass()
  }

  public list(){
    let collection = new Collection<ResponseType>(this.__query)

    collection.onFilter((criteria: {[key: string]: string}) => {
      console.log(criteria)
    })

    collection.onPaginate(() => {
      return new PaginatedCollection<ResponseType>(this.__query)
    })

    return collection
  }

  private __query(resolve, reject){
    this.__adapter.get(this.__baseUrl).then(response => {
      let entries: Array<ResponseType> = []
      for(let entry of response.data.entries){
        entries.push(this.__modelClass(entry))
      }

      resolve(entries)
    }).catch(error => {
      reject(error)
    })
  }
}