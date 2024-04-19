export class Collection<T> extends Promise<Array<T>>{
  private __onFilter: Function = (criteria) => {}
  private __onPaginate: Function = () => {}

  filter(criteria: {[key: string]: string|number}){
    this.__onFilter(criteria)
    return this
  }

  onFilter(callback: Function){
    this.__onFilter = callback
  }

  paginate(pageLength: number){
    return this.__onPaginate()
  }

  onPaginate(callback: Function){
    this.__onPaginate = callback
  }
}