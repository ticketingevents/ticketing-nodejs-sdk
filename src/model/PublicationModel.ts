import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Publication } from '../interface/Publication'
import type { PublicationData } from '../interface/data/PublicationData'

export class PublicationModel extends BaseModel implements Publication{
  readonly changes: {[key: string]: string}
  readonly publish_at: string

  private __apiAdapter: APIAdapter

  constructor(publication: any, adapter: APIAdapter){
    super(publication.self, adapter)

    this.changes = publication.changes
    this.publish_at = publication.publish_at

    this.__apiAdapter = adapter
  }

  serialise(): PublicationData{
    return {
      publish_at: this.publish_at
    }
  }
}