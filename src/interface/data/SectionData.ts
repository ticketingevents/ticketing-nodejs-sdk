export interface SectionData{
  name: string
  description: string
  price: {base: number, current: number, expires: string}
  salesStart: string
  salesEnd: string
  active: boolean
  capacity: number
  sold?: number
  remaining?: number
  reserved?: number
}