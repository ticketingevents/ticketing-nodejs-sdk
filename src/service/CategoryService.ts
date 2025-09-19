import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { CategoryData } from '../interface/data/CategoryData'
import { Category } from '../interface/Category'
import { CategoryModel } from '../model/CategoryModel'

export class CategoryService extends BaseService<CategoryData, Category>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/categories", CategoryModel)
  }
}