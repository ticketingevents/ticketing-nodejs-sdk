import { APIAdapter } from '../util/APIAdapter'
import { UnsupportedOperationError } from '../errors'
import type { EventListing } from '../interface/EventListing'
import type { TierListing } from '../interface/TierListing'
import { TierListingModel } from './TierListingModel'
import { BaseModel } from './BaseModel'
import { BaseService } from '../service/BaseService'
import { CategoryModel } from './CategoryModel'
import { HostModel } from './HostModel'
import { VenueModel } from './VenueModel'

export class EventListingModel extends BaseModel implements EventListing{
  public title: string
  public description: string
  public start: string
  public end: string
  public host: HostModel
  public venue: VenueModel
  public category: CategoryModel
  public subcategory: CategoryModel
  public disclaimer: string
  public tags: Array<string>
  public published: string

  private __bannerUrl: string
  private __bannerData: string
  private __thumbnailUrl: string
  private __thumbnailData: string

  private __tierService: EventTierService

  constructor(listing: any, adapter: APIAdapter){
    super(listing.self, adapter)

    this.title = listing.title
    this.description = listing.description
    this.start = listing.start
    this.end = listing.end
    this.disclaimer = listing.disclaimer
    this.tags = listing.tags
    this.published = listing.published

    if(listing.category){
      this.category = new CategoryModel(listing.category, adapter)
    }

    if(listing.subcategory){
      this.subcategory = new CategoryModel(listing.subcategory, adapter)
    }

    if(listing.host){
      this.host = new HostModel(listing.host, adapter)
    }

    if(listing.venue){
      this.venue = new VenueModel(listing.venue, adapter)
    }

    this.__bannerUrl = listing.banner
    this.__bannerData = ""
    this.__thumbnailUrl = listing.thumbnail
    this.__thumbnailData = ""

    this.__tierService = new EventTierService(this._apiAdapter, this)
  }

  get banner(){
    return this.__bannerUrl
  }

  set banner(bannerData: string){
    this.__bannerData = bannerData
  }

  get thumbnail(){
    return this.__thumbnailUrl
  }

  set thumbnail(thumbnailData: string){
    this.__thumbnailData = thumbnailData
  }

  get tiers(): EventTierService{
    return this.__tierService
  }
}

export class EventTierService extends BaseService<TierListing, TierListing>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter, listing: EventListing){
    super(apiAdapter, `${listing.uri}/tiers`, TierListingModel, ["active"])
    this.__apiAdapter = apiAdapter
  }

  create(): Promise<TierListing>{
    return new Promise<TierListing>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  batchCreate(): Promise<Array<TierListing>>{
    return new Promise<Array<TierListing>>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  find(_id: number|string): Promise<TierListing>{
    return new Promise<TierListing>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }
}