import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import { BaseService } from '../service/BaseService'
import type { EventRevision } from '../interface/EventRevision'
import type { EventRevisionData } from '../interface/data/EventRevisionData'
import type { Tier } from '../interface/Tier'
import type { TierData } from '../interface/data/TierData'
import type { Host } from '../interface/Host'
import type { HostData } from '../interface/data/HostData'
import type { Privilege } from '../interface/Privilege'
import type { PrivilegeData } from '../interface/data/PrivilegeData'
import type { Sale } from '../interface/Sale'
import type { SaleData } from '../interface/data/SaleData'
import { EventRevisionModel } from './EventRevisionModel'
import { TierModel } from './TierModel'
import { PrivilegeModel } from './PrivilegeModel'
import { CategoryModel } from './CategoryModel'
import { VenueModel } from './VenueModel'
import { SaleModel } from './SaleModel'
import { StatisticsModel } from './StatisticsModel'
import { BadDataError, PermissionError, ResourceExistsError } from '../errors'

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
  private __tierService: TierService
  private __privilegeService: HostPrivilegeService
  private __salesService: HostSalesService

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
    this.__tierService = new TierService(this._apiAdapter, this)
    this.__privilegeService = new HostPrivilegeService(this._apiAdapter, this)
    this.__salesService = new HostSalesService(this._apiAdapter, this)
  }

  get events(): EventRevisionService{
    return this.__eventRevisionService
  }

  get tiers(): TierService{
    return this.__tierService
  }

  get privileges(): HostPrivilegeService{
    return this.__privilegeService
  }

  get sales(): HostSalesService{
    return this.__salesService
  }

  public statistics(parameters: {
    after: string,
    before: string,
    interval: string
  }): Promise<StatisticsModel>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.get(`${this.uri}/statistics`, parameters).then(response => {
        resolve(new StatisticsModel(response.data, this._apiAdapter))
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

export class EventRevisionService extends BaseService<EventRevisionData, EventRevision>{
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

export class TierService extends BaseService<TierData, Tier>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter, host: Host){
    super(apiAdapter, `${host.uri}/tiers`, TierModel, ["event"], [], {event: "id"})

    this.__apiAdapter = apiAdapter
  }

  create(data: TierData): Promise<Tier>{
    return new Promise<Tier>((resolve, reject) => {
      const payload = {
        name: data.name,
        description: data.description,
        price: data.price,
        capacity: data.capacity,
        available_from: data.available_from,
        available_to: data.available_to,
        events: [],
        artwork: data.artwork,
        unit_size: data.unit_size,
        purchase_limit: data.purchase_limit,
        purchase_note: data.purchase_note,
        complimentary: data.complimentary,
        transferrable: data.transferrable,
        upgrades: []
      }

      for(const entry of ('events' in data?data.events:[])){
        if(!(entry.event instanceof EventRevisionModel)){
          reject(new BadDataError(400, "One or more of the specified events is not a valid EventRevision."))
        }

        payload.events.push({
          id: (entry.event as EventRevisionModel).id,
          share: entry.share
        })
      }

      for(const upgrade of ('upgrades' in data?data.upgrades:[])){
        if(!(upgrade instanceof TierModel)){
          reject(new BadDataError(400, "One or more of the specified tiers is not a valid Tier."))
        }

        payload.upgrades.push(upgrade.id)
      }

      super.create(
        JSON.parse(JSON.stringify(payload))
      ).then(response => {
        resolve(response)
      }).catch(error => {
        if(error.code == 409){
          error = new ResourceExistsError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  find(id: number|string): Promise<Tier>{
    return new Promise<Tier>((resolve, reject) => {
      super.find(id).then(tier => {
        resolve(tier)
      }).catch(error => {
        if(error.code == 403){
          error = new PermissionError(error.code, "You are not authorised to manage this host or its resources.")
        }

        reject(error)
      })
    })
  }
}

export class HostPrivilegeService extends BaseService<PrivilegeData, Privilege>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter, host: Host){
    super(apiAdapter, `${host.uri}/privileges`, PrivilegeModel, ["role"])
    this.__apiAdapter = apiAdapter
  }
}

export class HostSalesService extends BaseService<SaleData, Sale>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter, host: Host){
    super(apiAdapter, `${host.uri}/sales`, SaleModel,
      ["after", "before", "event", "tier", "number", "customer", "status"],
      ["recorded", "total"],
      {event: "id", tier: "id", customer: "id"}
    )

    this.__apiAdapter = apiAdapter
  }
}