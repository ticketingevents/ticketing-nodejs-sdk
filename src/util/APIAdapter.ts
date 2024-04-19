import axios, { AxiosResponse } from 'axios'
import { constants } from './constants'
import { TickeTingError, UnauthorisedError } from '../errors'

export class APIAdapter{
  private __requester;

  constructor(apiKey: string, sandbox: boolean){
    this.__requester = axios.create({
      baseURL: sandbox?
          "https://qa.ticketingevents.com/v3/":
          "https://api.ticketingevents.com/v3/",
      headers:{
        "X-API-Key": apiKey,
        "X-Client-Version": constants.CLIENT_VERSION
      },
      timeout: 5000
    })
  }

  get(
    url: string,
    params: {[key: string]: string|number} = {},
    headers: {[key: string]: string} = {}
  ): Promise<AxiosResponse>{
    return new Promise((resolve, reject) => {
      this.__requester.get(url, {
        headers: params,
        params: params
      }).then(response => {
        resolve(response)
      }).catch(error => {
        if(error.response.status == 401){
          reject(new UnauthorisedError(error.status, error.response.data.error))
        }else{
          reject(new TickeTingError(error.status, error.response.data.error))
        }
      })
    })
  }
}