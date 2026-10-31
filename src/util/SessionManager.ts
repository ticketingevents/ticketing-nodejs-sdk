import { APIAdapter } from './APIAdapter'
import { UnsupportedOperationError, UnauthorisedError, ResourceNotFoundError, InvalidStateError } from '../errors'
import { AdmissionSession, SessionData, Session } from '../interface'
import { AdmissionSessionModel, SessionModel } from '../model'

export class SessionManager{
  private __apiAdapter: APIAdapter;
  private __session: Session;

  constructor(apiAdapter: APIAdapter){
    this.__apiAdapter = apiAdapter;
    this.__session = null
  }

  public start(credentials: SessionData): Promise<string>{
    return new Promise((resolve, reject) => {
      if(this.active){
        reject(new UnsupportedOperationError(0, "There is already an active session"))
      }else{
        this.__apiAdapter.post("/sessions", credentials).then(response => {

          this.__session = new SessionModel(response.data, this.__apiAdapter)
          this.__apiAdapter.key = this.__session.key

          resolve(response.data.key)
        }).catch(error => {
          if(error.code == 401){
            error = new UnauthorisedError(error.code, error.message)
          }else if(error.code == 404){
            error = new ResourceNotFoundError(error.code, error.message)
          }

          reject(error)
        })
      }
    })
  }

  public resume(key: string): Promise<boolean>{
    return new Promise((resolve, reject) => {
      if(this.active){
        reject(new UnsupportedOperationError(0, "There is already an active session."))
      }else{
        this.__apiAdapter.key = key
        this.__apiAdapter.get("/sessions/active").then(response => {
          this.__session = new SessionModel(response.data, this.__apiAdapter)

          resolve(true)
        }).catch(error => {
          this.__apiAdapter.reset()
          if(error.code == 403){
            error = new InvalidStateError(error.code, "The session has ended or does not exist.")
          }

          reject(error)
        })
      }
    })
  }

  public end(persist: boolean = true): Promise<boolean>{
    return new Promise((resolve, reject) => {
      if(!this.active){
        reject(new UnsupportedOperationError(0, "There is currently no active session."))
      }else{
        if(persist){
          this.__apiAdapter.delete("/sessions/active").then(() => {
            this.__session = null
            this.__apiAdapter.reset()

            resolve(true)
          }).catch(error => {
            if(error.code == 403){
              error = new InvalidStateError(error.code, "The session has ended or does not exist.")
            }

            reject(error)
          })
        }else{
          this.__session = null
          this.__apiAdapter.reset()

          resolve(true)
        }
      }
    })
  }

  public info(): Promise<Session>{
    return new Promise((resolve, reject) => {
      if(!this.active){
        reject(new UnsupportedOperationError(0, "There is currently no active session."))
      }else{
        resolve(this.__session)
      }
    })
  }

  public get active(): boolean{
    return this.__session != null
  }

  public admission(code: string, name: string, device: string): Promise<AdmissionSession>{
    return new Promise((resolve, reject) => {
      if(!code){
        reject(new UnauthorisedError(404, "Please provide a valid token to start an admission session."))
      }else{
        this.__apiAdapter.get(`/tokens`, {code: code}).then(response => {
          const token = response.data.entries[0]

          //Setup admissions session adapter
          const admissionsAdapter = new APIAdapter(token.api_key)

          //Load admission token event
          const session = new AdmissionSessionModel({
            started: (new Date()).toISOString(),
            name: name,
            device: device,
            code: code,
            event: token.event,
            tiers: token.tiers
          }, admissionsAdapter)

          resolve(session)
        }).catch(error => {
          if(error.code == 404){
            error = new UnauthorisedError(error.code, "The provided code does not belong to any event token")
          }

          reject(error)
        })
      }
    })
  }
}