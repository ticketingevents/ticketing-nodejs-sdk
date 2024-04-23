import { Base } from './Base'

export interface Region extends Base{
  public name: string
  public country: string
  public district: string
  public city: string
  public icon: string
}