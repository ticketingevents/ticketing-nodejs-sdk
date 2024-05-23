import { APIAdapter } from './util/APIAdapter'
import { PresetService, RegionService, VenueService } from './service'

export class TickeTing{
  // Define private members
  private __apiAdapter: APIAdapter;

  // Define public services
  public presets: PresetService;
  public regions: RegionService;
  public venues: VenueService;

  constructor(config: {apiKey: string, sandbox: boolean}){
    this.__apiAdapter = new APIAdapter(
      config.apiKey,
      config.sandbox?config.sandbox:false
    )

    this.presets = new PresetService(this.__apiAdapter)
    this.regions = new RegionService(this.__apiAdapter)
    this.venues = new VenueService(this.__apiAdapter)
  }
}