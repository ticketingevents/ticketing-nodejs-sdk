import { APIAdapter } from './util/APIAdapter'
import { RegionService, PresetService } from './service'

export class TickeTing{
  // Define private members
  private __apiAdapter: APIAdapter;

  // Define public services
  public regions: RegionService;
  public presets: PresetService;

  constructor(config: {apiKey: string, sandbox: boolean}){
    this.__apiAdapter = new APIAdapter(
      config.apiKey,
      config.sandbox?config.sandbox:false
    )

    this.regions = new RegionService(this.__apiAdapter)
    this.presets = new PresetService(this.__apiAdapter)
  }
}