//Control execution order
/*import './regions'

import { TickeTing, Region, PageAccessError } from '../../src'
import { Collection } from  '../../src/util'
import { assert } from '../setup'

//Setup SDK for testing
let ticketing: TickeTing = new TickeTing({
  apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
  sandbox: true
})

suite("Pagination", function(){
  let regionData: {[key: string]: string} = {}
  let testRegions: Array<Region> = []
  let collection: Collection<Region>|null = null

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

    collection = ticketing.regions.list(1)
  })

  suite('#first()', function () {
    test("Should return the first page of resources", function(){
      assert.eventually.isEqual(collection.first().current, 1, "first() does not navigate to the first page of resources")
    })
  })

  suite('#last()', function () {
    test("Should return the last page of resources", async function(){
      assert.eventually.isEqual(collection.last().current, await collection.pages, "last() does not navigate to the last page of resources")
    })
  })

  suite('#next()', function () {
    test("Should navigate to the next page of resources", function(){
      collection.first().next()
      assert.eventually.isEqual(collection.current, 2, "next() does not navigate to the subsequent page of resources")
    })

    test("Should throw a PageAccessError if no subsequent page exists", function(){
      assert.isRejected(
        collection.last().next(),
        PageAccessError,
        "Attempting to retrieve a non-existant page does not throw a PageAccessError"
      )
    })
  })

  suite('#previous()', function () {
    test("Should navigate to the previous page of resources", function(){
      collection.last().previous()
      assert.eventually.isEqual(collection.current, await collection.pages - 1, "previous() does not navigate to the previous page of resources")
    })

    test("Should throw a PageAccessError if no previous page exists", function(){
      assert.isRejected(
        collection.first().previous(),
        PageAccessError,
        "Attempting to retrieve a non-existant page does not throw a PageAccessError"
      )
    })
  })

  suite('#goto()', function () {
    test("Should navigate to the specified page of resources", function(){
      collection.goto(7)
      assert.eventually.isEqual(collection.current, 7, "goto() does not navigate to the specified page of resources")
    })

    test("Should throw a PageAccessError if the specified page does not exist", function(){
      assert.isRejected(
        collection.last().next(),
        PageAccessError,
        "Attempting to retrieve a non-existant page does not throw a PageAccessError"
      )
    })
  })

  suite('#hasNext()', function () {
    test("Should return true if a subsequent page of resources exists", function(){
      assert.eventually,isTrue(collection.first().hasNext())
    })

    test("Should return false if no subsequent page of resources exists", function(){
      assert.eventually.isFalse(collection.last().hasNext())
    })
  })

  suite('#hasPrevious()', function () {
    test("Should return true if a previous page of resources exists", function(){
      assert.eventually.isTrue(collection.last().hasPrevious())
    })

    test("Should return false if no previous page of resources exists", function(){
      assert.eventually.isFalse(collection.first().hasPrevious())
    })
  })

  teardown(function(){
    for(let region of testRegions){
      region.delete()
    }
  })
})*/