export class Collection<T> extends Promise<Array<T>>{
  private __executor: (resolve, reject) => void
  private __onCurrent: () => number = () => {return 0}
  private __onPages: () => number = () => {return 0}
  private __onFilter: (criteria: {[key: string]: string | number}) => void = () => {}
  private __onSort: (field: string, ascending: string) => void = () => {}
  private __onPageChange: (page: number) => void = () => {}

  constructor(executor){
    super(executor)
    this.__executor = executor
  }

  get current(): Promise<number>{
    return new Promise((resolve) => {
      this.then(() => {
        resolve(this.__onCurrent())
      }).catch(() => {
        resolve(this.__onCurrent())
      })
    })
  }

  get pages(): Promise<number>{
    return new Promise((resolve) => {
      this.then(() => {
        resolve(this.__onPages())
      }).catch(() => {
        resolve(this.__onPages())
      })
    })
  }

  filter(criteria: {[key: string]: string|number}): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.pages.then(() => {
        this.__onFilter(criteria)
        this.__executor(resolve, reject)
      })
    })
  }

  sort(field: string, ascending: boolean = true): Collection<T>{
    return this.__copy((resolve, reject)=>{
      this.pages.then(() => {
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
      this.pages.then(() => {
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
      this.pages.then(() => {
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

  private __copy(executor): Collection<T>{
    const collection = new Collection<T>(executor)
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