import { AxiosRequestConfig, AxiosResponse } from 'axios'

type RequestParams = {[key: string]: string|number}
type RequestHeaders = {[key: string]: string}

export interface TickeTingRequestUpdate {
  method?: string
  url?: string
  params?: RequestParams
  headers?: RequestHeaders
  data?: {[key: string]: any}
  cache?: AxiosRequestConfig['cache']
  /** Headers to add or replace, keeping the existing ones. */
  setHeaders?: RequestHeaders
  /** Query params to add or replace, keeping the existing ones. */
  setParams?: RequestParams
}

/**
 * An immutable outgoing request, like Angular's `HttpRequest`. Use `clone()` to change it.
 */
export interface TickeTingRequest {
  readonly method: string
  readonly url: string
  readonly params: Readonly<RequestParams>
  readonly headers: Readonly<RequestHeaders>
  readonly data: Readonly<{[key: string]: any}>
  readonly cache?: AxiosRequestConfig['cache']
  clone(update?: TickeTingRequestUpdate): TickeTingRequest
}

/** Passes the request to the next interceptor, or sends it when there are none left. */
export type TickeTingHandler = (request: TickeTingRequest) => Promise<AxiosResponse>

/** A functional interceptor, like Angular's `HttpInterceptorFn`. */
export type TickeTingInterceptorFn = (
  request: TickeTingRequest,
  next: TickeTingHandler
) => Promise<AxiosResponse> | AxiosResponse

/** A class-based interceptor, like Angular's `HttpInterceptor`. */
export interface TickeTingInterceptorClass {
  intercept(request: TickeTingRequest, next: TickeTingHandler): Promise<AxiosResponse> | AxiosResponse
}

export type TickeTingInterceptor = TickeTingInterceptorFn | TickeTingInterceptorClass

export function createRequest(init: {
  method: string
  url: string
  params?: RequestParams
  headers?: RequestHeaders
  data?: {[key: string]: any}
  cache?: AxiosRequestConfig['cache']
}): TickeTingRequest {
  const request: TickeTingRequest = {
    method: init.method,
    url: init.url,
    params: Object.freeze({ ...init.params }),
    headers: Object.freeze({ ...init.headers }),
    data: init.data ?? {},
    cache: init.cache,
    clone(update: TickeTingRequestUpdate = {}): TickeTingRequest {
      return createRequest({
        method: update.method ?? request.method,
        url: update.url ?? request.url,
        params: { ...(update.params ?? request.params), ...update.setParams },
        headers: { ...(update.headers ?? request.headers), ...update.setHeaders },
        data: update.data ?? request.data,
        cache: 'cache' in update ? update.cache : request.cache
      })
    }
  }

  return Object.freeze(request)
}

/**
 * Run `request` through `interceptors` in order (the first one is outermost), ending with `send`.
 */
export function runInterceptors(
  interceptors: ReadonlyArray<TickeTingInterceptor>,
  request: TickeTingRequest,
  send: TickeTingHandler
): Promise<AxiosResponse> {
  // Snapshot so adding or removing interceptors mid-request doesn't change this chain.
  const chain = interceptors.slice()

  const handler = (index: number): TickeTingHandler => (current) => {
    if (index >= chain.length) {
      return send(current)
    }

    const interceptor = chain[index]
    return new Promise<AxiosResponse>((resolve) => {
      resolve(typeof interceptor === 'function'
        ? interceptor(current, handler(index + 1))
        : interceptor.intercept(current, handler(index + 1)))
    })
  }

  return handler(0)(request)
}
