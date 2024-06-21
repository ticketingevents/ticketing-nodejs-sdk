import { Base } from './Base'
import { Region } from './Region'

export interface AccountPreferences extends Base{
  region: Region | null
}