import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Category } from '../interface/Category'
import type { CategoryData } from '../interface/data/CategoryData'

export class CategoryModel extends BaseModel implements Category{
  public name: string
  private __subcategories: Array<Category>

  constructor(category: any, adapter: APIAdapter){
    super(category.self, adapter)

    this.name = category.name
    this.__subcategories = []

    if(category.subcategories){
      for(const subcategory of category.subcategories){
        this.__subcategories.push(new CategoryModel(subcategory, adapter))
      }
    }
  }

  get subcategories(): Array<Category>{
    return this.__subcategories
  }

  set subcategories(new_subcategories: Array<string>){
    const subcategories = []
    for(const subcategory of new_subcategories){
      subcategories.push(new CategoryModel({name: subcategory}, this._apiAdapter))
    }

    this.__subcategories = subcategories
  }

  serialise(): CategoryData{
    const subcategories: Array<string> = []
    for(const subcategory of this.__subcategories){
      subcategories.push(subcategory.name)
    }

    return {
      name: this.name,
      subcategories: subcategories
    }
  }
}