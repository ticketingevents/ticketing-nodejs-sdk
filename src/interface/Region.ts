import { Base } from './Base'

export interface Region extends Base{
  public delete(): Promise<boolean>
}