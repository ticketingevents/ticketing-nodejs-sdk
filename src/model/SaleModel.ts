import { APIAdapter } from '../util/APIAdapter'
import type { Sale } from '../interface/Sale'
import { BaseModel } from './BaseModel'
import type { EventListing } from '../interface/EventListing'
import { TierModel } from './TierModel'
import type { Account } from '../interface/Account'

export class SaleModel extends BaseModel implements Sale{
  public recorded: string
  public order: string
  public event: EventListing
  public tier: TierModel
  public customer: Account
  public quantity: number
  public total: number
  public status: string

  constructor(sale: any, adapter: APIAdapter){
    super(sale.self, adapter)

    this.recorded = sale.recorded
    this.order = sale.order
    this.quantity = sale.quantity
    this.total = sale.total
    this.status = sale.status
    this.event = {
      id: sale.event.self ? /([A-Za-z0-9\-]+)$/.exec(sale.event.self)[1] : "",
      uri: sale.event.self,
      title: sale.event.title,
      description: sale.event.description,
      start: sale.event.start,
      end: sale.event.end,
      host: sale.event.host,
      venue: sale.event.venue,
      category: sale.event.category,
      subcategory: sale.event.subcategory,
      disclaimer: sale.event.disclaimer,
      tags: sale.event.tags,
      published: sale.event.published,
      banner: sale.event.banner,
      thumbnail: sale.event.thumbnail
    }

    this.customer = {
        id: sale.customer.self ? /([A-Za-z0-9\-]+)$/.exec(sale.customer.self)[1] : "",
        uri: sale.customer.self,
        number: sale.customer.number,
        username: sale.customer.username,
        email: sale.customer.email,
        role: sale.customer.role,
        verified: sale.customer.verified,
        activated: sale.customer.activated,
        firstName: sale.customer.firstName,
        lastName: sale.customer.lastName,
        title: sale.customer.title,
        dateOfBirth: sale.customer.dateOfBirth,
        phone: sale.customer.phone,
        country: sale.customer.country,
        firstAddressLine: sale.customer.firstAddressLine,
        secondAddressLine: sale.customer.secondAddressLine,
        city: sale.customer.city,
        state: sale.customer.state,
    }

    if(sale.tier){
      this.tier = new TierModel(sale.tier, adapter)
    }
  }
}