export interface CategoryData{
  id?: string | number,
  uri?: string,
  name: string
  subcategories: Array<string>
}