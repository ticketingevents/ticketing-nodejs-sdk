import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import type { EventListing } from '../interface/EventListing'
import type { TokenData } from '../interface/data/TokenData'
import type { Token } from '../interface/Token'
import { TokenModel } from '../model/TokenModel'

export class TokenService extends BaseService<TokenData, Token>{
  private __apiAdapter: APIAdapter
  private __event: EventListing

  constructor(apiAdapter: APIAdapter, event: EventListing){
    super(apiAdapter, `${event.uri}/tokens`, TokenModel, ["global"])

    this.__apiAdapter = apiAdapter
    this.__event = event
  }

  protected _instantiateModel(data: any){
    return new TokenModel(data, this.__event, this.__apiAdapter)
  }
}