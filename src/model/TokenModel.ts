import { APIAdapter } from '../util'
import { ResourceImmutableError } from '../errors'
import { BaseModel } from './BaseModel'
import { EventModel } from './EventModel'
import { SectionModel } from './SectionModel'
import { Token } from '../interface/Token'
import { TokenData } from '../interface/data/TokenData'

export class TokenModel extends BaseModel implements Token{
  public code: string
  public global: boolean
  public sections: Array<SectionModel>

  private __event: EventModel

  constructor(token: any, event: EventModel, adapter: APIAdapter){
    super(token.self, adapter)

    this.code = token.code
    this.global = token.global
    this.sections = []

    this.__event = event

    //Index event sections
    let sectionMap = {}
    for(let section of this.__event.sections){
    	sectionMap[section.uri] = section
    }

    for(let section of token.sections){
    	this.sections.push(sectionMap[section])
    }
  }

  allow(section: SectionModel){
  	this.sections.push(section)
  }

  deny(section: SectionModel){
  	this.sections.splice(this.sections.indexOf(section), 1)
  }

  save(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      super.save().then(saved => {
        resolve(saved)
      }).catch(error => {
        if(error.code == 409){
          error = new ResourceImmutableError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  serialise(): TokenData{
  	let sections = []
  	for(let section of this.sections){
  		sections.push(section.uri)
  	}

    let data: TokenData = {
      sections: sections
    }

    return data
  }
}