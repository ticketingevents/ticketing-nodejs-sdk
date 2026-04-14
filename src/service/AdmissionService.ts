import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import type { AdmissionData } from '../interface/data/AdmissionData'
import type { Admission } from '../interface/Admission'
import { AdmissionModel } from '../model/AdmissionModel'
import { EventRevisionModel } from '../model/EventRevisionModel'

export class AdmissionService extends BaseService<AdmissionData, Admission>{
  private __apiAdapter: APIAdapter
  private __admission: AdmissionModel
  private __event: EventRevisionModel

  constructor(apiAdapter: APIAdapter, event: EventRevisionModel){
    super(apiAdapter, `${event.uri}/admissions`, AdmissionModel,
      ["redeemer", "device", "ticket", "patron", "section"],
      [],
      {ticket: "serial", patron: "uri", section: "id"}
    )

    this.__apiAdapter = apiAdapter
    this.__event = event
  }

  protected _instantiateModel(data: any){
    return new AdmissionModel(data, this.__event, this.__apiAdapter)
  }
}