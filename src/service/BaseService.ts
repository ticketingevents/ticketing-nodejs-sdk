import { APIAdapter, Collection } from '../util'
import { 
  BadDataError, ResourceExistsError, ResourceNotFoundError, 
  PageAccessError, UnsupportedCriteriaError, UnsupportedSortError
} from '../errors'

export class BaseService<RequestType, ResponseType>{
  private __adapter: APIAdapter
  private __baseUrl: string
  private __modelClass: any

  private __listCollection: Collection<ResponseType>
  private __listFilters: Array<string>
  private __listSortFields: Array<string>
  private __listCriteria: {[key: string]: string|number}
  private __listResult: {entries: Array<ResponseType>, page: number, records: number, total: number}

  constructor(
    apiAdapter: APIAdapter,
    baseUrl: string,
    modelClass: any,
    supportedFilters: Array<string> = [],
    supportedSortFields: Array<string> = []
  ){
    this.__adapter = apiAdapter
    this.__baseUrl = baseUrl
    this.__modelClass = modelClass

    this.__listCollection = new Collection<ResponseType>(
      (resolve, reject) => {}
    )

    this.__listFilters = ['page','records','sort','order'].concat(supportedFilters)
    this.__listSortFields = supportedSortFields
    this.__listCriteria = {}
    this.__listResult = {entries: [], page: 0, records: 0, total: 0}
  }

  public create(data: RequestType): Promise<ResponseType>{
    return new Promise<ResponseType>((resolve, reject) => {
      this.__adapter.post(this.__baseUrl, data).then(response => {
        //Increment resource list total
        this.__listResult.total += 1

        resolve(new this.__modelClass(response.data, this.__adapter))
      }).catch(error => {
        if(error.code == 400){
          error = new BadDataError(error.code, error.message)
        }else if(error.code == 409){
          error = new ResourceExistsError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  public list(pageLength: number = 25): Collection<ResponseType>{
    this.__listCriteria.records = pageLength  
    this.__listCollection = new Collection<ResponseType>(this.__listQuery.bind(this))

    this.__listCollection.onCurrent(() => {
      return this.__listResult.page
    })

    this.__listCollection.onPages(() => {
      return Math.ceil(this.__listResult.total / this.__listResult.records)
    })

    this.__listCollection.onFilter((criteria: {[key: string]: string}) => {
      for(let criterion in criteria){
        if(!(criterion in this.__listCriteria)){
          this.__listCriteria[criterion] = criteria[criterion]
        }
      }
    })

    this.__listCollection.onSort((field: string, order: string) => {
      this.__listCriteria.sort = field
      this.__listCriteria.order = order
    })

    this.__listCollection.onPageChange((page: number) => {
      if(!("page" in this.__listCriteria)){
        this.__listCriteria.page = page
      }
    })

    return this.__listCollection
  }

  public find(id: number|string): Promise<ResponseType>{
    return new Promise((resolve, reject) => {
      this.__adapter.get(
        `${this.__baseUrl}/${id}`
      ).then(response => {
        resolve(new this.__modelClass(response.data, this.__adapter))
      }).catch(error => {
        if(error.code == 404){
          error = new ResourceNotFoundError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  protected _instantiateModel(data: any){
    return new this.__modelClass(data, this.__adapter)
  }

  private __listQuery(resolve, reject){
    //Validate list criteria before sending query
    let criteriaError = null

    if(Number(this.__listCriteria.page) < 1){
      criteriaError = new PageAccessError(404, "Please specify a positive integer page number")
    }

    let unsupportedFilters = []
    for(let field in this.__listCriteria){
      if(this.__listFilters.indexOf(field) < 0){
        unsupportedFilters.push(field)
      }
    }

    if(unsupportedFilters.length > 0){
      criteriaError = new UnsupportedCriteriaError(400, `The collection does not support the following filters: ${unsupportedFilters.join(", ")}.`)
    }

    if(this.__listCriteria.sort && this.__listSortFields.indexOf(this.__listCriteria.sort as string) < 0){
      reject(new UnsupportedSortError(
        400,
        `The collection cannot be sorted by ${this.__listCriteria.sort}.`
      ))
    }

   if(criteriaError){
      //Reset list criteria
      this.__listCriteria = {records: this.__listCriteria.records}

      reject(criteriaError)
    }

    this.__adapter.get(
      this.__baseUrl,
      this.__listCriteria
    ).then(response => {
      //Clear List Criteria
      this.__listCriteria = {records: this.__listCriteria.records}

      this.__listResult.page = Number(response.data.page)
      this.__listResult.records = Number(response.data.records)
      this.__listResult.total = Number(response.data.total)

      let entries: Array<ResponseType> = []
      for(let entry of response.data.entries){
        entries.push(this._instantiateModel(entry))
      }

      this.__listResult.entries = entries
      resolve(entries)
    }).catch(error => {
      //Clear List Criteria
      this.__listCriteria = {records: this.__listCriteria.records}

      if(error.code == 404){
        error = new PageAccessError(error.code, error.message)
      }

      reject(error)
    })
  }
}