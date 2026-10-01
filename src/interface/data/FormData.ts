export interface FormData{
  name: string
  description: string
  fields: Array<{name: string, type: number, required: boolean}>
}