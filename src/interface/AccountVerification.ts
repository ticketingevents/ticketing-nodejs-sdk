import { Base } from './Base'

export interface AccountVerification extends Base{
  email: string
  status: string

  confirm(details: {code: string}): Promise<boolean>
}