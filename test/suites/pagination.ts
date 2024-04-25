//Control execution order
import './filters'

import { TickeTing, Region, PageAccessError } from '../../src'
import { Collection } from  '../../src/util'
import { expect } from '../setup'

suite("Pagination", function(){
  //Set hook timeout
  this.timeout(20000)

  suiteSetup(async function(){
    //Setup SDK for testing
    let ticketing: TickeTing = new TickeTing({
      apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
      sandbox: true
    })

    //Initialise test data for suite
    let regionData = {
      name: "Test Region ",
      country: "Antigua and Barbuda"
    }

    this.testRegions = []
    for(let i=1; i <= 5; i++){
      this.testRegions.push(
        await ticketing.regions.create({
          name: regionData.name+Math.floor(Math.random() * 999999),
          country: regionData.country
        }
      ))
    }

    // Initialise collection handle for testing
    this.collection = ticketing.regions.list(1)
  })

  suiteTeardown(function(){
    //Remove test resources
    for(let region of this.testRegions){
      region.delete()
    }
  })

  setup(async function(){
    //Set test timeouts
    this.timeout(5000)
  })

  suite('#first()', function () {
    test("Should return the first page of resources", function(){
      return expect(this.collection.first().current)
        .to.eventually.equal(1)
    })
  })

  suite('#last()', function () {
    test("Should return the last page of resources", async function(){
      return expect(this.collection.last().current)
        .to.eventually.equal(await this.collection.pages)
    })
  })

  suite('#next()', function () {
    test("Should navigate to the next page of resources", function(){
      return expect(this.collection.first().next().current)
        .to.eventually.equal(2)
    })

    test("Should throw a PageAccessError if no subsequent page exists", function(){
      return expect(this.collection.last().next())
        .to.eventually.be.rejectedWith("The specified page does not exist for the given records per page")
        .and.be.an.instanceof(PageAccessError)
    })
  })

  suite('#previous()', function () {
    test("Should navigate to the previous page of resources", async function(){
      return expect(this.collection.last().previous().current)
        .to.eventually.equal(await this.collection.last().previous().pages - 1)
    })

    test("Should throw a PageAccessError if no previous page exists", function(){
      return expect(this.collection.first().previous())
        .to.eventually.be.rejectedWith("Please specify a positive integer page number")
        .and.be.an.instanceof(PageAccessError)
    })
  })

  suite('#goto()', function () {
    test("Should navigate to the specified page of resources", function(){
      return expect(this.collection.goto(3).current)
        .to.eventually.equal(3)
    })

    test("Should throw a PageAccessError if the specified page does not exist", async function(){
      return expect(this.collection.last().next())
        .to.eventually.be.rejectedWith("The specified page does not exist for the given records per page")
        .and.be.an.instanceof(PageAccessError)
    })
  })

  suite('#hasNext()', function () {
    test("Should return true if a subsequent page of resources exists", function(){
      return expect(this.collection.first().hasNext())
        .to.eventually.be.true
    })

    test("Should return false if no subsequent page of resources exists", function(){
      return expect(this.collection.last().hasNext())
        .to.eventually.be.false
    })
  })

  suite('#hasPrevious()', function () {
    test("Should return true if a previous page of resources exists", function(){
      return expect(this.collection.last().hasPrevious())
        .to.eventually.be.true
    })

    test("Should return false if no previous page of resources exists", function(){
      return expect(this.collection.first().hasPrevious())
        .to.eventually.be.false
    })
  })
})