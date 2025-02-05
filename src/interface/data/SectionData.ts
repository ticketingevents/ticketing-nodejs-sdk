export interface SectionData{
  name: string
  description: string
  basePrice: number
  salesStart: string
  salesEnd: string
  active: boolean
  capacity: number
  sold?: number
  remaining?: number
  reserved?: number
}