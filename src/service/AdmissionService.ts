import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import type { AdmissionData } from '../interface/data/AdmissionData'
import type { Admission } from '../interface/Admission'
import { AdmissionModel } from '../model/AdmissionModel'
import { EventModel } from '../model/EventModel'

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

  protected _preprocessCriteria(criteria: {[key: string]: any}){
    criteria.ticket = criteria.ticket?criteria.ticket.serial:null
    criteria.patron = criteria.patron?criteria.patron.uri:null
    criteria.section = criteria.section?criteria.section.id:null
    return criteria
  }
}