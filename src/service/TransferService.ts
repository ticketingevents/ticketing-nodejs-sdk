import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { AccountModel } from '../model/AccountModel'
import type { Parcel } from '../interface/Parcel'
import { ParcelModel} from '../model/ParcelModel'
import { TransferData } from '../interface/data/TransferData'
import type { Transfer } from '../interface/Transfer'
import { TransferModel} from '../model/TransferModel'
import { UnsupportedOperationError } from '../errors'

export class TransferService extends BaseService<TransferData, Transfer>{
  private __apiAdapter: APIAdapter

  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/transfers", TransferModel, ["role", "status"])

    this.__apiAdapter = apiAdapter
  }

  start(): Promise<Parcel>{
    return new Promise<Parcel>((resolve) => {
		resolve(new ParcelModel(this.__apiAdapter))
    })
  }

  create(): Promise<Transfer>{
    return new Promise<Transfer>((resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  batchCreate(): Promise<Array<Transfer>>{
    return new Promise<Array<Transfer>>((resolve, reject) => {
      reject(new UnsupportedOperationError(0, "Operation not supported"))
    })
  }

  protected _instantiateModel(data: any){
    const sender = new AccountModel(data.sender, this.__apiAdapter)
    const recipient = new AccountModel(data.recipient, this.__apiAdapter)
    return new TransferModel(data, sender, recipient, this.__apiAdapter)
  }
}