import { BaseModel } from './BaseModel'
import { Region } from '../interface/Region'

export class RegionModel extends BaseModel implements Region{
  delete(): Promise<boolean>{
    return new Promise((resolve, reject)=>{
      resolve(true)
    })
  }
}