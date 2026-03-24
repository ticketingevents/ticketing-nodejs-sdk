import { APIAdapter } from '../util/APIAdapter'
import type { Base } from '../interface/Base'
import { BadDataError, ResourceExistsError, ResourceIndelibleError } from '../errors'

export class BaseModel implements Base{
  public id: string
  public uri: string
  
  protected _apiAdapter: APIAdapter

  constructor(self: string, adapter: APIAdapter){
    this.id = /([A-Za-z0-9\-]+)$/.exec(self)[1]
    this.uri = self
    this._apiAdapter = adapter
  }

  save(): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.put(
        this.uri,
        this.serialise()
      ).then(() => {
        resolve(true)
      }).catch(error => {
        if(error.code == 400){
          error = new BadDataError(error.code, error.message)
        }else if(error.code == 409){
          error = new ResourceExistsError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  delete(): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.delete(
        this.uri
      ).then(() => {
        resolve(true)
      }).catch(error => {
        if(error.code == 409){
          error = new ResourceIndelibleError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  serialise(){
    return {}
  }
}