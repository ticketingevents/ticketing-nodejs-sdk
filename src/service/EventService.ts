import { BaseService } from './BaseService'

import { BadDataError, PermissionError } from '../errors'
import { APIAdapter } from '../util'
import { EventData, Event } from '../interface'
import { EventModel, HostModel, CategoryModel, VenueModel } from '../model'
import { UnsupportedOperationError } from '../errors'

export class EventService extends BaseService<EventData, Event>{
  public published: PublishedEventService

  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/events", EventModel,
      ["region", "host", "title", "status", "active", "public", "section"],
      ["alphabetical","published","popularity","start"]
    )

    this.published = new PublishedEventService(apiAdapter)
  }

  create(data: EventData): Promise<Event>{
    return new Promise<Event>((resolve, reject) => {
      if(!(data.host instanceof HostModel)){
        reject(new BadDataError(400, "Please provide a valid host for the event"))
      }

      if(!(data.category instanceof CategoryModel)){
        reject(new BadDataError(400, "Please provide a valid category for the event"))
      }

      if(!(data.venue instanceof VenueModel)){
        reject(new BadDataError(400, "Please provide a valid venue for the event"))
      }

      const payload: EventData = JSON.parse(JSON.stringify(data))
      payload.host = (data.host as HostModel).id
      payload.category = (data.category as CategoryModel).uri
      payload.venue = (data.venue as VenueModel).uri

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

  find(id: number|string): Promise<Event>{
    return new Promise<Event>((resolve, reject) => {
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

class PublishedEventService extends BaseService<EventData, Event>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/published-events", EventModel,
      ["region", "title"],
      ["alphabetical","published","popularity","start"]
    )
  }

  create(): Promise<Event>{
    return new Promise<Event>((resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  find(): Promise<Event>{
    return new Promise<Event>((resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }
}