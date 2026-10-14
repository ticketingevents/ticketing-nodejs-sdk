export interface Base{
  id: string | number
  uri: string
  
  save(): Promise<boolean>
  delete(): Promise<boolean>
}