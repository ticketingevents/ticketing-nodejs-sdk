import { APIAdapter } from '../util'
import { BaseModel } from './BaseModel'
import { Section } from '../interface/Section'
import { SectionData } from '../interface/data/SectionData'

export class SectionModel extends BaseModel implements Section{
  public name: string
  public description: string
  public basePrice: number
  public salesStart: string
  public salesEnd: string
  public active: boolean
  public capacity: number
  public sold: number
  public remaining: number
  public reserved: number

  constructor(section: any, adapter: APIAdapter){
    super(section.self, adapter)

    this.name = section.name
    this.description = section.description
    this.basePrice = section.basePrice
    this.salesStart = section.salesStart
    this.salesEnd = section.salesEnd
    this.active = section.active
    this.capacity = section.capacity
    this.sold = section.sold
    this.remaining = section.remaining
    this.reserved = section.reserved
  }

  serialise(): SectionData{
    const data: SectionData = {
      name: this.name,
      description: this.description,
      basePrice: this.basePrice,
      salesStart: this.salesStart,
      salesEnd: this.salesEnd,
      active: this.active,
      capacity: this.capacity,
      sold: this.sold,
      remaining: this.remaining,
      reserved: this.reserved
    }

    return data
  }
}