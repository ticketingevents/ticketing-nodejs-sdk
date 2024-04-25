//Control execution order
import './regions'

import { TickeTing, UnsupportedCriteriaError } from '../../src'
import { Collection } from  '../../src/util'
import { expect } from '../setup'

suite("Filters", function(){
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

  suite('#filter()', function () {
    test("Should throw a UnsupportedCriteriaError if the collection does not support the specified filter", function(){
      return expect(this.collection.filter({"unsupported": true}))
        .to.eventually.be.rejectedWith("The collection does not support the following filters: unsupported")
        .and.be.an.instanceOf(UnsupportedCriteriaError)
    })
  })
})