import { APIAdapter, SessionManager } from './util'
import {
  AccountService,
  CategoryService,
  EventService,
  HostService,
  OrderService,
  PresetService,
  RegionService,
  VenueService
} from './service'

export class TickeTing{
  // Define private members
  private __apiAdapter: APIAdapter;

  // Define public services
  public accounts: AccountService;
  public categories: CategoryService;
  public events: EventService;
  public hosts: HostService;
  public orders: OrderService;
  public presets: PresetService;
  public regions: RegionService;;
  public session: SessionManager;
  public venues: VenueService;

  constructor(config: {apiKey: string}){
    this.__apiAdapter = new APIAdapter(config.apiKey)

    this.session = new SessionManager(this.__apiAdapter)
    this.accounts = new AccountService(this.__apiAdapter)
    this.categories = new CategoryService(this.__apiAdapter)
    this.events = new EventService(this.__apiAdapter)
    this.hosts = new HostService(this.__apiAdapter)
    this.orders = new OrderService(this.__apiAdapter)
    this.presets = new PresetService(this.__apiAdapter)
    this.regions = new RegionService(this.__apiAdapter)
    this.venues = new VenueService(this.__apiAdapter)
  }

  get apiKey(): string{
    return this.__apiAdapter.key
  }

  get baseURL(): string{
    return this.__apiAdapter.base
  }

  get mediaURL(): string{
    return this.__apiAdapter.media
  }
}