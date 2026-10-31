import { BaseModel } from './BaseModel'
import { APIAdapter } from '../util/APIAdapter'
import type { Admission } from '../interface/Admission'
import type { AdmissionData } from '../interface/data/AdmissionData'
import { AccountListingModel } from './AccountListingModel'
import { EventListingModel } from './EventListingModel'
import { TierListingModel } from './TierListingModel'

export class AdmissionModel extends BaseModel implements Admission{
  public redeemer: string
  public device: string
  public serial: string
  public customer: AccountListingModel
  public tier: TierListingModel
  public admitted: string
  
  private __event: EventListingModel

  constructor(admission: any, adapter: APIAdapter){
    super(admission.self, adapter)

    this.redeemer = admission.redeemer
    this.device = admission.device
    this.serial = admission.serial
    this.customer = new AccountListingModel(admission.customer, adapter)
    this.tier = new TierListingModel(admission.tier, adapter)
    this.admitted = admission.admitted
  }

  serialise(): AdmissionData{
    const data: AdmissionData = {
      redeemer: this.redeemer,
      device: this.device,
      serial: this.serial,
      customer: this.customer.uri,
      tier: this.tier.uri,
      admitted: this.admitted
    }

    return data
  }
}