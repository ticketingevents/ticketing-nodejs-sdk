import { Region } from '../Region'

export interface AccountPreferencesData{
  id?: string | number,
  uri?: string,
  region: Region | string
}