import { Base } from './Base'

export interface Region extends Base{
  name: string
  country: string
  district: string
  city: string
  icon: string
}