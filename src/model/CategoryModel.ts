import { APIAdapter } from '../util'
import { BaseModel } from './BaseModel'
import { Category } from '../interface/Category'
import { CategoryData } from '../interface/data/CategoryData'

export class CategoryModel extends BaseModel implements Category{
  public name: string
  public subcategories: Array<string>

  constructor(category: any, adapter: APIAdapter){
    super(category.self, adapter)

    this.name = category.name
    this.subcategories = category.subcategories
  }

  serialise(): CategoryData{
    return {
      name: this.name,
      subcategories: this.subcategories
    }
  }
}