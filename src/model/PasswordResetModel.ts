import { APIAdapter } from '../util/APIAdapter'
import { BadDataError } from '../errors'
import { BaseModel } from './BaseModel'
import type { PasswordReset } from '../interface/PasswordReset'

export class PasswordResetModel extends BaseModel implements PasswordReset{
  public email: string
  public status: string

  constructor(reset: any, adapter: APIAdapter){
    super(reset.self, adapter)

    this.email = reset.email
    this.status = reset.status
  }

  confirm(details: {code: string, password: string}): Promise<boolean>{
  	return new Promise((resolve, reject) => {
	  this._apiAdapter.patch(this.uri, details).then(response => {
      if(response.status == 200){
	     resolve(true)
     }
	  }).catch(error => {
      if(error.code == 400){
        error = new BadDataError(error.code, error.message)
      }

      reject(error)
	  })	
  	})
  }
}