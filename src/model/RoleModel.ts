import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Role } from '../interface/Role'

export class RoleModel extends BaseModel implements Role{
  public name: string
  public permissions: Array<string>

  constructor(role: any, adapter: APIAdapter){
    super(role.self, adapter)

    this.name = role.name
    this.permissions = role.permissions
  }
}