import { APIAdapter, Collection } from '../util'
import { BaseService } from '../service/BaseService'
import { BaseModel } from './BaseModel'
import { Host } from '../interface/Host'
import { HostData } from '../interface/data/HostData'
import { Event } from '../interface/Event'
import { EventModel } from './EventModel'
import { EventData } from '../interface/data/EventData'
import { HostStatisticsModel } from './reporting/HostStatisticsModel'

class HostedEventService extends BaseService<EventData, Event>{
  constructor(apiAdapter: APIAdapter, host: Host){
    super(apiAdapter, `${host.uri}/events`, EventModel,
      ["region", "host", "title", "status", "active", "public", "section"],
      ["alphabetical","published","popularity","start"]
    )
  }
}

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

  private __hostedEventService: HostedEventService

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

    this.__hostedEventService = new HostedEventService(this._apiAdapter, this)
  }

  get events(): Collection<Event>{
    return this.__hostedEventService.list()
  }

  public statistics(): Promise<HostStatisticsModel>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.get(`${this._self}/statistics`).then(response => {
        resolve(new HostStatisticsModel(response.data, this._apiAdapter))
      }).catch(error => {
        reject(error)
      })
    })
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