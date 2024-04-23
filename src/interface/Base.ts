export interface Base{
  public id: string | number
  
  public save(): Promise<boolean>
  public delete(): Promise<boolean>
}