import axios from 'axios'
import { constants } from './constants'

export class APIAdapter{
  private __requester;

  constructor(apiKey: string, sandbox: boolean){
    this.__requester = axios.create({
      baseURL: sandbox?
          "https//qa.ticketingevents.com/v3/":
          "https//api.ticketingevents.com/v3/",
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
  ): Promise<{[key: string]: string|number}>{
    return this.__requester.get(url, {
      headers: params,
      params: params
    })
  }
}