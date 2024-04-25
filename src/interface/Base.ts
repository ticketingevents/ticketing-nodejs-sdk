export interface Base{
  id: string | number
  
  save(): Promise<boolean>
  delete(): Promise<boolean>
}