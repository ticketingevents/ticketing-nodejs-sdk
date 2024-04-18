import { APIAdapter, Collection } from '../util'

export class BaseService<T>{
  private __adapter: APIAdapter
  private __baseUrl: string

  constructor(apiAdapter: APIAdapter, baseUrl: string){
    this.__adapter = apiAdapter
    this.__baseUrl = baseUrl
  }

  public list(){
    return new Collection<T>(this.__adapter, this.__baseUrl)
  }
}