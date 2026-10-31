import { Base } from './Base'

export interface PasswordReset extends Base{
  email: string
  status: string

  confirm(details: {code: string, password: string}): Promise<boolean>
}