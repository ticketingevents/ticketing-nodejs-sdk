import { BaseModel } from './BaseModel'
import { APIAdapter } from '../util'
import { Admission } from '../interface/Admission'
import { AdmissionData } from '../interface/data/AdmissionData'
import { AccountModel } from './AccountModel'
import { EventModel } from './EventModel'
import { SectionModel } from './SectionModel'

export class AdmissionModel extends BaseModel implements Admission{
  public redeemer: string
  public device: string
  public ticket: string
  public patron: AccountModel
  public section: SectionModel
  public admitted: string
  
  private __event: EventModel

  constructor(admission: any, event: EventModel, adapter: APIAdapter){
    super(admission.self, adapter)

    this.redeemer = admission.redeemer
    this.device = admission.device
    this.ticket = admission.ticket
    this.patron = new AccountModel(admission.patron, adapter)
    this.section = new SectionModel(admission.section, adapter)
    this.admitted = admission.admitted

    this.__event = event
  }

  serialise(): AdmissionData{
    const data: AdmissionData = {
      redeemer: this.redeemer,
      device: this.device,
      ticket: this.ticket,
      patron: this.patron.uri,
      section: this.section.uri,
      admitted: this.admitted
    }

    return data
  }
}