import { BaseModel } from './BaseModel'
import { APIAdapter } from '../util/APIAdapter'
import type { Admission } from '../interface/Admission'
import type { AdmissionData } from '../interface/data/AdmissionData'
import { AccountModel } from './AccountModel'
import { EventListingModel } from './EventListingModel'
import { TierListingModel } from './TierListingModel'

export class AdmissionModel extends BaseModel implements Admission{
  public redeemer: string
  public device: string
  public ticket: string
  public patron: AccountModel
  public tier: TierListingModel
  public admitted: string
  
  private __event: EventListingModel

  constructor(admission: any, event: EventListingModel, adapter: APIAdapter){
    super(admission.self, adapter)

    this.redeemer = admission.redeemer
    this.device = admission.device
    this.ticket = admission.ticket
    this.patron = new AccountModel(admission.patron, adapter)
    this.tier = new TierListingModel(admission.tier, adapter)
    this.admitted = admission.admitted

    this.__event = event
  }

  serialise(): AdmissionData{
    const data: AdmissionData = {
      redeemer: this.redeemer,
      device: this.device,
      ticket: this.ticket,
      patron: this.patron.uri,
      tier: this.tier.uri,
      admitted: this.admitted
    }

    return data
  }
}