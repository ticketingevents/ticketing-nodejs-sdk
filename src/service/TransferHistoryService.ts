import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { TransferModel } from '../model/TransferModel'
import type { Account } from '../interface/Account'
import type { TransferData } from '../interface/data/TransferData'
import type { Transfer } from '../interface/Transfer'

export class TransferHistoryService extends BaseService<TransferData, Transfer>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter, account: Account){
    super(apiAdapter, `${account.uri}/transfers`, TransferModel,
      ["status", "role"]
    )

    this.__apiAdapter = apiAdapter
  }

  protected _instantiateModel(data: any){
    const sender = `${data.sender.firstName} ${data.sender.lastName} (${data.sender.username})`
    const recipient = `${data.recipient.firstName} ${data.recipient.lastName} (${data.recipient.username})`
    return new TransferModel(data, sender, recipient, this.__apiAdapter)
  }
}