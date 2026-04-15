import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Privilege } from '../interface/Privilege'
import type { PrivilegeData } from '../interface/data/PrivilegeData'
import type { Role } from '../interface/Role'
import { RoleModel } from '../model/RoleModel'

export class PrivilegeModel extends BaseModel implements Privilege{
  readonly user: string
  readonly type: string
  readonly resource: string
  readonly pending: boolean

  private __role: Role

  constructor(privilege: any, adapter: APIAdapter){
    super(privilege.self, adapter)

    this.user = privilege.user
    this.type = privilege.type
    this.resource = privilege.resource.toString()
    this.pending = privilege.pending
    this.__role = new RoleModel(privilege.role, adapter)
  }

  get role(): Role{
    return this.__role
  }

  set role(new_role: string){
    this.__role.name = new_role
  }

  serialise(): PrivilegeData{
    return {
      role: this.role.name
    }
  }
}