import { APIAdapter } from './util/APIAdapter'
import { EventService, PresetService, RegionService, VenueService } from './service'

export class TickeTing{
  // Define private members
  private __apiAdapter: APIAdapter;

  // Define public services
  public events: EventService;
  public presets: PresetService;
  public regions: RegionService;
  public venues: VenueService;

  constructor(config: {apiKey: string, sandbox: boolean}){
    this.__apiAdapter = new APIAdapter(
      config.apiKey,
      config.sandbox?config.sandbox:false
    )

    this.events = new EventService(this.__apiAdapter)
    this.presets = new PresetService(this.__apiAdapter)
    this.regions = new RegionService(this.__apiAdapter)
    this.venues = new VenueService(this.__apiAdapter)
  }
}