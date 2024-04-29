import { TickeTing, Region, BadDataError, PageAccessError,  ResourceExistsError, ResourceNotFoundError } from '../../src'
import { RegionModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect } from '../setup'

// Global region object
let testRegion = null

describe("Regions", function(){
  //Set timeout for tests in suite
  this.timeout(10000)

  before(async function(){
    //Setup SDK for testing
    this.ticketing = new TickeTing({
      apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
      sandbox: true
    })

    //Initialise test data for suite
    this.testRegionData = {
      name: "Test Region "+Math.floor(Math.random() * 999999),
      country: "Antigua and Barbuda",
      district: "Saint Paul",
      city: "English Harbour"
    }

    //A region to test duplication
    this.secondRegion = await this.ticketing.regions.create({
      "name": "Test Region "+Math.floor(Math.random() * 999999),
      "country": "New Country"
    })
  })

  after(function(){
    this.secondRegion.delete()
  })

  describe('Add new region', function () {
    it('Should return a valid region object', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.regions.create(this.testRegionData).then((region => {
          testRegion = region

          expect(region)
            .to.be.an.instanceof(RegionModel)
            .and.to.include(this.testRegionData)
            .and.to.have.property("icon", `https://restfulcountries.com/assets/images/flags/Antigua-And-Barbuda.png`)

          resolve(true)
        })).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      return expect(this.ticketing.regions.create({name: "", country: this.testRegionData.country}))
        .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: name.")
        .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError when using an existing name', function () {
      return expect(this.ticketing.regions.create(this.testRegionData))
        .to.eventually.be.rejectedWith("The following arguments conflict with those of another region: name.")
        .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('List all regions', function () {
    it('Should return a collection of Region resources', function () {
      return expect(this.ticketing.regions.list()).eventually.to.all.be.instanceof(RegionModel)
    })

    it('Should contain the newly created region as its last resource', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.regions.list(1).last().then(regions => {
          expect(regions[0])
            .to.be.an.instanceof(RegionModel)
            .and.to.include(this.testRegionData)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Fetch a region', function () {
    it('Should return the identified Region resource', function () {
      return expect(this.ticketing.regions.find(testRegion.id))
        .to.eventually.be.an.instanceof(RegionModel)
        .and.to.include(this.testRegionData)
    })

    it('Should throw a ResourceNotFoundError when using a non-existant ID', function () {
      return expect(this.ticketing.regions.find(12345))
        .to.eventually.be.rejectedWith("There is presently no resource with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })

  describe('Update a region', function () {
    it('Should save the changes made to the region', function () {
      //Make changes to the region
      testRegion.name = "New Name"
      testRegion.district = "New District"

      //Save changes
      return expect(testRegion.save()).eventually.be.true
    })

    it('Should persist region changes', function () {
      return expect(this.ticketing.regions.find(testRegion.id))
        .to.eventually.include({
          "name": "New Name",
          "district": "New District"
        })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      //Make invalid changes to the region
      testRegion.name = ""

      return expect(testRegion.save())
        .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: name.")
        .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError when using an existing name', function () {
      //Attempt to change the name of the existing region to that of the second one
      testRegion.name = this.secondRegion.name

      return expect(testRegion.save())
        .to.eventually.be.rejectedWith("The following arguments conflict with those of another region: name.")
        .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('Delete a region', function () {
    it('Should delete the region from the system', function () {
      return expect(testRegion.delete()).to.eventually.be.true
    })

    it('Region should no longer be retrievable', function () {
      return expect(this.ticketing.regions.find(testRegion.id))
        .to.eventually.be.rejectedWith("There is presently no resource with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })
})