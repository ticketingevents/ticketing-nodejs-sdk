import axios, { AxiosResponse } from 'axios'
import { constants } from './constants'
import { TickeTingError, UnauthorisedError } from '../errors'

export class APIAdapter{
  private __originalKey;
  private __currentKey;
  private __requester;

  constructor(apiKey: string, sandbox: boolean){
    this.__originalKey = apiKey
    this.__requester = axios.create({
      baseURL: sandbox?
          "https://qa.ticketingevents.com/v3/":
          "https://api.ticketingevents.com/v3/",
      headers:{
        "X-Client-Version": constants.CLIENT_VERSION
      },
      timeout: 10000
    })

    this.key = apiKey
  }

  get key(): string{
    return this.__currentKey
  }

  set key(newKey: string){
    this.__currentKey = newKey;
    this.__requester.defaults.headers.common['X-API-Key'] = this.__currentKey;
  }

  reset(){
    this.key = this.__originalKey
  }

  get(
    url: string,
    params: {[key: string]: string|number} = {},
    headers: {[key: string]: string} = {}
  ): Promise<AxiosResponse>{
    return this.__request("get", url, params, headers)
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

  delete(
    url: string,
    params: {[key: string]: string|number} = {},
    headers: {[key: string]: string} = {}
  ): Promise<AxiosResponse>{
    return this.__request("delete", url, params, headers)
  }

  private __request(
    method: string,
    url: string,
    params: {[key: string]: string|number} = {},
    headers: {[key: string]: string} = {},
    data: {[key: string]: any} = {}
  ): Promise<AxiosResponse>{
    return new Promise((resolve, reject) => {
      this.__requester.request({
        method: method,
        url: url,
        headers: headers,
        params: params,
        data: data
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