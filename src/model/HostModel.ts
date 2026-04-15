import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import { BaseService } from '../service/BaseService'
import type { EventRevision } from '../interface/EventRevision'
import type { EventRevisionData } from '../interface/data/EventRevisionData'
import type { Host } from '../interface/Host'
import type { HostData } from '../interface/data/HostData'
import type { Privilege } from '../interface/Privilege'
import type { PrivilegeData } from '../interface/data/PrivilegeData'
import { EventRevisionModel } from './EventRevisionModel'
import { PrivilegeModel } from './PrivilegeModel'
import { CategoryModel } from './CategoryModel'
import { VenueModel } from './VenueModel'
import { BadDataError, PermissionError } from '../errors'
import { HostStatisticsModel } from './reporting/HostStatisticsModel'

export class HostModel extends BaseModel implements Host{
  public name: string
  public contact: string
  public email: string
  public bio: string
  public phone: string
  public website: string
  public country: string
  public firstAddressLine: string
  public secondAddressLine: string
  public city: string
  public district: string
  public businessNo: string

  private __eventRevisionService: EventRevisionService
  private __privilegeService: HostPrivilegeService

  constructor(host: any, adapter: APIAdapter){
    super(host.self, adapter)

    this.name = host.name
    this.contact = host.contact
    this.email = host.email
    this.bio = host.bio
    this.phone = host.phone
    this.website = host.website
    this.country = host.country
    this.firstAddressLine = host.firstAddressLine
    this.secondAddressLine = host.secondAddressLine
    this.city = host.city
    this.district = host.district
    this.businessNo = host.businessNo

    this.__eventRevisionService = new EventRevisionService(this._apiAdapter, this)
    this.__privilegeService = new HostPrivilegeService(this._apiAdapter, this)
  }

  get events(): EventRevisionService{
    return this.__eventRevisionService
  }

  get privileges(): HostPrivilegeService{
    return this.__privilegeService
  }

  public statistics(): Promise<HostStatisticsModel>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.get(`${this.uri}/statistics`).then(response => {
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
      bio: this.bio,
      phone: this.phone,
      website: this.website,
      country: this.country,
      firstAddressLine: this.firstAddressLine,
      secondAddressLine: this.secondAddressLine,
      city: this.city,
      district: this.district,
      businessNo: this.businessNo
    }

    return data
  }
}

class EventRevisionService extends BaseService<EventRevisionData, EventRevision>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter, host: Host){
    super(apiAdapter, `${host.uri}/events`, EventRevisionModel,
      ["region", "host", "title", "status", "active", "public", "section"],
      ["alphabetical","published","popularity","start"],
      {region: "id"}
    )

    this.__apiAdapter = apiAdapter
  }

  create(data: EventRevisionData): Promise<EventRevision>{
    return new Promise<EventRevision>((resolve, reject) => {
      if(!(data.category instanceof CategoryModel)){
        reject(new BadDataError(400, "Please provide a valid category for the event"))
      }

      if(!(data.subcategory instanceof CategoryModel)){
        reject(new BadDataError(400, "Please provide a valid subcategory for the event"))
      }

      if(!(data.venue instanceof VenueModel)){
        reject(new BadDataError(400, "Please provide a valid venue for the event"))
      }

      const payload: EventRevisionData = JSON.parse(JSON.stringify(data))
      payload.category = (data.category as CategoryModel).id
      payload.subcategory = (data.subcategory as CategoryModel).id
      payload.venue = (data.venue as VenueModel).id

      super.create(payload).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  }

  find(id: number|string): Promise<EventRevision>{
    return new Promise<EventRevision>((resolve, reject) => {
      super.find(id).then(event => {
        resolve(event)
      }).catch(error => {
        if(error.code == 403){
          error = new PermissionError(error.code, "You are not authorised to access this unlisted event.")
        }

        reject(error)
      })
    })
  }
}

class HostPrivilegeService extends BaseService<PrivilegeData, Privilege>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter, host: Host){
    super(apiAdapter, `${host.uri}/privileges`, PrivilegeModel, ["role"])
    this.__apiAdapter = apiAdapter
  }
}