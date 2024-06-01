import { APIAdapter } from '../util'
import { Base } from '../interface/Base'
import { BadDataError, ResourceExistsError, ResourceIndelibleError } from '../errors'

export class BaseModel implements Base{
  protected _self: string
  protected _apiAdapter: APIAdapter

  constructor(self: string, adapter: APIAdapter){
    this._self = self
    this._apiAdapter = adapter
  }

  get id(): string{
    return /([A-Za-z0-9\-]+)$/.exec(this._self)[1]
  }

  get uri(): string{
    return this._self
  }

  save(): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.put(
        this._self,
        this.serialise()
      ).then(response => {
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
        this._self
      ).then(response => {
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