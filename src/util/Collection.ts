import { Collection as CollectionInterface } from '../interface'

export class Collection<T> extends Promise<Array<T>> implements CollectionInterface{
  private __executor: (resolve, reject) => void
  private __onPages: () => number = () => {return 0}
  private __onFilter: (criteria: {[key: string]: string | number}) => void = () => {}
  private __onSort: (field: string, ascending: string) => void = () => {}
  private __onCurrent: () => number = () => {return 0}
  private __onPageChange: (page: number) => void = () => {}
  private __onReset: () => void = () => {}

  private __root: boolean
  private __cursor: number
  private __deferredPromise: Promise<Array<T>> | null

  constructor(executor, root=true, cursor=1){
    super(() => {})
    this.__executor = executor
    this.__root = root
    this.__cursor = cursor
    this.__deferredPromise = null
  }

  then<TResult1 = T[], TResult2 = never>(
    onfulfilled?: (value: T[]) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
  ): Promise<TResult1 | TResult2>{
    if(!this.__deferredPromise){
      this.__deferredPromise = new Promise<Array<T>>(this.__executor)
    }

    return this.__deferredPromise.then(onfulfilled, onrejected)
  }

  get current(): Promise<number>{
    return new Promise((resolve) => {
      resolve(this.__cursor)
    })
  }

  get pages(): Promise<number>{
    return new Promise((resolve) => {
      this.then(() => {
        resolve(this.__onPages())
      })
    })
  }

  filter(criteria: {[key: string]: string|number}): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.__onFilter(criteria)
      this.__executor(resolve, reject)
    }, this.__cursor)
  }

  sort(field: string, ascending: boolean = true): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.__onSort(field, ascending?"asc":"desc")
      this.__executor(resolve, reject)
    }, this.__cursor)
  }

  next(): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.current.then(current => {
        this.__goto(current+1)
        this.__executor(resolve, reject)
      })
    }, this.__cursor+1)
  }

  previous(): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.current.then(current => {
        this.__goto(current-1)
        this.__executor(resolve, reject)
      })
    }, this.__cursor-1)
  }

  first(): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.__goto(1)
      this.__executor(resolve, reject)
    }, 1)
  }

  goto(page: number): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.__goto(page)
      this.__executor(resolve, reject)
    }, page)
  }

  async hasNext(): Promise<boolean>{
    return await this.current < await this.pages
  }

  async hasPrevious(): Promise<boolean>{
    return await this.current > 1
  }

  onCurrent(callback: () => number){
    this.__onCurrent = callback
  }

  onPages(callback: () => number){
    this.__onPages = callback
  }

  onFilter(callback: (criteria: {[key: string]: string}) => void){
    this.__onFilter = callback
  }

  onSort(callback: (field: string, ascending: string) => void){
    this.__onSort = callback
  }

  onPageChange(callback: (page: number) => void){
    this.__onPageChange = callback
  }

  onReset(callback: () => void){
    this.__onReset = callback
  }

  private __copy(executor, cursor=1): Collection<T>{
    if(this.__root){
      this.__onReset()
    }

    const collection = new Collection<T>(executor, false, cursor)
    collection.onCurrent(this.__onCurrent)
    collection.onPages(this.__onPages)
    collection.onFilter(this.__onFilter)
    collection.onSort(this.__onSort)
    collection.onPageChange(this.__onPageChange)
    collection.onReset(this.__onReset)
    return collection
  }

  private __goto(page: number){
    this.__onPageChange(page)
  }
}