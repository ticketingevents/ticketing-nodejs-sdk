import { TickeTing, Region, PageAccessError } from '../../src'
import { PaginatedCollection } from  '../../src/util'

//Setup SDK for testing
let ticketing: TickeTing = new TickeTing({
  apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
  sandbox: true
})

//Setup chai for assertions
let chai = require("chai")
let chaiAsPromised = require("chai-as-promised")

chai.use(chaiAsPromised)
let assert = chai.assert

suite("Pagination", function(){
  let regionData: {[key: string]: string} = {}
  let testRegions: Array<Region> = []
  let paginatedCollection: PaginatedCollection<Region>|null = null

  setup(async function(){
    regionData = {
      name: "Pagination Region ",
      country: "Antigua and Barbuda"
    }

    testRegions = []

    //Create multiple resources to test pagination
    for(let i=1; i <= 5; i++){
      testRegions.push(
        await ticketing.regions.create({
          name: regionData.name+i,
          country: regionData.country
        }
      ))
    }

    paginatedCollection = ticketing.regions.list().paginate(1)
  })

  suite('#first()', function () {
    test("Should return the first page of resources", function(){
      paginatedCollection.first()
      assert.isEqual(paginatedCollection.current, 1, "first() does not navigate to the first page of resources")
    })
  })

  suite('#last()', function () {
    test("Should return the last page of resources", function(){
      paginatedCollection.last()
      assert.isEqual(paginatedCollection.current, paginatedCollection.pages, "last() does not navigate to the last page of resources")
    })
  })

  suite('#next()', function () {
    test("Should navigate to the next page of resources", function(){
      paginatedCollection.first().next()
      assert.isEqual(paginatedCollection.current, 2, "next() does not navigate to the subsequent page of resources")
    })

    test("Should throw a PageAccessError if no subsequent page exists", function(){
      assert.isRejected(
        paginatedCollection.last().next(),
        PageAccessError,
        "Attempting to retrieve a non-existant page does not throw a PageAccessError"
      )
    })
  })

  suite('#previous()', function () {
    test("Should navigate to the previous page of resources", function(){
      paginatedCollection.last().previous()
      assert.isEqual(paginatedCollection.current, paginatedCollection.pages-1, "previous() does not navigate to the previous page of resources")
    })

    test("Should throw a PageAccessError if no previous page exists", function(){
      assert.isRejected(
        paginatedCollection.first().previous(),
        PageAccessError,
        "Attempting to retrieve a non-existant page does not throw a PageAccessError"
      )
    })
  })

  suite('#goto()', function () {
    test("Should navigate to the specified page of resources", function(){
      paginatedCollection.goto(7)
      assert.isEqual(paginatedCollection.current, 7, "goto() does not navigate to the specified page of resources")
    })

    test("Should throw a PageAccessError if the specified page does not exist", function(){
      assert.isRejected(
        paginatedCollection.goto(paginatedCollection.pages+1),
        PageAccessError,
        "Attempting to retrieve a non-existant page does not throw a PageAccessError"
      )
    })
  })

  suite('#hasNext()', function () {
    test("Should return true if a subsequent page of resources exists", function(){
      assert.isTrue(paginatedCollection.first().hasNext())
    })

    test("Should return false if no subsequent page of resources exists", function(){
      assert.isFalse(paginatedCollection.last().hasNext())
    })
  })

  suite('#hasPrevious()', function () {
    test("Should return true if a previous page of resources exists", function(){
      assert.isTrue(paginatedCollection.last().hasPrevious())
    })

    test("Should return false if no previous page of resources exists", function(){
      assert.isFalse(paginatedCollection.first().hasPrevious())
    })
  })

  teardown(function(){
    for(let region of testRegions){
      region.delete()
    }
  })
})