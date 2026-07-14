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
  persistence?: boolean | CachePersistenceAdapter
  persistenceNamespace?: string
  persistenceStorage?: 'local' | 'session'
}

export class CacheStore {
  private __entries = new Map<string, CacheEntry>()
  private __maxEntries: number
  private __defaultTtl: number
  private __persistence: CachePersistenceAdapter | null

  constructor(options: CacheStoreOptions = {}) {
    this.__maxEntries = options.maxEntries ?? 100
    this.__defaultTtl = options.defaultTtl ?? 300000
    this.__persistence = this.__resolvePersistence(options)
    this.__entries = loadPersistedEntries(this.__persistence)
    this.__prune()
  }

  get defaultTtl(): number {
    return this.__defaultTtl
  }

  get(key: string): CacheEntry | undefined {
    const entry = this.__entries.get(key)
    if (!entry) {
      return undefined
    }

    if (entry.expiresAt !== null && Date.now() >= entry.expiresAt) {
      this.__entries.delete(key)
      this.__persist()
      return undefined
    }

    this.__entries.delete(key)
    this.__entries.set(key, entry)
    return entry
  }

  set(key: string, value: unknown, ttl?: number): void {
    const resolvedTtl = ttl ?? this.__defaultTtl
    const expiresAt = resolvedTtl <= 0 ? null : Date.now() + resolvedTtl

    if (this.__entries.has(key)) {
      this.__entries.delete(key)
    }

    this.__entries.set(key, { value, expiresAt })
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

  private __prune(): void {
    const now = Date.now()
    let changed = false

    for (const [key, entry] of this.__entries) {
      if (entry.expiresAt !== null && now >= entry.expiresAt) {
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
