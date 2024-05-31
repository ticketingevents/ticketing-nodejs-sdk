import { BaseService } from './BaseService'

import { BadDataError, PermissionError } from '../errors'
import { APIAdapter } from '../util'
import { EventData, Event } from '../interface'
import { EventModel, VenueModel } from '../model'

export class EventService extends BaseService<EventData, Event>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/events", EventModel, [
      "region", "host", "title", "status", "active", "public", "section"
    ])
  }

  create(data: EventData): Promise<Event>{
    return new Promise<Event>((resolve, reject) => {
      if(!(data.venue instanceof VenueModel)){
        reject(new BadDataError(400, "Please provide a valid venue for the event"))
      }

      let payload: EventData = JSON.parse(JSON.stringify(data))
      payload.venue = (data.venue as VenueModel).uri
      super.create(payload).then(response => {
        resolve(response)
      }).catch(error => {
        if(error.code == 403){
          error = new PermissionError(error.code, error.message)
        }

        reject(error)
      })
    })
  }
}