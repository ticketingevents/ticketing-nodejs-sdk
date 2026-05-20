import { Base } from './Base'
import { Category } from './Category'
import { Venue } from './Venue'
import { Publication } from './Publication'
import { RevisionSubmissionService } from '../model/EventRevisionModel'
import { RevisionPublicationService } from '../model/EventRevisionModel'

export interface EventRevision extends Base{
  title: string
  description: string
  type: string
  public: boolean
  start: string
  end: string
  status: string
  venue: Venue
  category: Category
  subcategory: Category
  disclaimer: string
  tags: Array<string>
  published: string
  popularity: number
  banner: string
  thumbnail: string
  submissions: RevisionSubmissionService
  publications: RevisionPublicationService

  publish(schedule: string): Promise<Publication>
}