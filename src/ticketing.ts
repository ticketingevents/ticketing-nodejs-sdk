import { APIAdapter } from './util/APIAdapter'
import { RegionService } from './service/RegionService'

export class TickeTing{
  // Define private members
  private __apiAdapter: APIAdapter;

  // Define public services
  public regions: RegionService;

  constructor(apiKey: string, sandbox: boolean = false){
    this.__apiAdapter = new APIAdapter(apiKey, sandbox)

    this.regions = new RegionService(this.__apiAdapter)
  }
}