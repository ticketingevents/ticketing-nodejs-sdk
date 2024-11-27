import { Host } from '../Host'
import { Category } from '../Category'
import { Venue } from '../Venue'

export interface EventData{
  host?: Host | string
  title: string
  description: string
  type: string
  public: boolean
  category: Category | string
  subcategory: string
  venue: Venue | string
  start?: string
  end?: string
  disclaimer?: string
  tags?: Array<string>
  banner?: string
  thumbnail?: string
}