import { BaseService } from './BaseService'

import { APIAdapter } from '../util'
import { CategoryData, Category } from '../interface'
import { CategoryModel } from '../model'

export class CategoryService extends BaseService<CategoryData, Category>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/categories", CategoryModel)
  }
}