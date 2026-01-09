import { Base } from './Base'

export interface Lookup extends Base{
  identification: string
  role: string
  name: string
  found: boolean
}