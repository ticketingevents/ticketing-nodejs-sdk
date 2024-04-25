import { APIAdapter } from './util/APIAdapter'
import { RegionService } from './service'

export class TickeTing{
  // Define private members
  private __apiAdapter: APIAdapter;

  // Define public services
  public regions: RegionService;

  constructor(config: {apiKey: string, sandbox: boolean}){
    this.__apiAdapter = new APIAdapter(
      config.apiKey,
      config.sandbox?config.sandbox:false
    )

    this.regions = new RegionService(this.__apiAdapter)
  }
}