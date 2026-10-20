import {
  CacheEntry,
  CachePersistenceAdapter,
  createDefaultPersistence,
  DEFAULT_PERSISTENCE_DEBOUNCE,
  DEFAULT_PERSISTENCE_MAX_SIZE,
  loadPersistedEntries,
  serializeEntries
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
  /** Maximum persisted blob size in characters. */
  persistenceMaxSize?: number
  /** Delay before writing changes to storage, in ms. `0` writes synchronously. */
  persistenceDebounce?: number
}

export class CacheStore {
  private __entries = new Map<string, CacheEntry>()
  private __maxEntries: number
  private __defaultTtl: number
  private __staleTtl: number | null
  private __persistence: CachePersistenceAdapter | null
  private __persistMaxSize: number
  private __persistDebounce: number
  private __persistTimer: ReturnType<typeof setTimeout> | null = null

  constructor(options: CacheStoreOptions = {}) {
    this.__maxEntries = options.maxEntries ?? 100
    this.__defaultTtl = options.defaultTtl ?? 300000
    this.__staleTtl = options.staleTtl === undefined ? null : options.staleTtl
    this.__persistMaxSize = options.persistenceMaxSize ?? DEFAULT_PERSISTENCE_MAX_SIZE
    this.__persistDebounce = options.persistenceDebounce ?? DEFAULT_PERSISTENCE_DEBOUNCE
    this.__persistence = this.__resolvePersistence(options)
    this.__entries = loadPersistedEntries(this.__persistence)
    if (this.__prune()) {
      this.__persist()
    }
    this.__flushOnPageHide()
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
    this.__persist()
  }

  delete(key: string): boolean {
    const deleted = this.__entries.delete(key)
    if (deleted) {
      this.__persist()
    }
    return deleted
  }

  clear(): void {
    this.__cancelPersist()
    this.__entries.clear()
    this.__persistence?.remove()
  }

  /**
   * Write any pending changes to storage immediately instead of waiting for the debounce.
   */
  flush(): void {
    if (this.__persistTimer === null) {
      return
    }

    this.__cancelPersist()
    this.__write()
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

  /** Drop hard-expired entries and enforce `maxEntries`. Returns whether anything was removed. */
  private __prune(): boolean {
    const now = Date.now()
    let changed = false

    for (const [key, entry] of this.__entries) {
      const hardExpiry = this.__hardExpiry(entry)
      if (hardExpiry !== null && now >= hardExpiry) {
        this.__entries.delete(key)
        changed = true
      }
    }

    if (this.__entries.size > this.__maxEntries) {
      this.__evictOldest(this.__entries.size - this.__maxEntries)
      changed = true
    }

    return changed
  }

  private __persist(): void {
    if (!this.__persistence) {
      return
    }

    if (this.__persistDebounce <= 0) {
      this.__write()
      return
    }

    this.__cancelPersist()
    this.__persistTimer = setTimeout(() => {
      this.__persistTimer = null
      this.__write()
    }, this.__persistDebounce)

    // Don't keep a Node.js process alive just to write the cache.
    const timer = this.__persistTimer as { unref?: () => void }
    timer.unref?.()
  }

  private __cancelPersist(): void {
    if (this.__persistTimer !== null) {
      clearTimeout(this.__persistTimer)
      this.__persistTimer = null
    }
  }

  private __write(): void {
    const persistence = this.__persistence
    if (!persistence) {
      return
    }

    for (;;) {
      try {
        persistence.write(serializeEntries(this.__entries, this.__persistMaxSize))
        return
      } catch {
        // Storage is full. Trim the in-memory entries as well, so the next write doesn't
        // hit the same limit, and retry with the most recently used half.
        if (this.__entries.size === 0) {
          try {
            persistence.remove()
          } catch {
            // Ignore storage failures in restricted environments.
          }
          return
        }

        this.__evictOldest(Math.ceil(this.__entries.size / 2))
      }
    }
  }

  private __evictOldest(count: number): void {
    for (let removed = 0; removed < count; removed += 1) {
      const oldestKey = this.__entries.keys().next().value
      if (oldestKey === undefined) {
        return
      }
      this.__entries.delete(oldestKey)
    }
  }

  /** Browsers may discard a pending debounced write when the page closes; flush first. */
  private __flushOnPageHide(): void {
    const target = globalThis as {
      addEventListener?: (type: string, listener: () => void) => void
      document?: { visibilityState?: string }
    }

    if (!this.__persistence || typeof target.addEventListener !== 'function') {
      return
    }

    target.addEventListener('pagehide', () => this.flush())
    target.addEventListener('visibilitychange', () => {
      if (target.document?.visibilityState === 'hidden') {
        this.flush()
      }
    })
  }
}
