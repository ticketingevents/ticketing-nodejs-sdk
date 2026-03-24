import { APIAdapter } from '../util/APIAdapter'
import { Collection } from '../util/Collection'
import { TokenService } from '../service/TokenService'
import { BadDataError, InvalidStateError, PermissionError } from '../errors'
import type { Event } from '../interface/Event'
import type { EventData } from '../interface/data/EventData'
import type { Section } from '../interface/Section'
import type { Token } from '../interface/Token'
import { BaseModel } from './BaseModel'
import { CategoryModel } from './CategoryModel'
import { EventStatisticsModel } from './reporting/EventStatisticsModel'
import { SectionModel } from './SectionModel'
import { TokenModel } from './TokenModel'
import { VenueModel } from './VenueModel'

export class BaseEventModel extends BaseModel implements Event{
  public published: string
  public title: string
  public description: string
  public status: string
  public type: string
  public public: boolean
  public featured: boolean
  public category: CategoryModel
  public subcategory: string
  public start: string
  public end: string
  public venue: VenueModel
  public disclaimer: string
  public tags: Array<string>
  public popularity: number
  public sections: Array<SectionModel>

  private __bannerUrl: string
  private __bannerData: string
  private __thumbnailUrl: string
  private __thumbnailData: string
  private __tokenService: TokenService

  constructor(event: any, adapter: APIAdapter){
    super(event.self, adapter)

    this.published = event.published
    this.title = event.title
    this.description = event.description
    this.status = event.status
    this.type = event.type
    this.public = event.public
    this.featured = event.featured
    this.subcategory = event.subcategory
    this.start = event.start
    this.end = event.end
    this.disclaimer = event.disclaimer
    this.tags = event.tags
    this.popularity = event.popularity
    this.sections = []

    if(event.category){
      this.category = new CategoryModel(event.category, adapter)
    }

    if(event.venue){
      this.venue = new VenueModel(event.venue, adapter)
    }

    if(event.sections){
      for(const section of event.sections){
        this.sections.push(new SectionModel(section, adapter))
      }
    }

    this.__bannerUrl = event.banner
    this.__bannerData = ""
    this.__thumbnailUrl = event.thumbnail
    this.__thumbnailData = ""
    this.__tokenService = new TokenService(this._apiAdapter, this)
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

  get tokens(): Collection<Token>{
    return this.__tokenService.list()
  }

  submit(): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.post(
        `${this.uri}/submissions`,
        {}
      ).then(() => {
        resolve(true)
      }).catch(error => {
        if(error.code == 409){
          error = new InvalidStateError(error.code,"The event has already been submitted or cancelled.")
        }

        reject(error)
      })
    })
  }

  issue_token(sections: Array<Section>): Promise<TokenModel>{
    return new Promise((resolve, reject) => {
      const sectionData = []
      for(const section of sections){
        sectionData.push(section.uri)
      }

      this._apiAdapter.post(
        `${this.uri}/tokens`, {
          sections: sectionData
        }
      ).then(response => {
        const token = new TokenModel(response.data, this, this._apiAdapter)
        resolve(token)
      }).catch(error => {
        if(error.code == 400){
          error = new BadDataError(error.code, error.message)
        }else if(error.code == 403){
          error = new PermissionError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  public statistics(): Promise<EventStatisticsModel>{
    return new Promise((resolve, reject) => {
      this._apiAdapter.get(`${this.uri}/statistics`).then(response => {
        resolve(new EventStatisticsModel(response.data, this._apiAdapter))
      }).catch(error => {
        reject(error)
      })
    })
  }

  serialise(): EventData{
    const data: EventData = {
      title: this.title,
      description: this.description,
      type: this.type,
      public: this.public,
      category: this.category.uri,
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