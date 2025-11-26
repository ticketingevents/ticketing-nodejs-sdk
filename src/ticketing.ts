import { APIAdapter, SessionManager } from './util'
import {
  AccountService,
  CategoryService,
  EventService,
  HostService,
  OrderService,
  PresetService,
  RegionService,
  TransferService,
  VenueService
} from './service'

export class TickeTing{
  // Define private members
  private __apiAdapter: APIAdapter;
  public session: SessionManager

  constructor(config: {apiKey: string}){
    this.__apiAdapter = new APIAdapter(config.apiKey)
    this.session = new SessionManager(this.__apiAdapter)
  }

  get accounts(): AccountService{
    return new AccountService(this.__apiAdapter)
  }

  get categories(): CategoryService{
    return new CategoryService(this.__apiAdapter)
  }

  get events(): EventService{
    return new EventService(this.__apiAdapter)
  }

  get hosts(): HostService{
    return new HostService(this.__apiAdapter)
  }

  get orders(): OrderService{
    return new OrderService(this.__apiAdapter)
  }

  get presets(): PresetService{
    return new PresetService(this.__apiAdapter)
  }

  get regions(): RegionService{
    return new RegionService(this.__apiAdapter)
  }

  get transfers(): TransferService{
    return new TransferService(this.__apiAdapter)
  }

  get venues(): VenueService{
    return new VenueService(this.__apiAdapter)
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