export interface CacheEntry<T = unknown> {
  value: T
  /** Soft expiry: after this time the entry is stale and should be revalidated. */
  expiresAt: number | null
  /**
   * Hard expiry: after this time the entry is removed.
   * `null` keeps the entry for offline fallback until LRU eviction.
   * Older persisted entries without this field fall back to `expiresAt`.
   */
  staleExpiresAt?: number | null
}

export interface CachePersistenceAdapter {
  read(): string | null
  write(data: string): void
  remove(): void
}

export interface CachePersistenceOptions {
  namespace?: string
  storage?: 'local' | 'session' | CachePersistenceAdapter
  /**
   * Maximum size of the persisted blob, in characters. When exceeded, the least recently
   * used entries are left out of the saved copy. Defaults to 1,000,000 (~2 MB in UTF-16).
   */
  maxSize?: number
  /**
   * How long to wait after the last cache change before writing to storage, in ms.
   * A burst of responses becomes a single write. `0` writes synchronously. Defaults to 1000.
   */
  debounce?: number
}

interface PersistedCacheState {
  version: 1
  entries: Array<[string, CacheEntry]>
}

const DEFAULT_NAMESPACE = '@ticketing/sdk-request-cache'
const PERSISTENCE_VERSION = 1
export const DEFAULT_PERSISTENCE_MAX_SIZE = 1000000
export const DEFAULT_PERSISTENCE_DEBOUNCE = 1000

export class MemoryCachePersistence implements CachePersistenceAdapter {
  private __data: string | null = null

  read(): string | null {
    return this.__data
  }

  write(data: string): void {
    this.__data = data
  }

  remove(): void {
    this.__data = null
  }
}

class WebStoragePersistence implements CachePersistenceAdapter {
  private __storage: Storage
  private __namespace: string

  constructor(storage: Storage, namespace: string) {
    this.__storage = storage
    this.__namespace = namespace
  }

  read(): string | null {
    try {
      return this.__storage.getItem(this.__namespace)
    } catch {
      return null
    }
  }

  write(data: string): void {
    // Let quota errors propagate so the cache store can trim its entries and retry.
    this.__storage.setItem(this.__namespace, data)
  }

  remove(): void {
    try {
      this.__storage.removeItem(this.__namespace)
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }
}

export function createDefaultPersistence(
  options: CachePersistenceOptions = {}
): CachePersistenceAdapter | null {
  const namespace = options.namespace ?? DEFAULT_NAMESPACE

  if (options.storage && typeof options.storage !== 'string') {
    return options.storage
  }

  if (options.storage === 'session' && typeof globalThis.sessionStorage !== 'undefined') {
    return new WebStoragePersistence(globalThis.sessionStorage, namespace)
  }

  if ((!options.storage || options.storage === 'local') && typeof globalThis.localStorage !== 'undefined') {
    return new WebStoragePersistence(globalThis.localStorage, namespace)
  }

  return null
}

export function loadPersistedEntries(
  persistence: CachePersistenceAdapter | null | undefined
): Map<string, CacheEntry> {
  const entries = new Map<string, CacheEntry>()

  if (!persistence) {
    return entries
  }

  const raw = persistence.read()
  if (!raw) {
    return entries
  }

  try {
    const parsed = JSON.parse(raw) as PersistedCacheState
    if (parsed.version !== PERSISTENCE_VERSION || !Array.isArray(parsed.entries)) {
      return entries
    }

    for (const [key, entry] of parsed.entries) {
      entries.set(key, entry)
    }
  } catch {
    persistence.remove()
  }

  return entries
}

/**
 * Serialize entries (oldest first) into the persisted format, keeping the most recently
 * used entries that fit within `maxSize` characters.
 */
export function serializeEntries(
  entries: Map<string, CacheEntry>,
  maxSize: number = DEFAULT_PERSISTENCE_MAX_SIZE
): string {
  const prefix = `{"version":${PERSISTENCE_VERSION},"entries":[`
  const suffix = ']}'
  const parts: string[] = []
  let size = prefix.length + suffix.length
  const ordered = Array.from(entries.entries())

  for (let index = ordered.length - 1; index >= 0; index -= 1) {
    const part = JSON.stringify(ordered[index])
    const nextSize = size + part.length + (parts.length > 0 ? 1 : 0)
    if (nextSize > maxSize) {
      break
    }
    parts.push(part)
    size = nextSize
  }

  return `${prefix}${parts.reverse().join(',')}${suffix}`
}
