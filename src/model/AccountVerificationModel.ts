import { APIAdapter } from '../util/APIAdapter'
import { BadDataError } from '../errors'
import { BaseModel } from './BaseModel'
import type { AccountVerification } from '../interface/AccountVerification'

export class AccountVerificationModel extends BaseModel implements AccountVerification{
  public email: string
  public status: string

  constructor(verification: any, adapter: APIAdapter){
    super(verification.self, adapter)

    this.email = verification.email
    this.status = verification.status
  }

  confirm(details: {code: string}): Promise<boolean>{
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