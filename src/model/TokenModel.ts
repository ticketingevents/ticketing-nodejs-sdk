import { APIAdapter } from '../util/APIAdapter'
import { ResourceImmutableError } from '../errors'
import { BaseModel } from './BaseModel'
import type { EventListing } from '../interface/EventListing'
import type { TierListing } from '../interface/TierListing'
import type { Token } from '../interface/Token'
import type { TokenData } from '../interface/data/TokenData'

export class TokenModel extends BaseModel implements Token{
  public code: string
  public global: boolean
  public tiers: Array<TierListing>

  private __event: EventListing
  private __original_tiers: Array<TierListing>

  constructor(token: any, event: EventListing, adapter: APIAdapter){
    super(token.self, adapter)

    this.code = token.code
    this.global = token.global
    this.tiers = []
    this.__original_tiers = []

    this.__event = event

    //Index event tiers
    const tierMap = {}

    this.__event.tiers.list().then(tiers => {
      for(const tier of tiers){
        tierMap[tier.uri] = tier
      }

      for(const tier of token.tiers){
        this.tiers.push(tierMap[tier])
        this.__original_tiers.push(tierMap[tier])
      }
    })
  }

  allow(tier: TierListing){
    if(this.tiers.indexOf(tier) < 0){
    	this.tiers.push(tier)
    }
  }

  deny(tier: TierListing){
    if(this.tiers.indexOf(tier) >= 0){
  	 this.tiers.splice(this.tiers.indexOf(tier), 1)
    }
  }

  save(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      super.save().then(saved => {
        this.__original_tiers = []
        for(const tier of this.tiers){
          this.__original_tiers.push(tier)
        }

        resolve(saved)
      }).catch(error => {
        if(error.code == 409){
          error = new ResourceImmutableError(error.code, error.message)
        }

        this.tiers = []
        for(const tier of this.__original_tiers){
          this.tiers.push(tier)
        }

        reject(error)
      })
    })
  }

  serialise(): TokenData{
  	const tiers = []
  	for(const tier of this.tiers){
  		tiers.push(tier.uri)
  	}

    const data: TokenData = {
      tiers: tiers
    }

    return data
  }
}