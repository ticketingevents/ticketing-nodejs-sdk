import { Base } from './Base'
import { Role } from './Role'

export interface Privilege extends Base{
  user: string
  role: Role
  type: string
  resource: string
  pending: boolean
}