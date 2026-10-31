import { Category } from '../Category'
import { Venue } from '../Venue'

export interface EventRevisionData{
  title: string
  description: string
  type: string
  public: boolean
  category: Category | string
  subcategory: Category | string
  start?: string
  end?: string
  venue: Venue | string
  disclaimer?: string
  tags?: Array<string>
  banner?: string
  thumbnail?: string
}