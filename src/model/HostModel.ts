import { APIAdapter } from '../util'
import { BaseModel } from './BaseModel'
import { Host } from '../interface/Host'
import { HostData } from '../interface/data/HostData'

export class HostModel extends BaseModel implements Host{
  public name: string
  public contact: string
  public email: string
  public description: string
  public phone: string
  public website: string
  public country: string
  public firstAddressLine: string
  public secondAddressLine: string
  public city: string
  public state: string
  public businessNo: string

  constructor(host: any, adapter: APIAdapter){
    super(host.self, adapter)

    this.name = host.name
    this.contact = host.contact
    this.email = host.email
    this.description = host.description
    this.phone = host.phone
    this.website = host.website
    this.country = host.country
    this.firstAddressLine = host.firstAddressLine
    this.secondAddressLine = host.secondAddressLine
    this.city = host.city
    this.state = host.state
    this.businessNo = host.businessNo
  }

  serialise(): HostData{
    const data: HostData = {
      name: this.name,
      contact: this.contact,
      email: this.email,
      description: this.description,
      phone: this.phone,
      website: this.website,
      country: this.country,
      firstAddressLine: this.firstAddressLine,
      secondAddressLine: this.secondAddressLine,
      city: this.city,
      state: this.state,
      businessNo: this.businessNo
    }

    return data
  }
}