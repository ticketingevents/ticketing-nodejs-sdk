//Control execution order
import './presets'

import { UnsupportedCriteriaError } from '../../src'
import { Collection } from  '../../src/util'
import { expect, ticketing } from '../setup'

describe.skip("Filters", function(){

  //Set hook timeout
  this.timeout(10000)

  before(async function(){
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

  after(async function(){
    //Remove test resources
    let deletions = []
    for(let region of this.testRegions){
      deletions.push(region.delete())
    }

    await Promise.all(deletions)
  })

  describe('#filter()', function () {
    it("Should throw a UnsupportedCriteriaError if the collection does not support the specified filter", function(){
      return expect(this.collection.filter({"unsupported": true}))
        .to.eventually.be.rejectedWith("The collection does not support the following filters: unsupported.")
        .and.be.an.instanceOf(UnsupportedCriteriaError)
    })
  })
})