import { Base } from './Base'

export interface Decision extends Base{
  approved: boolean
  note: string
}