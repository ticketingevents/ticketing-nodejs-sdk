import { APIAdapter } from '../util/APIAdapter'
import type { AdmissionSession } from '../interface/AdmissionSession'
import { InvalidStateError, UnsupportedOperationError } from '../errors'
import { EventListingModel } from './EventListingModel'
import { TierListingModel } from './TierListingModel'
import { BaseService } from '../service/BaseService'
import type { Ticket } from '../interface/Ticket'
import type { TicketData } from '../interface/data/TicketData'
import { TicketModel } from './TicketModel'
import type { EventListing } from '../interface/EventListing'
import type { Admission } from '../interface/Admission'
import type { AdmissionData } from '../interface/data/AdmissionData'
import { AdmissionModel } from './AdmissionModel'

export class AdmissionSessionModel implements AdmissionSession{
  public started: string
  public name: string
  public device: string
  public code: string
  public event: EventListingModel|null
  public tiers: Array<TierListingModel>

  private __apiAdapter: APIAdapter
  private __ticketService: TicketService
  private __historyService: AdmissionService

  constructor(admissionSession: any, adapter: APIAdapter){
    this.started = new Date().toISOString()
    this.name = admissionSession.name
    this.device = admissionSession.device
    this.code = admissionSession.code
    this.event = new EventListingModel(admissionSession.event, adapter)
    this.tiers = []

    this.__apiAdapter = adapter

    for(const tier of admissionSession.tiers){
      this.tiers.push(new TierListingModel(tier, adapter))
    }

    this.__ticketService = new TicketService(this.__apiAdapter, this.event)
    this.__historyService = new AdmissionService(this.__apiAdapter, this, this.event)
  }

  get tickets(): TicketService{
    return this.__ticketService
  }

  get admissions(): AdmissionService{
    return this.__historyService
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

export class TicketService extends BaseService<TicketData, Ticket>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter, event: EventListing){
    super(apiAdapter, `${event.uri}/tickets`, TicketModel,
      ["modified_since"]
    )

    this.__apiAdapter = apiAdapter
  }

  batchCreate(): Promise<Array<Ticket>>{
    return new Promise<Array<Ticket>>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }
}

export class AdmissionService extends BaseService<AdmissionData, Admission>{
  private __apiAdapter: APIAdapter
  private __session: AdmissionSession

  constructor(apiAdapter: APIAdapter, session: AdmissionSession, event: EventListing){
    super(apiAdapter, `${event.uri}/admissions`, AdmissionModel,
      ["redeemer","device","tier","serial","customer"],
      [],
      {"customer": "id"}
    )

    this.__apiAdapter = apiAdapter
    this.__session = session
  }

  admit(serials: string[]): Promise<Admission>{
    if(this.__session.started){
      return this.create({
        redeemer: this.__session.name,
        device: this.__session.device,
        serials: serials
      })
    }else{
      return new Promise((_resolve, reject) => {
        reject(new InvalidStateError(403, "The admission session has ended, you must start a new one."))
      })
    }
  }

  batchCreate(): Promise<Array<Admission>>{
    return new Promise<Array<Admission>>((_resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  protected _instantiateModel(data: any){
    if(Array.isArray(data)){
      const admissions = []
      for(const admission of data){
        admissions.push(new AdmissionModel(admission, this.__apiAdapter))
      }

      return admissions
    }else{
      return new AdmissionModel(data, this.__apiAdapter)
    }
  }
}