import { Collection } from './Collection'

export class PaginatedCollection<T> extends Collection<T>{
  public current = 0
  public pages = 0

  first(){
    return this
  }

  last(){
    return this
  }

  hasNext(){
    return true
  }

  next(){
    return this
  }

  hasPrevious(){
    return true
  }

  previous(){
    return this
  }

  goto(page: number){
    return this
  }
}