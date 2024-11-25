import { Base } from './Base'

export interface Category extends Base{
  name: string
  subcategories: Array<string>
}