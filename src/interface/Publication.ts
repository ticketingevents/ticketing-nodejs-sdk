import { Base } from './Base'

export interface Publication extends Base{
  changes: {[key: string]: string}
  publish_at: string
}