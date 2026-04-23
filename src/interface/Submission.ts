import { Base } from './Base'

export interface Submission extends Base{
  type: string
  resource: string
  previous: {[key: string]: string}
  changes: {[key: string]: string}
  status: string
  note: string
}