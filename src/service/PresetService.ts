import { APIAdapter } from '../util/APIAdapter'

export class PresetService{
  private __adapter: APIAdapter

  constructor(apiAdapter: APIAdapter){
    this.__adapter = apiAdapter
  }

  cache(options: true | { ttl?: number; key?: string; revalidateTimeout?: number } = true): PresetService {
    const scoped = Object.assign(
      Object.create(PresetService.prototype),
      this
    ) as PresetService
    scoped.__adapter = this.__adapter.cache(options)
    return scoped
  }

  nocache(): PresetService {
    const scoped = Object.assign(
      Object.create(PresetService.prototype),
      this
    ) as PresetService
    scoped.__adapter = this.__adapter.nocache()
    return scoped
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