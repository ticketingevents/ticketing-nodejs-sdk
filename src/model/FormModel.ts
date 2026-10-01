import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Form } from '../interface/Form'
import type { FormData } from '../interface/data/FormData'

export class FormModel extends BaseModel implements Form{
  public name: string
  public description: string
  public fields: Array<{name: string, type: number, required: boolean}>

  constructor(form: any, adapter: APIAdapter){
    super(form.self, adapter)

    this.name = form.name
    this.description = form.description
    this.fields = form.fields
  }

  serialise(): FormData{
    return {
      name: this.name,
      description: this.description,
      fields: this.fields
    }
  }
}