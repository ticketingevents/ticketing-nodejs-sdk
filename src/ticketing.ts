import { APIAdapter, RequestCacheOptions, SessionManager, TickeTingInterceptor } from './util'
import {
  AccountService,
  CategoryService,
  EventService,
  HostService,
  PresetService,
  RegionService,
  SubmissionService,
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
  cache(options: true | { ttl?: number; key?: string; revalidateTimeout?: number } = true): TickeTing {
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

  /**
   * The underlying axios interceptors, for adding your own request / response handlers.
   * @example ticketing.interceptors.request.use(config => config)
   */
  get interceptors(){
    return this.__apiAdapter.interceptors
  }

  /**
   * Add an Angular-style interceptor that wraps every SDK request.
   * Interceptors run in the order they were added. Returns a function that removes it.
   * @example ticketing.addInterceptor((req, next) => next(req.clone({ setHeaders: { 'X-Trace': id } })))
   */
  addInterceptor(interceptor: TickeTingInterceptor): () => void {
    return this.__apiAdapter.addInterceptor(interceptor)
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

  get presets(): PresetService{
    return new PresetService(this.__apiAdapter)
  }

  get regions(): RegionService{
    return new RegionService(this.__apiAdapter)
  }

  get submissions(): SubmissionService{
    return new SubmissionService(this.__apiAdapter)
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
