import { APIAdapter, RequestCacheOptions, SessionManager } from './util'
import {
  AccountService,
  CategoryService,
  EventService,
  HostService,
  OrderService,
  PresetService,
  RegionService,
  SubmissionService,
  TransferService,
  VenueService
} from './service'

export class TickeTing{
  // Define private members
  private __apiAdapter: APIAdapter;
  public session: SessionManager

  constructor(config: {apiKey: string, cache?: RequestCacheOptions | boolean}){
    this.__apiAdapter = new APIAdapter(config.apiKey, config.cache ?? false)
    this.session = new SessionManager(this.__apiAdapter)
  }

  /**
   * Force caching for the next chained service calls, overriding the global setting.
   * @example ticketing.cache().events.find(1)
   */
  cache(options: true | { ttl?: number; key?: string } = true): TickeTing {
    return this.__withAdapter(this.__apiAdapter.cache(options))
  }

  /**
   * Bypass caching for the next chained service calls, overriding the global setting.
   * @example ticketing.nocache().events.find(1)
   */
  nocache(): TickeTing {
    return this.__withAdapter(this.__apiAdapter.nocache())
  }

  get cacheControls(){
    return this.__apiAdapter.cacheControls
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

  get submissions(): SubmissionService{
    return new SubmissionService(this.__apiAdapter)
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

  private __withAdapter(adapter: APIAdapter): TickeTing {
    const scoped = Object.create(TickeTing.prototype) as TickeTing
    scoped.__apiAdapter = adapter
    scoped.session = this.session
    return scoped
  }
}
