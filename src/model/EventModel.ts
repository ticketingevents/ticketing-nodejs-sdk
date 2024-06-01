import { APIAdapter } from '../util'
import { InvalidStateError } from '../errors'
import { BaseModel } from './BaseModel'
import { Event } from '../interface/Event'
import { EventData } from '../interface/data/EventData'
import { VenueModel } from './VenueModel'

export class EventModel extends BaseModel implements Event{
  public published: string
  public title: string
  public description: string
  public status: string
  public type: string
  public public: boolean
  public category: {[key: string]: string}
  public subcategory: string
  public start: string
  public end: string
  public venue: VenueModel
  public disclaimer: string
  public tags: Array<string>
  public popularity: number

  private __bannerUrl: string
  private __bannerData: string
  private __thumbnailUrl: string
  private __thumbnailData: string

  constructor(event: any, adapter: APIAdapter){
    super(event.self, adapter)

    this.published = event.published
    this.title = event.title
    this.description = event.description
    this.status = event.status
    this.type = event.type
    this.public = event.public
    this.category = event.category
    this.subcategory = event.subcategory
    this.start = event.start
    this.end = event.end
    this.venue = new VenueModel(event.venue, adapter)
    this.disclaimer = event.disclaimer
    this.tags = event.tags
    this.popularity = event.popularity

    this.__bannerUrl = event.banner
    this.__bannerData = ""
    this.__thumbnailUrl = event.thumbnail
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

  submit(): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.post(
        `${this._self}/submissions`,
        {}
      ).then(response => {
        resolve(true)
      }).catch(error => {
        if(error.code == 409){
          error = new InvalidStateError(error.code,"The event has already been submitted or cancelled.")
        }

        reject(error)
      })
    })
  }

  serialise(): EventData{
    let data: EventData = {
      title: this.title,
      description: this.description,
      type: this.type,
      public: this.public,
      category: this.category.self,
      subcategory: this.subcategory,
      start: this.start,
      end: this.end,
      venue: this.venue.uri,
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