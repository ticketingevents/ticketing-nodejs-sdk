import axios, { AxiosResponse } from 'axios'
import {
  APIAdapter,
  attachRequestCache,
  CacheStore,
  MemoryCachePersistence,
  normalizeCacheOptions,
  shouldCacheRequest
} from '../../src/util'
import { TickeTing } from '../../src'
import { expect } from '../setup'

function createMockAdapter<T>(payload: T, delay = 0) {
  let callCount = 0
  let currentPayload = payload
  let currentDelay = delay
  let nextError: Error | null = null

  const adapter = (config: any): Promise<AxiosResponse<T>> => {
    callCount += 1

    if (nextError) {
      const error = nextError
      nextError = null
      return Promise.reject(error)
    }

    const responsePayload = currentPayload
    const responseDelay = currentDelay

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: responsePayload,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        })
      }, responseDelay)
    })
  }

  return {
    adapter,
    get callCount() {
      return callCount
    },
    setPayload(next: T) {
      currentPayload = next
    },
    setDelay(next: number) {
      currentDelay = next
    },
    failNext(error: Error) {
      nextError = error
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('Request cache', function () {
  this.timeout(10000)

  describe('normalizeCacheOptions / shouldCacheRequest', function () {
    it('normalizes boolean and object cache options', function () {
      expect(normalizeCacheOptions(undefined)).to.deep.equal({ enabled: false })
      expect(normalizeCacheOptions(false)).to.deep.equal({ enabled: false })
      expect(normalizeCacheOptions(true)).to.deep.equal({ enabled: true })
      expect(normalizeCacheOptions({ defaultTtl: 1000 })).to.deep.include({
        enabled: true,
        defaultTtl: 1000
      })
      expect(normalizeCacheOptions({ enabled: false, defaultTtl: 1000 })).to.deep.include({
        enabled: false,
        defaultTtl: 1000
      })
    })

    it('resolves per-request cache overrides against the global flag', function () {
      expect(shouldCacheRequest(false, undefined)).to.equal(false)
      expect(shouldCacheRequest(true, undefined)).to.equal(true)
      expect(shouldCacheRequest(true, false)).to.equal(false)
      expect(shouldCacheRequest(false, true)).to.equal(true)
      expect(shouldCacheRequest(false, { ttl: 10 })).to.equal(true)
    })
  })

  describe('basic GET caching', function () {
    it('caches GET responses until TTL expires', async function () {
      const mock = createMockAdapter({ id: 1 })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, { defaultTtl: 50, persistence: false })

      const first = await instance.get('/events/1')
      const second = await instance.get('/events/1')

      expect(mock.callCount).to.equal(1)
      expect(second.data).to.deep.equal(first.data)

      await delay(60)

      await instance.get('/events/1')
      expect(mock.callCount).to.equal(2)
    })

    it('caches HEAD responses', async function () {
      const mock = createMockAdapter({ id: 'head' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, { defaultTtl: 60000, persistence: false })

      await instance.head('/events/head')
      await instance.head('/events/head')
      expect(mock.callCount).to.equal(1)
    })

    it('deduplicates concurrent GET requests', async function () {
      const mock = createMockAdapter({ id: 2 }, 25)
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, { defaultTtl: 60000, persistence: false })

      const [first, second] = await Promise.all([
        instance.get('/events/2'),
        instance.get('/events/2')
      ])

      expect(mock.callCount).to.equal(1)
      expect(second.data).to.deep.equal(first.data)
    })

    it('isolates cache entries by query params and API key', async function () {
      const mock = createMockAdapter({ id: 3 })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      const cache = attachRequestCache(
        instance,
        { defaultTtl: 60000, persistence: false },
        () => instance.defaults.headers.common['X-API-Key'] as string
      )

      instance.defaults.headers.common['X-API-Key'] = 'key-a'
      await instance.get('/events', { params: { page: 1 } })
      await instance.get('/events', { params: { page: 2 } })

      instance.defaults.headers.common['X-API-Key'] = 'key-b'
      await instance.get('/events', { params: { page: 1 } })

      expect(mock.callCount).to.equal(3)

      instance.defaults.headers.common['X-API-Key'] = 'key-a'
      await instance.get('/events', { params: { page: 1 } })
      expect(mock.callCount).to.equal(3)

      cache.clear()
    })

    it('treats query params with different key order as the same cache entry', async function () {
      const mock = createMockAdapter({ id: 'params' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, { defaultTtl: 60000, persistence: false })

      await instance.get('/events', { params: { b: 2, a: 1 } })
      await instance.get('/events', { params: { a: 1, b: 2 } })

      expect(mock.callCount).to.equal(1)
    })

    it('supports a custom cache key', async function () {
      const mock = createMockAdapter({ id: 'custom-key' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, { defaultTtl: 60000, persistence: false })

      await instance.get('/events/a', { cache: { key: 'shared' } })
      await instance.get('/events/b', { cache: { key: 'shared' } })

      expect(mock.callCount).to.equal(1)
    })

    it('returns cloned cached data so callers cannot mutate the store', async function () {
      const mock = createMockAdapter({ count: 0 })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, { defaultTtl: 60000, persistence: false })

      const first = await instance.get('/events/mutable')
      first.data.count = 99

      const second = await instance.get('/events/mutable')
      expect(second.data.count).to.equal(0)
    })
  })

  describe('enable / disable overrides', function () {
    it('does not cache by default when globally disabled', async function () {
      const mock = createMockAdapter({ id: 9 })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, { enabled: false, defaultTtl: 60000, persistence: false })

      await instance.get('/events/9')
      await instance.get('/events/9')
      expect(mock.callCount).to.equal(2)
    })

    it('forces cache on for a request when globally disabled', async function () {
      const mock = createMockAdapter({ id: 10 })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, { enabled: false, defaultTtl: 60000, persistence: false })

      await instance.get('/events/10', { cache: true })
      await instance.get('/events/10', { cache: true })
      expect(mock.callCount).to.equal(1)

      await instance.get('/events/10')
      expect(mock.callCount).to.equal(2)
    })

    it('supports per-request cache opt-out and custom TTL', async function () {
      const mock = createMockAdapter({ id: 5 })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, { defaultTtl: 60000, persistence: false })

      await instance.get('/events/5', { cache: false })
      await instance.get('/events/5', { cache: false })
      expect(mock.callCount).to.equal(2)

      await instance.get('/events/6', { cache: { ttl: 20 } })
      await instance.get('/events/6')
      expect(mock.callCount).to.equal(3)

      await delay(25)
      await instance.get('/events/6')
      expect(mock.callCount).to.equal(4)
    })

    it('caches until invalidated when ttl is 0', async function () {
      const mock = createMockAdapter({ id: 'forever' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      const cache = attachRequestCache(instance, { defaultTtl: 10, persistence: false })

      await instance.get('/events/forever', { cache: { ttl: 0 } })
      await delay(25)
      await instance.get('/events/forever', { cache: { ttl: 0 } })
      expect(mock.callCount).to.equal(1)

      cache.invalidateUrl('/events/forever')
      await instance.get('/events/forever', { cache: { ttl: 0 } })
      expect(mock.callCount).to.equal(2)
    })
  })

  describe('mutation invalidation', function () {
    it('invalidates cached GET responses after POST mutations', async function () {
      const mock = createMockAdapter({ id: 4 })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, { defaultTtl: 60000, persistence: false })

      await instance.get('/events/4')
      await instance.post('/events/4', { name: 'updated' })
      await instance.get('/events/4')

      expect(mock.callCount).to.equal(3)
    })

    it('invalidates related paths for PUT, PATCH, and DELETE', async function () {
      const mock = createMockAdapter({ id: 'mut' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, { defaultTtl: 60000, persistence: false })

      await instance.get('/events')
      await instance.put('/events/1', { name: 'put' })
      await instance.get('/events')
      expect(mock.callCount).to.equal(3)

      await instance.patch('/events/1', { name: 'patch' })
      await instance.get('/events')
      expect(mock.callCount).to.equal(5)

      await instance.delete('/events/1')
      await instance.get('/events')
      expect(mock.callCount).to.equal(7)
    })

    it('skips mutation invalidation when invalidateOnMutation is false', async function () {
      const mock = createMockAdapter({ id: 'keep' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, {
        defaultTtl: 60000,
        invalidateOnMutation: false,
        persistence: false
      })

      await instance.get('/events/keep')
      await instance.post('/events/keep', { name: 'updated' })
      await instance.get('/events/keep')

      expect(mock.callCount).to.equal(2)
    })
  })

  describe('stale-while-revalidate', function () {
    it('returns fresh network data when revalidation beats the timeout', async function () {
      const mock = createMockAdapter({ id: 'fresh' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, {
        defaultTtl: 20,
        revalidateTimeout: 100,
        persistence: false
      })

      await instance.get('/events/fresh')
      expect(mock.callCount).to.equal(1)

      await delay(25)

      mock.setPayload({ id: 'updated' })
      const result = await instance.get('/events/fresh')

      expect(mock.callCount).to.equal(2)
      expect(result.data).to.deep.equal({ id: 'updated' })
    })

    it('returns stale data on timeout and refreshes in the background', async function () {
      const mock = createMockAdapter({ id: 'stale' }, 80)
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, {
        defaultTtl: 200,
        revalidateTimeout: 25,
        persistence: false
      })

      mock.setDelay(0)
      await instance.get('/events/swr')
      expect(mock.callCount).to.equal(1)

      await delay(210)

      mock.setPayload({ id: 'updated' })
      mock.setDelay(80)

      const started = Date.now()
      const staleResult = await instance.get('/events/swr')
      const elapsed = Date.now() - started

      expect(staleResult.data).to.deep.equal({ id: 'stale' })
      expect(elapsed).to.be.below(70)
      expect(mock.callCount).to.equal(2)

      await delay(100)

      mock.setDelay(0)
      const refreshed = await instance.get('/events/swr')
      expect(refreshed.data).to.deep.equal({ id: 'updated' })
      expect(mock.callCount).to.equal(2)
    })

    it('honors a per-request revalidateTimeout override', async function () {
      const mock = createMockAdapter({ id: 'override' }, 60)
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, {
        defaultTtl: 20,
        revalidateTimeout: 200,
        persistence: false
      })

      mock.setDelay(0)
      await instance.get('/events/override')
      await delay(25)

      mock.setPayload({ id: 'new' })
      mock.setDelay(60)

      const started = Date.now()
      const result = await instance.get('/events/override', {
        cache: { revalidateTimeout: 15 }
      })
      const elapsed = Date.now() - started

      expect(result.data).to.deep.equal({ id: 'override' })
      expect(elapsed).to.be.below(50)
      expect(mock.callCount).to.equal(2)

      await delay(80)
    })

    it('falls back to stale cache when the network fails', async function () {
      const mock = createMockAdapter({ id: 'offline' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, {
        defaultTtl: 20,
        revalidateTimeout: 50,
        persistence: false
      })

      await instance.get('/events/offline')
      expect(mock.callCount).to.equal(1)

      await delay(25)

      mock.failNext(new Error('network down'))
      const result = await instance.get('/events/offline')

      expect(result.data).to.deep.equal({ id: 'offline' })
      expect(mock.callCount).to.equal(2)
    })

    it('rejects when the network fails and no cache is available', async function () {
      const mock = createMockAdapter({ id: 'none' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, { defaultTtl: 60000, persistence: false })

      mock.failNext(new Error('network down'))

      let failed = false
      try {
        await instance.get('/events/none')
      } catch {
        failed = true
      }

      expect(failed).to.equal(true)
      expect(mock.callCount).to.equal(1)
    })

    it('shares a single in-flight revalidation across concurrent stale readers', async function () {
      const mock = createMockAdapter({ id: 'shared' }, 40)
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, {
        defaultTtl: 20,
        revalidateTimeout: 100,
        persistence: false
      })

      mock.setDelay(0)
      await instance.get('/events/shared')
      await delay(25)

      mock.setPayload({ id: 'refreshed' })
      mock.setDelay(40)

      const [first, second] = await Promise.all([
        instance.get('/events/shared'),
        instance.get('/events/shared')
      ])

      expect(mock.callCount).to.equal(2)
      expect(first.data).to.deep.equal({ id: 'refreshed' })
      expect(second.data).to.deep.equal({ id: 'refreshed' })
    })

    it('stops serving stale data after the staleTtl window ends', async function () {
      const mock = createMockAdapter({ id: 'window' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(instance, {
        defaultTtl: 20,
        staleTtl: 30,
        revalidateTimeout: 50,
        persistence: false
      })

      await instance.get('/events/window')
      await delay(25)

      mock.failNext(new Error('temporary'))
      const withinWindow = await instance.get('/events/window')
      expect(withinWindow.data).to.deep.equal({ id: 'window' })

      await delay(40)

      mock.failNext(new Error('gone'))
      let failed = false
      try {
        await instance.get('/events/window')
      } catch {
        failed = true
      }

      expect(failed).to.equal(true)
    })
  })

  describe('cache controls', function () {
    it('clears all cached entries', async function () {
      const mock = createMockAdapter({ id: 'clear' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      const cache = attachRequestCache(instance, { defaultTtl: 60000, persistence: false })

      await instance.get('/events/clear')
      expect(mock.callCount).to.equal(1)

      cache.clear()
      await instance.get('/events/clear')
      expect(mock.callCount).to.equal(2)
    })

    it('invalidates entries by predicate', async function () {
      const mock = createMockAdapter({ id: 'pred' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      const cache = attachRequestCache(instance, { defaultTtl: 60000, persistence: false })

      await instance.get('/events/a')
      await instance.get('/venues/a')
      expect(mock.callCount).to.equal(2)

      cache.invalidate((key) => key.includes('/events/'))
      await instance.get('/events/a')
      await instance.get('/venues/a')
      expect(mock.callCount).to.equal(3)
    })

    it('invalidates entries related to a URL path', async function () {
      const mock = createMockAdapter({ id: 'url' })
      const instance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      const cache = attachRequestCache(instance, { defaultTtl: 60000, persistence: false })

      await instance.get('/events')
      await instance.get('/events/42')
      await instance.get('/venues/1')
      expect(mock.callCount).to.equal(3)

      cache.invalidateUrl('/events/42')
      await instance.get('/events')
      await instance.get('/events/42')
      await instance.get('/venues/1')
      expect(mock.callCount).to.equal(5)
    })
  })

  describe('persistence', function () {
    it('persists cache entries across new cache instances', async function () {
      const persistence = new MemoryCachePersistence()
      const mock = createMockAdapter({ id: 7 })
      const cacheOptions = {
        defaultTtl: 60000,
        persistence: { storage: persistence }
      }

      const firstInstance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(firstInstance, cacheOptions)
      await firstInstance.get('/events/7')

      const secondInstance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(secondInstance, cacheOptions)
      await secondInstance.get('/events/7')

      expect(mock.callCount).to.equal(1)
    })

    it('does not persist hard-expired entries across new cache instances', async function () {
      const persistence = new MemoryCachePersistence()
      const mock = createMockAdapter({ id: 8 })
      const cacheOptions = {
        defaultTtl: 20,
        staleTtl: 0,
        persistence: { storage: persistence }
      }

      const firstInstance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(firstInstance, cacheOptions)
      await firstInstance.get('/events/8')

      await delay(25)

      const secondInstance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(secondInstance, cacheOptions)
      await secondInstance.get('/events/8')

      expect(mock.callCount).to.equal(2)
    })

    it('reuses soft-expired persisted entries as stale fallback', async function () {
      const persistence = new MemoryCachePersistence()
      const mock = createMockAdapter({ id: 'persisted-stale' })
      const cacheOptions = {
        defaultTtl: 20,
        staleTtl: null as number | null,
        revalidateTimeout: 50,
        persistence: { storage: persistence }
      }

      const firstInstance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(firstInstance, cacheOptions)
      await firstInstance.get('/events/persisted-stale')

      await delay(25)

      const secondInstance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(secondInstance, cacheOptions)

      mock.failNext(new Error('offline'))
      const result = await secondInstance.get('/events/persisted-stale')

      expect(result.data).to.deep.equal({ id: 'persisted-stale' })
      expect(mock.callCount).to.equal(2)
    })

    it('clears persisted storage when the cache is cleared', async function () {
      const persistence = new MemoryCachePersistence()
      const mock = createMockAdapter({ id: 'persist-clear' })
      const cacheOptions = {
        defaultTtl: 60000,
        persistence: { storage: persistence }
      }

      const firstInstance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      const cache = attachRequestCache(firstInstance, cacheOptions)
      await firstInstance.get('/events/persist-clear')
      expect(persistence.read()).to.not.equal(null)

      cache.clear()
      expect(persistence.read()).to.equal(null)

      const secondInstance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(secondInstance, cacheOptions)
      await secondInstance.get('/events/persist-clear')
      expect(mock.callCount).to.equal(2)
    })

    it('supports a custom persistence adapter', async function () {
      let stored: string | null = null
      const custom = {
        read: () => stored,
        write: (data: string) => {
          stored = data
        },
        remove: () => {
          stored = null
        }
      }

      const mock = createMockAdapter({ id: 'custom-persist' })
      const firstInstance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(firstInstance, {
        defaultTtl: 60000,
        persistence: { storage: custom }
      })
      await firstInstance.get('/events/custom-persist')
      expect(stored).to.be.a('string')

      const secondInstance = axios.create({ baseURL: 'https://api.example.com', adapter: mock.adapter })
      attachRequestCache(secondInstance, {
        defaultTtl: 60000,
        persistence: { storage: custom }
      })
      await secondInstance.get('/events/custom-persist')
      expect(mock.callCount).to.equal(1)
    })
  })

  describe('CacheStore', function () {
    it('evicts the least recently used entry when maxEntries is exceeded', function () {
      const store = new CacheStore({
        maxEntries: 2,
        defaultTtl: 60000,
        persistence: false
      })

      store.set('a', { id: 'a' })
      store.set('b', { id: 'b' })
      store.get('a')
      store.set('c', { id: 'c' })

      expect(store.get('a')).to.exist
      expect(store.get('b')).to.equal(undefined)
      expect(store.get('c')).to.exist
    })

    it('peek returns soft-expired entries that get does not', function () {
      const store = new CacheStore({
        defaultTtl: 20,
        staleTtl: 1000,
        persistence: false
      })

      store.set('k', { id: 1 })
      expect(store.get('k')).to.exist

      return delay(25).then(() => {
        expect(store.get('k')).to.equal(undefined)
        expect(store.peek('k')).to.exist
        expect(store.isFresh(store.peek('k')!)).to.equal(false)
      })
    })

    it('treats legacy entries without staleExpiresAt as hard-expired at expiresAt', function () {
      const persistence = new MemoryCachePersistence()
      persistence.write(JSON.stringify({
        version: 1,
        entries: [[
          'legacy',
          { value: { id: 'legacy' }, expiresAt: Date.now() - 10 }
        ]]
      }))

      const store = new CacheStore({
        persistence,
        defaultTtl: 60000
      })

      expect(store.get('legacy')).to.equal(undefined)
      expect(store.peek('legacy')).to.equal(undefined)
    })
  })

  describe('APIAdapter / TickeTing integration', function () {
    it('disables caching by default on APIAdapter', async function () {
      const adapter = new APIAdapter('test-api-key')
      expect(adapter.cacheControls).to.exist

      const mock = createMockAdapter({ id: 11 })
      ;(adapter as any).__requester.defaults.adapter = mock.adapter
      ;(adapter as any).__requester.defaults.baseURL = 'https://api.example.com'

      await adapter.get('/events/11')
      await adapter.get('/events/11')
      expect(mock.callCount).to.equal(2)
    })

    it('supports adapter.cache() and adapter.nocache() chaining overrides', async function () {
      const adapter = new APIAdapter('test-api-key', { defaultTtl: 60000, persistence: false })
      const mock = createMockAdapter({ id: 12 })
      ;(adapter as any).__requester.defaults.adapter = mock.adapter
      ;(adapter as any).__requester.defaults.baseURL = 'https://api.example.com'

      await adapter.nocache().get('/events/12')
      await adapter.nocache().get('/events/12')
      expect(mock.callCount).to.equal(2)

      const cachedAdapter = new APIAdapter('test-api-key', false)
      const cachedMock = createMockAdapter({ id: 13 })
      ;(cachedAdapter as any).__requester.defaults.adapter = cachedMock.adapter
      ;(cachedAdapter as any).__requester.defaults.baseURL = 'https://api.example.com'

      await cachedAdapter.cache().get('/events/13')
      await cachedAdapter.cache().get('/events/13')
      expect(cachedMock.callCount).to.equal(1)
    })

    it('clears the cache when APIAdapter.reset() is called', async function () {
      const adapter = new APIAdapter('test-api-key', {
        enabled: true,
        defaultTtl: 60000,
        persistence: false
      })
      const mock = createMockAdapter({ id: 14 })
      ;(adapter as any).__requester.defaults.adapter = mock.adapter
      ;(adapter as any).__requester.defaults.baseURL = 'https://api.example.com'

      await adapter.get('/events/14')
      expect(mock.callCount).to.equal(1)

      adapter.reset()
      await adapter.get('/events/14')
      expect(mock.callCount).to.equal(2)
    })

    it('supports TickeTing.cache() / nocache() chaining', async function () {
      const ticketing = new TickeTing({ apiKey: 'test-api-key' })
      expect(ticketing.cacheControls).to.exist
      expect(ticketing.cache().events).to.exist
      expect(ticketing.nocache().events).to.exist
      expect(ticketing.cache({ ttl: 1000, revalidateTimeout: 500 }).events).to.exist
    })
  })
})
