export interface CacheEntry<T = unknown> {
  value: T
  expiresAt: number | null
}

export interface CachePersistenceAdapter {
  read(): string | null
  write(data: string): void
  remove(): void
}

export interface CachePersistenceOptions {
  namespace?: string
  storage?: 'local' | 'session' | CachePersistenceAdapter
}

interface PersistedCacheState {
  version: 1
  entries: Array<[string, CacheEntry]>
}

const DEFAULT_NAMESPACE = '@ticketing/sdk-request-cache'
const PERSISTENCE_VERSION = 1

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
    try {
      this.__storage.setItem(this.__namespace, data)
    } catch {
      this.__pruneAndRetry(data)
    }
  }

  remove(): void {
    try {
      this.__storage.removeItem(this.__namespace)
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }

  private __pruneAndRetry(data: string): void {
    try {
      const parsed = JSON.parse(data) as PersistedCacheState
      const entries = parsed.entries.slice(Math.ceil(parsed.entries.length / 2))
      this.__storage.setItem(this.__namespace, serializeCacheState(entries))
    } catch {
      this.__storage.removeItem(this.__namespace)
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

export function persistEntries(
  persistence: CachePersistenceAdapter | null | undefined,
  entries: Map<string, CacheEntry>
): void {
  if (!persistence) {
    return
  }

  const serialized = serializeCacheState(Array.from(entries.entries()))
  persistence.write(serialized)
}

function serializeCacheState(entries: Array<[string, CacheEntry]>): string {
  const state: PersistedCacheState = {
    version: PERSISTENCE_VERSION,
    entries
  }

  return JSON.stringify(state)
}
