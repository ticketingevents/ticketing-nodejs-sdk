import { Base } from './Base'
import { Category } from './Category'
import { Host } from './Host'
import { Venue } from './Venue'
import { EventTierService } from '../model/EventListingModel'

export interface EventListing extends Base{
  title: string
  description: string
  start: string
  end: string
  host: Host
  venue: Venue
  category: Category
  subcategory: Category
  disclaimer: string
  tags: Array<string>
  published: string
  banner: string
  thumbnail: string

  tiers?: EventTierService
}