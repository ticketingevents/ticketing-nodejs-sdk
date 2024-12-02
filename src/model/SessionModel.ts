import { APIAdapter } from '../util'
import { BaseModel } from './BaseModel'
import { Session } from '../interface/Session'
import { AccountModel } from './AccountModel'

export class SessionModel extends BaseModel implements Session{
  public started: string
  public key: string
  public account: AccountModel

  constructor(session: any, adapter: APIAdapter){
    super(session.self, adapter)

    this.started = session.started
    this.key = session.key
    this.account = new AccountModel(session.account, adapter)
  }
}