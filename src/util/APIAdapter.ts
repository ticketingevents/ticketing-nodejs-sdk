import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { environment } from '../environment/environment'
import { constants } from './constants'
import { TickeTingError, UnauthorisedError } from '../errors'
import {
  attachRequestCache,
  normalizeCacheOptions,
  RequestCacheController,
  RequestCacheOptions
} from './RequestCache'

export type RequestCacheMode = NonNullable<AxiosRequestConfig['cache']>

export class APIAdapter{
  private __originalKey;
  private __currentKey;
  private __requester;
  private __baseURL;
  private __mediaURL;
  private __cache: RequestCacheController | null = null;
  private __cacheMode?: RequestCacheMode;

  constructor(apiKey: string, cache: RequestCacheOptions | boolean = false){
    this.__originalKey = apiKey
    this.__baseURL = environment.baseURL
    this.__mediaURL = environment.mediaURL

    this.__requester = axios.create({
      baseURL: this.__baseURL,
      headers:{
        "X-Client-Version": constants.CLIENT_VERSION
      },
      timeout: 69000
    })

    this.__cache = attachRequestCache(
      this.__requester,
      normalizeCacheOptions(cache),
      () => this.__currentKey
    )

    this.key = apiKey
  }

  /**
   * Force caching for subsequent requests from this adapter instance.
   * Overrides the global cache setting. Prefer chaining: `adapter.cache().get(...)`.
   */
  cache(options: true | { ttl?: number; key?: string; revalidateTimeout?: number } = true): APIAdapter {
    return this.__withCacheMode(options === true ? true : options)
  }

  /**
   * Bypass caching for subsequent requests from this adapter instance.
   * Overrides the global cache setting. Prefer chaining: `adapter.nocache().get(...)`.
   */
  nocache(): APIAdapter {
    return this.__withCacheMode(false)
  }

  get key(): string{
    return this.__currentKey
  }

  set key(newKey: string){
    this.__currentKey = newKey;
    this.__requester.defaults.headers.common['X-API-Key'] = this.__currentKey;
  }

  get base(): string{
    return this.__baseURL
  }

  get media(): string{
    return this.__mediaURL
  }

  reset(){
    this.key = this.__originalKey
    this.__cache?.clear()
  }

  get cacheControls(): RequestCacheController | null {
    return this.__cache
  }

  get(
    url: string,
    params: {[key: string]: string|number} = {},
    headers: {[key: string]: string} = {},
    cache?: AxiosRequestConfig['cache']
  ): Promise<AxiosResponse>{
    return this.__request("get", url, params, headers, {}, cache)
  }

  post(
    url: string,
    data: {[key: string]: any} = {},
    headers: {[key: string]: string} = {}
  ): Promise<AxiosResponse>{
    return this.__request("post", url, {}, headers, data)
  }

  put(
    url: string,
    data: {[key: string]: any} = {},
    headers: {[key: string]: string} = {}
  ): Promise<AxiosResponse>{
    return this.__request("put", url, {}, headers, data)
  }

  patch(
    url: string,
    data: {[key: string]: any} = {},
    headers: {[key: string]: string} = {}
  ): Promise<AxiosResponse>{
    return this.__request("patch", url, {}, headers, data)
  }

  delete(
    url: string,
    params: {[key: string]: string|number} = {},
    headers: {[key: string]: string} = {}
  ): Promise<AxiosResponse>{
    return this.__request("delete", url, params, headers)
  }

  private __withCacheMode(mode: RequestCacheMode): APIAdapter {
    const scoped = Object.create(APIAdapter.prototype) as APIAdapter
    scoped.__originalKey = this.__originalKey
    scoped.__currentKey = this.__currentKey
    scoped.__requester = this.__requester
    scoped.__baseURL = this.__baseURL
    scoped.__mediaURL = this.__mediaURL
    scoped.__cache = this.__cache
    scoped.__cacheMode = mode
    return scoped
  }

  private __request(
    method: string,
    url: string,
    params: {[key: string]: string|number} = {},
    headers: {[key: string]: string} = {},
    data: {[key: string]: any} = {},
    cache?: AxiosRequestConfig['cache']
  ): Promise<AxiosResponse>{
    const cacheMode = cache !== undefined ? cache : this.__cacheMode

    return new Promise((resolve, reject) => {
      this.__requester.request({
        method: method,
        url: url,
        headers: headers,
        params: params,
        data: data,
        cache: cacheMode
      }).then(response => {
        resolve(response)
      }).catch(error => {
        if(error.response.status == 401){
          reject(new UnauthorisedError(error.response.status, error.response.data.error))
        }else{
          reject(new TickeTingError(error.response.status, error.response.data.error))
        }
      })
    })
  }
}
