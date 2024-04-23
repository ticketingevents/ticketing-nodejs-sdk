export class Collection<T> extends Promise<Array<T>>{
  private __current: number = 1
  private __pages: number = 0
  private __executor: Function
  private __onFilter: Function = (criteria) => {}
  private __onPageChange: Function = (page) => {}

  constructor(executor){
    super(executor)
    this.__executor = executor
  }

  get current(): Promise<number>{
    return new Promise((resolve, reject) => {
      this.then(result => {
        resolve(this.__current)
      })
    })
  }

  get pages(): Promise<number>{
    return new Promise((resolve, reject) => {
      this.then(result => {
        resolve(this.__pages)
      })
    })
  }

  set pages(pages: number){
    this.__pages = pages
  }

  filter(criteria: {[key: string]: string|number}): Collection<T>{
    this.__onFilter(criteria)

    return new Collection<T>(this.__executor)
  }

  next(): Collection<T>{
    return this.goto(this.__current+1)
  }

  previous(): Collection<T>{
    return this.goto(this.__current-1)
  }

  first(): Collection<T>{
    return this.goto(1)
  }

  async last(): Promise<Collection<T>>{
    return this.goto(await this.pages)
  }

  goto(page: number): Collection<T>{
    this.__current = page
    this.__onPageChange(page)

    return new Collection<T>(this.__executor)
  }

  async hasNext(): Promise<boolean>{
    return await this.current < await this.pages
  }

  async hasPrevious(): Promise<boolean>{
    return await this.current > 1
  }

  onFilter(callback: Function){
    this.__onFilter = callback
  }

  onPageChange(callback: Function){
    this.__onPageChange = callback
  }
}