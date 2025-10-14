import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Section } from '../interface/Section'
import type { SectionData } from '../interface/data/SectionData'

export class SectionModel extends BaseModel implements Section{
  public name: string
  public description: string
  public price: {base: number, current: number, expires: string}
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
    this.price = section.price
    this.salesStart = section.salesStart
    this.salesEnd = section.salesEnd
    this.active = section.active
    this.capacity = section.capacity
    this.sold = section.sold?section.sold:0
    this.remaining = section.remaining?section.remaining:section.capacity
    this.reserved = section.reserved?section.reserved:0
  }

  get fees(): number{
    if(this.price.base <= 50){
      return 0.99
    }else if(this.price.base <= 100){
      return 1.99
    }else if(this.price.base <= 150){
      return 2.99
    }else if(this.price.base <= 200){
      return 3.99
    }else{
      return 4.99
    }
  }

  serialise(): SectionData{
    const data: SectionData = {
      name: this.name,
      description: this.description,
      price: this.price,
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