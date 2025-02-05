import { BaseService } from './BaseService'

import { APIAdapter } from '../util'
import { TokenData, Token } from '../interface'
import { EventModel, TokenModel } from '../model'

export class TokenService extends BaseService<TokenData, Token>{
  private __apiAdapter: APIAdapter
  private __event: EventModel

  constructor(apiAdapter: APIAdapter, event: EventModel){
    super(apiAdapter, `${event.uri}/tokens`, TokenModel, ["global"])

    this.__apiAdapter = apiAdapter
    this.__event = event
  }

  protected _instantiateModel(data: any){
    return new TokenModel(data, this.__event, this.__apiAdapter)
  }
}