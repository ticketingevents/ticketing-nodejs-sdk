import { Section } from '../Section'

export interface TokenData{
  id?: string | number,
  uri?: string,
  sections: Array<Section | string>
}