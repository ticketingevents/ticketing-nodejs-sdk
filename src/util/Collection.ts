export class Collection<T> extends Promise<Array<T>>{
  private __executor: Function
  private __onCurrent: Function = () => {}
  private __onPages: Function = () => {}
  private __onFilter: Function = (criteria) => {}
  private __onSort: Function = (field, order) => {}
  private __onPageChange: Function = (page) => {}

  constructor(executor){
    super(executor)
    this.__executor = executor
  }

  get current(): Promise<number>{
    return new Promise((resolve, reject) => {
      this.then(result => {
        resolve(this.__onCurrent())
      }).catch(error => {
        resolve(this.__onCurrent())
      })
    })
  }

  get pages(): Promise<number>{
    return new Promise((resolve, reject) => {
      this.then(result => {
        resolve(this.__onPages())
      }).catch(error => {
        resolve(this.__onPages())
      })
    })
  }

  filter(criteria: {[key: string]: string|number}): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.pages.then(result => {
        this.__onFilter(criteria)
        this.__executor(resolve, reject)
      })
    })
  }

  sort(field: string, ascending: boolean = true): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.pages.then(result => {
        this.__onSort(field, ascending?"asc":"desc")
        this.__executor(resolve, reject)
      })
    })
  }

  next(): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.current.then(current => {
        this.__goto(current+1)
        this.__executor(resolve, reject)
      })
    })
  }

  previous(): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.current.then(current => {
        this.__goto(current-1)
        this.__executor(resolve, reject)
      })
    })
  }

  first(): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.pages.then(pages => {
        this.__goto(1)
        this.__executor(resolve, reject)
      })
    })
  }

  last(): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.pages.then(pages => {
        this.__goto(pages)
        this.__executor(resolve, reject)
      })
    })
  }

  goto(page: number): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.pages.then(pages => {
        this.__goto(page)
        this.__executor(resolve, reject)
      })
    })
  }

  async hasNext(): Promise<boolean>{
    return await this.current < await this.pages
  }

  async hasPrevious(): Promise<boolean>{
    return await this.current > 1
  }

  onCurrent(callback: Function){
    this.__onCurrent = callback
  }

  onPages(callback: Function){
    this.__onPages = callback
  }

  onFilter(callback: Function){
    this.__onFilter = callback
  }

  onSort(callback: Function){
    this.__onSort = callback
  }

  onPageChange(callback: Function){
    this.__onPageChange = callback
  }

  private __copy(executor): Collection<T>{
    let collection = new Collection<T>(executor)
    collection.onCurrent(this.__onCurrent)
    collection.onPages(this.__onPages)
    collection.onFilter(this.__onFilter)
    collection.onSort(this.__onSort)
    collection.onPageChange(this.__onPageChange)
    return collection
  }

  private __goto(page: number){
    this.__onPageChange(page)
  }
}