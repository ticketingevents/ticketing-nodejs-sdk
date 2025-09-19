import { Base } from './Base'
import { Collection } from '../util/Collection'
import { Category } from './Category'
import { Section } from './Section'
import { Token } from './Token'
import { Venue } from './Venue'
import type { Host } from './Host'
import { EventStatistics } from './reporting/EventStatistics'
import { SectionModel } from '../model/SectionModel'
import { TokenModel } from '../model/TokenModel'

export interface Event extends Base{
  title: string
  description: string
  type: string
  public: boolean
  category: Category
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
  sections: Array<Section>
  tokens: Collection<Token>
  host?: Host

  statistics(): Promise<EventStatistics>
  submit(): Promise<boolean>
  issue_token(sections: Array<SectionModel>): Promise<TokenModel>
}