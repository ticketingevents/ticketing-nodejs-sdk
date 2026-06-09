import { APIAdapter } from '../util/APIAdapter'
import { Collection } from '../util/Collection'
import type { Admission } from '../interface/Admission'
import type { Ticket } from '../interface/Ticket'
import type { AdmissionSession } from '../interface/AdmissionSession'
import { AdmissionService } from '../service/AdmissionService'
import { TicketService } from '../service/TicketService'
import { InvalidStateError } from '../errors'
import { EventListingModel } from './EventListingModel'
import { TierListingModel } from './TierListingModel'

export class AdmissionSessionModel implements AdmissionSession{
  public started: string
  public name: string
  public device: string
  public code: string
  public event: EventListingModel|null
  public tiers: Array<TierListingModel>

  private __apiAdapter: APIAdapter
  private __admissionService: AdmissionService
  private __ticketService: TicketService

  constructor(admissionSession: any, adapter: APIAdapter){
    this.started = admissionSession.started
    this.name = admissionSession.name
    this.device = admissionSession.device
    this.code = admissionSession.code
    this.event = admissionSession.event
    this.tiers = []

    this.__apiAdapter = adapter
    this.__admissionService = new AdmissionService(this.__apiAdapter, this.event)
    this.__ticketService = new TicketService(this.__apiAdapter, this.event)

    //Index event tiers
    const tierMap = {}

    this.event.tiers.list().then(tiers => {
      for(const tier of tiers){
        tierMap[tier.uri] = tier
      }

      for(const tier of admissionSession.tiers){
        this.tiers.push(tierMap[tier])
      }
    })
  }

  admissions(pageLength: number): Collection<Admission>{
    if(this.started){
      return this.__admissionService.list(pageLength)
    }else{
      return new Collection((_resolve, reject) => {
        reject(new InvalidStateError(0, "The admission session has ended, you must start a new one."))
      })
    }
  }

  tickets(pageLength: number): Collection<Ticket>{
    if(this.started){
      return this.__ticketService.list(pageLength)
    }else{
      return new Collection((_resolve, reject) => {
        reject(new InvalidStateError(0, "The admission session has ended, you must start a new one."))
      })
    }
  }

  admit(serials: string[]): Promise<Array<Admission>>{
    return new Promise<Array<Admission>>((resolve, reject) => {
      if(this.started){
        this.__admissionService.batchCreate({
          redeemer: this.name,
          device: this.device,
          serials: serials
        }).then(admissions => {
          resolve(admissions)
        }).catch(error => {
          reject(error)
        })
      }else{
        reject(new InvalidStateError(0, "The admission session has ended, you must start a new one."))
      }
    })
  }

  end(): Promise<boolean>{
    return new Promise((resolve, reject)=>{
      if(this.started){
        this.started = ""
        this.name = ""
        this.device = ""
        this.code = ""
        this.event = null
        this.tiers = []
        this.__apiAdapter.key = ""

        resolve(true)
      }else{
        reject(new InvalidStateError(0, "The admission session has ended, you must start a new one."))
      }
    })
  }
}