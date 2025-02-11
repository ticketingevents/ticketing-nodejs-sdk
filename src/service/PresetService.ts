import { APIAdapter } from '../util'

export class PresetService{
  private __adapter: APIAdapter

  constructor(apiAdapter: APIAdapter){
    this.__adapter = apiAdapter
  }

  countries(): Promise<Array<string>>{
    return new Promise<Array<string>>((resolve, reject) => {
      this.__adapter.get("/countries").then(response => {
        resolve(response.data.countries)
      }).catch(error => {
        reject(error)
      })
    })
  }
}