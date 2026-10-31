import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Decision } from '../interface/Decision'

export class DecisionModel extends BaseModel implements Decision{
  readonly approved: boolean
  readonly note: string

  constructor(decision: any, adapter: APIAdapter){
    super("", adapter)

    this.approved = decision.approved
    this.note = decision.note
  }
}