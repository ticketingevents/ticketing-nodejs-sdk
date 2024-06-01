import { Venue } from '../Venue'

export interface EventData{
  host?: string
  title: string
  description: string
  type: string
  public: boolean
  category: string
  subcategory: string
  venue: Venue | string
  start?: string
  end?: string
  disclaimer?: string
  tags?: Array<string>
  banner?: string
  thumbnail?: string
}