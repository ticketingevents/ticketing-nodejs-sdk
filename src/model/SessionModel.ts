import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Session } from '../interface/Session'
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