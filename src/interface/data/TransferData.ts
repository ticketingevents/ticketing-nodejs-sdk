export interface TransferData{
  recipient: string
  tickets: Array<{
    tier: string,
    quantity: number
  }>
}