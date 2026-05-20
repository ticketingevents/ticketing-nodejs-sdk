import { APIAdapter } from '../util/APIAdapter'
import type { EventRevision } from '../interface/EventRevision'
import type { EventRevisionData } from '../interface/data/EventRevisionData'
import { BaseModel } from './BaseModel'
import { BaseService } from '../service/BaseService'
import { CategoryModel } from './CategoryModel'
import { VenueModel } from './VenueModel'
import type { Submission } from '../interface/Submission'
import type { SubmissionData } from '../interface/data/SubmissionData'
import { SubmissionModel } from './SubmissionModel'
import type { Publication } from '../interface/Publication'
import type { PublicationData } from '../interface/data/PublicationData'
import { PublicationModel } from './PublicationModel'
import { InvalidStateError } from '../errors'

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

  private __submissionService: RevisionSubmissionService
  private __publicationService: RevisionPublicationService

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

    this.__submissionService = new RevisionSubmissionService(this._apiAdapter, this)
    this.__publicationService = new RevisionPublicationService(this._apiAdapter, this)
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

  get submissions(): RevisionSubmissionService{
    return this.__submissionService
  }

  get publications(): RevisionPublicationService{
    return this.__publicationService
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

  publish(schedule: string = ""): Promise<Publication>{
    if(!schedule){
      schedule = "2000-01-01T00:00"
    }

    return this.__publicationService.create({
      publish_at: schedule
    })
  }
}

export class RevisionSubmissionService extends BaseService<SubmissionData, Submission>{
  private __apiAdapter: APIAdapter
  private __event: EventRevision

  constructor(apiAdapter: APIAdapter, event: EventRevision){
    super(apiAdapter, `${event.uri}/submissions`, SubmissionModel)
    this.__apiAdapter = apiAdapter
    this.__event = event
  }

  create(): Promise<Submission>{
    return new Promise<Submission>((resolve, reject) => {
      this.__event.submissions.list().total.then(submissions => {
        let note: string = ""
        if(submissions == 0){
          note = `New Event Submission: ${this.__event.title}`
        }else{
          note = `Event Change Request: ${this.__event.title}`
        }

        super.create({
          note: note
        }).then(response => {
          resolve(response)
        }).catch(error => {
          if(error.message == "You must upload banner and thumbnail images for an event prior to submission."){
            error = new InvalidStateError(error.code, error.message)
          }
          reject(error)
        })
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export class RevisionPublicationService extends BaseService<PublicationData, Publication>{
  private __apiAdapter: APIAdapter
  private __event: EventRevision

  constructor(apiAdapter: APIAdapter, event: EventRevision){
    super(apiAdapter, `${event.uri}/publications`, PublicationModel)
    this.__apiAdapter = apiAdapter
    this.__event = event
  }

  create(data: PublicationData): Promise<Publication>{
    return new Promise<Publication>((resolve, reject) => {
      super.create(data).then(response => {
        resolve(response as Publication)
      }).catch(error => {
        if(error.code == 409){
          error = new InvalidStateError(error.code, error.message)
        }

        reject(error)
      })
    })
  }
}