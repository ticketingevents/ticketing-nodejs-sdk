import { APIAdapter } from '../util/APIAdapter'
import type { EventRevision } from '../interface/EventRevision'
import type { EventRevisionData } from '../interface/data/EventRevisionData'
import { BaseModel } from './BaseModel'
import { CategoryModel } from './CategoryModel'
import { VenueModel } from './VenueModel'

export class EventRevisionModel extends BaseModel implements EventRevision{
  public title: string
  public description: string
  public type: string
  public public: boolean
  public start: string
  public end: string
  public status: string
  public venue: VenueModel
  public category: CategoryModel
  public subcategory: CategoryModel
  public disclaimer: string
  public tags: Array<string>
  public published: string
  public popularity: number

  private __bannerUrl: string
  private __bannerData: string
  private __thumbnailUrl: string
  private __thumbnailData: string

  constructor(revision: any, adapter: APIAdapter){
    super(revision.self, adapter)

    this.title = revision.title
    this.description = revision.description
    this.type = revision.type
    this.public = revision.public
    this.start = revision.start
    this.end = revision.end
    this.status = revision.status
    this.disclaimer = revision.disclaimer
    this.tags = revision.tags
    this.published = revision.published
    this.popularity = revision.popularity

    if(revision.category){
      this.category = new CategoryModel(revision.category, adapter)
    }

    if(revision.subcategory){
      this.subcategory = new CategoryModel(revision.subcategory, adapter)
    }

    if(revision.venue){
      this.venue = new VenueModel(revision.venue, adapter)
    }

    this.__bannerUrl = revision.banner
    this.__bannerData = ""
    this.__thumbnailUrl = revision.thumbnail
    this.__thumbnailData = ""
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

  serialise(): EventRevisionData{
    const data: EventRevisionData = {
      title: this.title,
      description: this.description,
      type: this.type,
      public: this.public,
      start: this.start,
      end: this.end,
      venue: this.venue.id,
      category: this.category.id,
      subcategory: this.subcategory.id,
      disclaimer: this.disclaimer,
      tags: this.tags
    }

    if(this.__bannerData){
      data.banner = this.__bannerData
    }

    if(this.__thumbnailData){
      data.thumbnail = this.__thumbnailData
    }

    return data
  }
}