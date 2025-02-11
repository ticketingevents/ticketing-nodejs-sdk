import { Base } from './Base'
import { Collection } from '../util'
import { Category } from './Category'
import { Section } from './Section'
import { Token } from './Token'
import { Venue } from './Venue'

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

  submit(): Promise<boolean>
  issue_token(sections: Array<SectionModel>): Promise<TokenModel>
}