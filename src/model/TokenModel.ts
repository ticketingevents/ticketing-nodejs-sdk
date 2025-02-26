import { APIAdapter } from '../util'
import { ResourceImmutableError } from '../errors'
import { BaseModel } from './BaseModel'
import { EventModel } from './EventModel'
import { Section } from '../interface/Section'
import { Token } from '../interface/Token'
import { TokenData } from '../interface/data/TokenData'

export class TokenModel extends BaseModel implements Token{
  public code: string
  public global: boolean
  public sections: Array<Section>

  private __event: EventModel
  private __original_sections: Array<Section>

  constructor(token: any, event: EventModel, adapter: APIAdapter){
    super(token.self, adapter)

    this.code = token.code
    this.global = token.global
    this.sections = []
    this.__original_sections = []

    this.__event = event

    //Index event sections
    const sectionMap = {}
    for(const section of this.__event.sections){
    	sectionMap[section.uri] = section
    }

    for(const section of token.sections){
    	this.sections.push(sectionMap[section])
      this.__original_sections.push(sectionMap[section])
    }
  }

  allow(section: Section){
  	this.sections.push(section)
  }

  deny(section: Section){
  	this.sections.splice(this.sections.indexOf(section), 1)
  }

  save(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      super.save().then(saved => {
        this.__original_sections = []
        for(const section of this.sections){
          this.__original_sections.push(section)
        }

        resolve(saved)
      }).catch(error => {
        if(error.code == 409){
          error = new ResourceImmutableError(error.code, error.message)
        }

        this.sections = []
        for(const section of this.__original_sections){
          this.sections.push(section)
        }

        reject(error)
      })
    })
  }

  serialise(): TokenData{
  	const sections = []
  	for(const section of this.sections){
  		sections.push(section.uri)
  	}

    const data: TokenData = {
      sections: sections
    }

    return data
  }
}