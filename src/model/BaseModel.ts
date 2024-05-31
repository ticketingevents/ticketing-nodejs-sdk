import { APIAdapter } from '../util'
import { Base } from '../interface/Base'
import { BadDataError, ResourceExistsError, ResourceIndelibleError } from '../errors'

export class BaseModel implements Base{
  private __self: string
  private __apiAdapter: APIAdapter

  constructor(self: string, adapter: APIAdapter){
    this.__self = self
    this.__apiAdapter = adapter
  }

  get id(): string{
    return /([A-Za-z0-9\-]+)$/.exec(this.__self)[1]
  }

  get uri(): string{
    return this.__self
  }

  save(): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this.__apiAdapter.put(
        this.__self,
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
      this.__apiAdapter.delete(
        this.__self
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