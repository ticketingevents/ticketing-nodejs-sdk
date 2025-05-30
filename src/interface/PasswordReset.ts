import { Base } from './Base'

export interface PasswordReset extends Base{
  email: string
  status: string

  confirm(details: {otp: string, password: string}): Promise<boolean>
}