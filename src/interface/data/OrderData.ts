export interface OrderData{
  id?: string | number,
  uri?: string,
  customer: string
  items: {[key: string]: number}
}