import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import { CachePersistenceAdapter, CachePersistenceOptions } from './CachePersistence'
import { CacheStore } from './CacheStore'

export interface RequestCacheOptions {
  enabled?: boolean
  defaultTtl?: number
  maxEntries?: number
  invalidateOnMutation?: boolean
  persistence?: boolean | CachePersistenceOptions
}

export interface RequestCacheController {
  clear(): void
  invalidate(predicate: (key: string) => boolean): void
  invalidateUrl(url: string): void
}

interface CacheAwareAxiosRequestConfig extends InternalAxiosRequestConfig {
  __cacheKey?: string
  __skipCache?: boolean
}

declare module 'axios' {
  export interface AxiosRequestConfig {
  /**
   * Control response caching for this request.
   * - `true` uses the default TTL
   * - `false` bypasses the cache
   * - `{ ttl }` sets a per-request TTL in milliseconds (`0` caches until invalidated)
   * - `{ key }` uses a custom cache key
   */
    cache?: boolean | { ttl?: number; key?: string }
  }
}

const CACHEABLE_METHODS = new Set(['get', 'head'])
const CACHE_KEY_SEPARATOR = '\x1e'

export function normalizeCacheOptions(
  cache?: RequestCacheOptions | boolean
): RequestCacheOptions {
  if (cache === false || cache === undefined) {
    return { enabled: false }
  }

  if (cache === true) {
    return { enabled: true }
  }

  return {
    ...cache,
    enabled: cache.enabled ?? true
  }
}

/**
 * Decide whether a request should be cached.
 * Per-request `cache: true | { ... }` forces caching on.
 * Per-request `cache: false` forces caching off.
 * When unset, the global `enabled` flag applies.
 */
export function shouldCacheRequest(
  enabled: boolean,
  cache: AxiosRequestConfig['cache']
): boolean {
  if (cache === false) {
    return false
  }

  if (cache === true || typeof cache === 'object') {
    return true
  }

  return enabled
}

export function attachRequestCache(
  instance: AxiosInstance,
  options: RequestCacheOptions = {},
  getApiKey: () => string = () => ''
): RequestCacheController {
  // When attaching directly, default to on. SDK entry points pass an explicit `enabled`.
  const enabled = options.enabled !== false
  const invalidateOnMutation = options.invalidateOnMutation !== false
  const store = new CacheStore({
    maxEntries: options.maxEntries,
    defaultTtl: options.defaultTtl,
    ...resolvePersistenceOptions(options.persistence)
  })
  const inflight = new Map<string, Promise<AxiosResponse>>()

  const requestInterceptorId = instance.interceptors.request.use((config: CacheAwareAxiosRequestConfig) => {
    const method = (config.method || 'get').toLowerCase()

    if (!CACHEABLE_METHODS.has(method)) {
      if (invalidateOnMutation && ['post', 'put', 'patch', 'delete'].includes(method)) {
        config.__skipCache = true
      }
      return config
    }

    if (!shouldCacheRequest(enabled, config.cache)) {
      return config
    }

    const cacheKey = resolveCacheKey(config, getApiKey())
    config.__cacheKey = cacheKey

    const cached = store.get(cacheKey)
    if (cached) {
      config.adapter = () => Promise.resolve(cloneResponse(cached.value as AxiosResponse))
      return config
    }

    const pending = inflight.get(cacheKey)
    if (pending) {
      config.adapter = () => pending.then(response => cloneResponse(response))
      return config
    }

    const defaultAdapter = axios.getAdapter(config.adapter || axios.defaults.adapter)
    if (!defaultAdapter) {
      return config
    }

    let resolveShared!: (response: AxiosResponse) => void
    let rejectShared!: (error: unknown) => void
    const shared = new Promise<AxiosResponse>((resolve, reject) => {
      resolveShared = resolve
      rejectShared = reject
    })
    inflight.set(cacheKey, shared)

    config.adapter = (requestConfig) => {
      return defaultAdapter(requestConfig).then(
        (response) => {
          const cachedResponse = cloneResponse(response)
          store.set(cacheKey, cachedResponse, resolveTtl(requestConfig))
          inflight.delete(cacheKey)
          resolveShared(cachedResponse)
          return response
        },
        (error) => {
          inflight.delete(cacheKey)
          rejectShared(error)
          return Promise.reject(error)
        }
      )
    }

    return config
  })

  const responseInterceptorId = instance.interceptors.response.use(
    (response) => {
      const config = response.config as CacheAwareAxiosRequestConfig

      if (invalidateOnMutation && config.__skipCache) {
        invalidateUrl(store, resolveRequestPath(config))
      }

      return response
    },
    (error) => {
      const config = error.config as CacheAwareAxiosRequestConfig | undefined
      if (config?.__cacheKey) {
        inflight.delete(config.__cacheKey)
      }
      return Promise.reject(error)
    }
  )

  return {
    clear(): void {
      store.clear()
      inflight.clear()
    },
    invalidate(predicate: (key: string) => boolean): void {
      store.invalidate(predicate)
    },
    invalidateUrl(url: string): void {
      invalidateUrl(store, url)
    },
    detach(): void {
      instance.interceptors.request.eject(requestInterceptorId)
      instance.interceptors.response.eject(responseInterceptorId)
    }
  } as RequestCacheController & { detach(): void }
}

function resolveCacheKey(config: AxiosRequestConfig, apiKey: string): string {
  if (typeof config.cache === 'object' && config.cache.key) {
    return config.cache.key
  }

  const method = (config.method || 'get').toLowerCase()
  const url = resolveRequestUrl(config)
  const params = stableSerialize(config.params)
  return [method, url, params, apiKey].join(CACHE_KEY_SEPARATOR)
}

function resolveTtl(config: AxiosRequestConfig): number | undefined {
  if (config.cache === true || config.cache === undefined) {
    return undefined
  }

  if (typeof config.cache === 'object' && config.cache.ttl !== undefined) {
    return config.cache.ttl
  }

  return undefined
}

function resolveRequestUrl(config: AxiosRequestConfig): string {
  const requestUrl = config.url || ''

  if (requestUrl.startsWith('http://') || requestUrl.startsWith('https://')) {
    return requestUrl
  }

  const baseURL = config.baseURL || ''
  if (!baseURL) {
    return requestUrl
  }

  return `${baseURL.replace(/\/$/, '')}/${requestUrl.replace(/^\//, '')}`
}

function resolveRequestPath(config: AxiosRequestConfig): string {
  return toPathname(resolveRequestUrl(config))
}

function invalidateUrl(store: CacheStore, url: string): void {
  const mutationPath = toPathname(url)

  store.invalidate((key) => {
    const cachedUrl = parseCacheKey(key)?.url
    if (!cachedUrl) {
      return false
    }

    const cachedPath = toPathname(cachedUrl)
    return cachedPath === mutationPath
      || cachedPath.startsWith(`${mutationPath}/`)
      || mutationPath.startsWith(`${cachedPath}/`)
  })
}

function parseCacheKey(key: string): { method: string, url: string, params: string, apiKey: string } | null {
  const parts = key.split(CACHE_KEY_SEPARATOR)
  if (parts.length !== 4) {
    return null
  }

  return {
    method: parts[0],
    url: parts[1],
    params: parts[2],
    apiKey: parts[3]
  }
}

function toPathname(url: string): string {
  const normalized = url.split('?')[0].replace(/\/$/, '') || '/'

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    const pathStart = normalized.indexOf('/', normalized.indexOf('://') + 3)
    return pathStart >= 0 ? normalized.slice(pathStart) : '/'
  }

  return normalized.startsWith('/') ? normalized : `/${normalized}`
}

function stableSerialize(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value !== 'object') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(',')}]`
  }

  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort()
  return `{${keys.map((key) => `${key}:${stableSerialize(record[key])}`).join(',')}}`
}

function cloneResponse<T>(response: AxiosResponse<T>): AxiosResponse<T> {
  return {
    ...response,
    headers: { ...response.headers },
    config: { ...response.config },
    data: cloneData(response.data)
  }
}

function cloneData<T>(data: T): T {
  if (data === undefined || data === null) {
    return data
  }

  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(data)
  }

  return JSON.parse(JSON.stringify(data))
}

function resolvePersistenceOptions(
  persistence: RequestCacheOptions['persistence']
): {
  persistence?: boolean | CachePersistenceAdapter
  persistenceNamespace?: string
  persistenceStorage?: 'local' | 'session'
} {
  if (persistence === false) {
    return { persistence: false }
  }

  if (!persistence || persistence === true) {
    return { persistence: true }
  }

  if (typeof persistence.storage !== 'undefined' && typeof persistence.storage !== 'string') {
    return {
      persistence: persistence.storage,
      persistenceNamespace: persistence.namespace
    }
  }

  return {
    persistence: true,
    persistenceNamespace: persistence.namespace,
    persistenceStorage: persistence.storage
  }
}
