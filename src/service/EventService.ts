import { BaseService } from './BaseService'

import { PermissionError } from '../errors'
import { APIAdapter } from '../util/APIAdapter'
import type { EventListing } from '../interface/EventListing'
import { EventListingModel} from '../model/EventListingModel'
import { UnsupportedOperationError } from '../errors'

export class EventService extends BaseService<EventListing, EventListing>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/events", EventListingModel,
      ["region", "host", "title", "active", "category", "subcategory", "after", "before"],
      ["alphabetical","published","popularity","start"],
      {region: "id", host: "id", category: "id", subcategory: "id", }
    )
  }

  create(): Promise<EventListing>{
    return new Promise<EventListing>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  batchCreate(): Promise<Array<EventListing>>{
    return new Promise<Array<EventListing>>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  find(id: number|string): Promise<EventListing>{
    return new Promise<EventListing>((resolve, reject) => {
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