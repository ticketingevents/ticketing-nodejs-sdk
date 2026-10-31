import {
  CacheEntry,
  CachePersistenceAdapter,
  createDefaultPersistence,
  loadPersistedEntries,
  persistEntries
} from './CachePersistence'

export type { CacheEntry } from './CachePersistence'

export interface CacheStoreOptions {
  maxEntries?: number
  defaultTtl?: number
  /**
   * How long after soft expiry an entry may still be served as stale fallback.
   * `null` / `Infinity` keeps entries until LRU eviction (best for offline).
   * `0` hard-expires at the same time as soft TTL (legacy behavior).
   */
  staleTtl?: number | null
  persistence?: boolean | CachePersistenceAdapter
  persistenceNamespace?: string
  persistenceStorage?: 'local' | 'session'
}

export class CacheStore {
  private __entries = new Map<string, CacheEntry>()
  private __maxEntries: number
  private __defaultTtl: number
  private __staleTtl: number | null
  private __persistence: CachePersistenceAdapter | null

  constructor(options: CacheStoreOptions = {}) {
    this.__maxEntries = options.maxEntries ?? 100
    this.__defaultTtl = options.defaultTtl ?? 300000
    this.__staleTtl = options.staleTtl === undefined ? null : options.staleTtl
    this.__persistence = this.__resolvePersistence(options)
    this.__entries = loadPersistedEntries(this.__persistence)
    this.__prune()
  }

  get defaultTtl(): number {
    return this.__defaultTtl
  }

  get staleTtl(): number | null {
    return this.__staleTtl
  }

  /**
   * Return a fresh (non-stale) entry, or `undefined` if missing / soft-expired.
   */
  get(key: string): CacheEntry | undefined {
    const entry = this.__read(key)
    if (!entry || this.__isStale(entry)) {
      return undefined
    }

    this.__touch(key, entry)
    return entry
  }

  /**
   * Return a usable entry even if soft-expired (stale), unless hard-expired.
   */
  peek(key: string): CacheEntry | undefined {
    const entry = this.__read(key)
    if (!entry) {
      return undefined
    }

    this.__touch(key, entry)
    return entry
  }

  isFresh(entry: CacheEntry): boolean {
    return !this.__isStale(entry)
  }

  set(key: string, value: unknown, ttl?: number, staleTtl?: number | null): void {
    const resolvedTtl = ttl ?? this.__defaultTtl
    const resolvedStaleTtl = staleTtl === undefined ? this.__staleTtl : staleTtl
    const now = Date.now()
    const expiresAt = resolvedTtl <= 0 ? null : now + resolvedTtl
    const staleExpiresAt = this.__resolveStaleExpiresAt(expiresAt, resolvedStaleTtl)

    if (this.__entries.has(key)) {
      this.__entries.delete(key)
    }

    this.__entries.set(key, { value, expiresAt, staleExpiresAt })
    this.__prune()
  }

  delete(key: string): boolean {
    const deleted = this.__entries.delete(key)
    if (deleted) {
      this.__persist()
    }
    return deleted
  }

  clear(): void {
    this.__entries.clear()
    this.__persistence?.remove()
  }

  invalidate(predicate: (key: string) => boolean): void {
    let changed = false

    for (const key of this.__entries.keys()) {
      if (predicate(key)) {
        this.__entries.delete(key)
        changed = true
      }
    }

    if (changed) {
      this.__persist()
    }
  }

  private __resolvePersistence(options: CacheStoreOptions): CachePersistenceAdapter | null {
    if (options.persistence === false) {
      return null
    }

    if (options.persistence && typeof options.persistence !== 'boolean') {
      return options.persistence
    }

    return createDefaultPersistence({
      namespace: options.persistenceNamespace,
      storage: options.persistenceStorage
    })
  }

  private __read(key: string): CacheEntry | undefined {
    const entry = this.__entries.get(key)
    if (!entry) {
      return undefined
    }

    if (this.__isHardExpired(entry)) {
      this.__entries.delete(key)
      this.__persist()
      return undefined
    }

    return entry
  }

  private __touch(key: string, entry: CacheEntry): void {
    this.__entries.delete(key)
    this.__entries.set(key, entry)
  }

  private __isStale(entry: CacheEntry): boolean {
    return entry.expiresAt !== null && Date.now() >= entry.expiresAt
  }

  private __isHardExpired(entry: CacheEntry): boolean {
    const hardExpiry = this.__hardExpiry(entry)
    return hardExpiry !== null && Date.now() >= hardExpiry
  }

  private __hardExpiry(entry: CacheEntry): number | null {
    if (entry.staleExpiresAt !== undefined) {
      return entry.staleExpiresAt
    }

    // Legacy persisted entries: treat soft expiry as hard expiry.
    return entry.expiresAt
  }

  private __resolveStaleExpiresAt(
    expiresAt: number | null,
    staleTtl: number | null
  ): number | null {
    if (expiresAt === null) {
      return null
    }

    if (staleTtl === null || !Number.isFinite(staleTtl)) {
      return null
    }

    return expiresAt + Math.max(0, staleTtl)
  }

  private __prune(): void {
    const now = Date.now()
    let changed = false

    for (const [key, entry] of this.__entries) {
      const hardExpiry = this.__hardExpiry(entry)
      if (hardExpiry !== null && now >= hardExpiry) {
        this.__entries.delete(key)
        changed = true
      }
    }

    while (this.__entries.size > this.__maxEntries) {
      const oldestKey = this.__entries.keys().next().value
      if (oldestKey === undefined) {
        break
      }
      this.__entries.delete(oldestKey)
      changed = true
    }

    if (changed || this.__entries.size > 0) {
      this.__persist()
    }
  }

  private __persist(): void {
    persistEntries(this.__persistence, this.__entries)
  }
}
