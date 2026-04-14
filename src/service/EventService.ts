import { BaseService } from './BaseService'

import { BadDataError, PermissionError } from '../errors'
import { APIAdapter } from '../util/APIAdapter'
import { EventRevisionData } from '../interface/data/EventRevisionData'
import type { EventRevision } from '../interface/EventRevision'
import { EventRevisionModel} from '../model/EventRevisionModel'
//import { HostModel } from '../model/HostModel'
import { CategoryModel } from '../model/CategoryModel'
import { VenueModel } from '../model/VenueModel'
import { UnsupportedOperationError } from '../errors'

export class EventService extends BaseService<EventRevisionData, EventRevision>{
  public published: PublishedEventService

  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/events", EventRevisionModel,
      ["region", "host", "title", "status", "active", "public", "featured", "section"],
      ["alphabetical","published","popularity","start"],
      {region: "id", host: "id", section: "id"}
    )

    this.published = new PublishedEventService(apiAdapter)
  }

  create(data: EventRevisionData): Promise<EventRevision>{
    return new Promise<EventRevision>((resolve, reject) => {
      /*if(!(data.host instanceof HostModel)){
        reject(new BadDataError(400, "Please provide a valid host for the event"))
      }*/

      if(!(data.category instanceof CategoryModel)){
        reject(new BadDataError(400, "Please provide a valid category for the event"))
      }

      if(!(data.venue instanceof VenueModel)){
        reject(new BadDataError(400, "Please provide a valid venue for the event"))
      }

      const payload: EventRevisionData = {
        //host: (data.host as HostModel).id,
        title: data.title,
        description: data.description,
        type: data.type,
        public: data.public,
        category: (data.category as CategoryModel).uri,
        subcategory: data.subcategory,
        venue: (data.venue as VenueModel).uri,
        start: data.start,
        end: data.end,
        disclaimer: data.disclaimer,
        tags: data.tags,
        banner: data.banner,
        thumbnail: data.thumbnail
      }

      super.create(payload).then(event => {
        resolve(event)
      }).catch(error => {
        if(error.code == 403){
          error = new PermissionError(error.code, error.message)
        }

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

class PublishedEventService extends BaseService<EventRevisionData, EventRevision>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/published-events", EventRevisionModel,
      ["region", "host", "active", "category", "subcategory", "before", "after", "title", "featured"],
      ["alphabetical","published","popularity","start"],
      {region: "id", host: "id", category: "id"}
    )
  }

  create(): Promise<EventRevision>{
    return new Promise<EventRevision>((resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  find(): Promise<EventRevision>{
    return new Promise<EventRevision>((resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }
}