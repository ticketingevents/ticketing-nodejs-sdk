import { Base } from './Base'

export interface Form extends Base{
  name: string
  description: string
  fields: Array<{name: string, type: number, required: boolean}>
}