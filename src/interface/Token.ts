import { Base } from './Base'
import { Section } from './Section'

export interface Token extends Base{
  code: string
  global: boolean
  sections: Array<Section>

  allow(section: Section)
  deny(section: Section)
}