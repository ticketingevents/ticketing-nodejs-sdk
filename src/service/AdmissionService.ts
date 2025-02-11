import { BaseService } from './BaseService'

import { APIAdapter } from '../util'
import { AdmissionData, Admission } from '../interface'
import { AdmissionModel, EventModel } from '../model'

export class AdmissionService extends BaseService<AdmissionData, Admission>{
  private __apiAdapter: APIAdapter
  private __admission: AdmissionModel
  private __event: EventModel

  constructor(apiAdapter: APIAdapter, event: EventModel){
    super(apiAdapter, `${event.uri}/admissions`, AdmissionModel, [
    	"redeemer", "device", "ticket", "patron", "section"
    ])

    this.__apiAdapter = apiAdapter
    this.__event = event
  }

  protected _instantiateModel(data: any){
    return new AdmissionModel(data, this.__event, this.__apiAdapter)
  }
}