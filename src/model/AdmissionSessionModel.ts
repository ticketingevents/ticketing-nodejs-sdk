import { APIAdapter, Collection } from '../util'
import { Admission, Ticket } from '../interface'
import { AdmissionService, TicketService } from '../service'
import { InvalidStateError } from '../errors'
import { AdmissionSession } from '../interface/AdmissionSession'
import { EventModel } from './EventModel'
import { SectionModel } from './SectionModel'

export class AdmissionSessionModel implements AdmissionSession{
  public started: string
  public name: string
  public device: string
  public code: string
  public event: EventModel|null
  public sections: Array<SectionModel>

  private __apiAdapter: APIAdapter
  private __admissionService: AdmissionService
  private __ticketService: TicketService

  constructor(admissionSession: any, adapter: APIAdapter){
    this.started = admissionSession.started
    this.name = admissionSession.name
    this.device = admissionSession.device
    this.code = admissionSession.code
    this.event = admissionSession.event
    this.sections = []

    //Index event sections
    const sectionMap = {}
    for(const section of this.event.sections){
      sectionMap[section.uri] = section
    }

    for(const section of admissionSession.sections){
      this.sections.push(sectionMap[section])
    }

    this.__apiAdapter = adapter
    this.__admissionService = new AdmissionService(this.__apiAdapter, this.event)
    this.__ticketService = new TicketService(this.__apiAdapter, this.event)
  }

  get admissions(): Collection<Admission>{
    if(this.started){
      return this.__admissionService.list()
    }else{
      return new Collection((resolve, reject) => {
        reject(new InvalidStateError(0, "The admission session has ended, you must start a new one."))
      })
    }
  }

  get tickets(): Collection<Ticket>{
    if(this.started){
      return this.__ticketService.list()
    }else{
      return new Collection((resolve, reject) => {
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
        this.sections = []
        this.__apiAdapter.key = ""

        resolve(true)
      }else{
        reject(new InvalidStateError(0, "The admission session has ended, you must start a new one."))
      }
    })
  }
}