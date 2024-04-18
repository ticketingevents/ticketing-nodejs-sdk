import { APIAdapter, constants } from '.'

export class Collection<T> extends Promise<Array<T>>{
  private __collectionRunner: CollectionRunner

  constructor(apiAdapter: APIAdapter, url: string){
    let collectionRunner = new CollectionRunner(apiAdapter, url)
    super((reject, resolve) => {
      return collectionRunner.run(reject, resolve)
    })

    this.__collectionRunner = collectionRunner
  }

  filter(criteria: {[key: string]: string|number}){
    for(let criterion in criteria){
      this.__collectionRunner.setCriterion(criterion, criteria[criterion])
    }

    return this
  }
  
  then(onFulfilled, onRejected){
    return super.then(onFulfilled, onRejected);
  }
}

class CollectionRunner{
  private __adapter: APIAdapter
  private __url: string
  private __criteria: {[key: string]: string|number}

  constructor(apiAdapter: APIAdapter, url: string){
    this.__adapter = apiAdapter
    this.__url = url
    this.__criteria = {}
  }

  public setCriterion(name, value){
    this.__criteria[name] = value
  }

  public run(success, error){
    let request = null

    if("id" in this.__criteria){
      request = this.__adapter.get(`${this.__url}/${this.__criteria['id']}`)
    }else{
      request = this.__adapter.get(this.__url, this.__criteria)
    }

    request.then(response => {
      let entries = []
      for(let entry of response.data.entries){
        entries.push(constants.models[this.__url](entry))
      }

      success(entries)
    }).catch(error => {
      error(error.response)
    })
  }
}