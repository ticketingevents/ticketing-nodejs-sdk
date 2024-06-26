import { Base } from './Base'
import { Venue } from './Venue'

export interface Event extends Base{
  title: string
  description: string
  type: string
  public: boolean
  category: {[key: string]: string}
  subcategory: string
  start: string
  end: string
  venue: Venue
  disclaimer: string
  tags: Array<string>
  banner: string
  thumbnail: string
  status: string
  published: string
  popularity: number
}