//Control execution order
import './categories'

import { Region, BadDataError,  ResourceExistsError, ResourceNotFoundError, ResourceIndelibleError } from '../../src'
import { RegionModel } from  '../../src/model'
import { Collection, APIAdapter } from  '../../src/util'
import { expect, ticketing } from '../setup'

// Global region object
let testRegion = null

describe("Regions", function(){

  //Set hook timeout
  this.timeout(15000)

  before(async function(){  
    //TEMPORARY: Remove once functionality added to SDKlet sdk = null
    this.adapter = null
    if(process.env.npm_config_env == "production"){
      this.adapter = new APIAdapter(
        "1f573b7f728ba805604b9b1453d56105",
        false
      )
    }else{
      this.adapter = new APIAdapter(
        "07b2f3b08810a4296ee19fc59dff48b0",
        true
      )
    }

    //Initialise test data for suite
    this.testRegionData = {
      name: "Test Region "+Math.floor(Math.random() * 999999),
      country: "Antigua and Barbuda",
      district: "Saint Paul",
      city: "English Harbour"
    }

    //A region to test duplication
    this.secondRegion = await ticketing.regions.create({
      "name": "Test Region "+Math.floor(Math.random() * 999999),
      "country": "Antigua and Barbuda"
    })

    //A venue to test region cannot be deleted
    this.testVenue = await ticketing.venues.create({
      name: "Test Venue "+Math.floor(Math.random() * 999999),
      region: this.secondRegion,
      longitude: -70.99214,
      latitude: 43.75518,
      address: "Miami Beach, Miami, Florida"
    })

    //Create an event host
    this.host = await ticketing.hosts.create({
      name: "Host "+Math.floor(Math.random() * 999999),
      contact: "Jane Doe",
      email: "jane@eventhost.com"
    })

    //Create an event category
    this.category = await ticketing.categories.create({
      name: "Event Category "+Math.floor(Math.random() * 999999),
      subcategories: ["Event Subcategory"]
    })

    //An event to test active filter
    this.regionEvent = await ticketing.events.create({
      host: this.host,
      title: "Region Event",
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category,
      subcategory: "Event Subcategory",
      venue: this.testVenue
    })

    //Submit event for review
    await this.adapter.post(`${this.regionEvent.uri}/submissions`, {})

    //Approve event
    await this.adapter.delete(`/submissions/${btoa(this.regionEvent.uri)}?approved=true`)
  })

  after(async function(){
    await this.regionEvent.delete()
    await this.category.delete()
    await this.host.delete()
    await this.testVenue.delete()
    await this.secondRegion.delete()
  })

  describe('Add new region', function () {
    it('Should return a valid region object', function () {
      return new Promise((resolve, reject) => {
        ticketing.regions.create(this.testRegionData).then((region => {
          testRegion = region

          expect(region)
            .to.be.an.instanceof(RegionModel)
            .and.to.include(this.testRegionData)
            .and.to.have.property("icon", `${ticketing.mediaURL}/antigua_and_barbuda.png`)

          resolve(true)
        })).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      return expect(ticketing.regions.create({name: "", country: this.testRegionData.country}))
        .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: name.")
        .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError when using an existing name', function () {
      return expect(ticketing.regions.create(this.testRegionData))
        .to.eventually.be.rejectedWith("The following arguments conflict with those of another region: name.")
        .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('List all regions', function () {
    it('Should return a collection of Region resources', function () {
      return expect(ticketing.regions.list()).eventually.to.all.be.instanceof(RegionModel)
    })

    it('Should contain the newly created region as its last resource', function () {
      return new Promise((resolve, reject) => {
        ticketing.regions.list(1).last().then(regions => {
          expect(regions[0])
            .to.be.an.instanceof(RegionModel)
            .and.to.include(this.testRegionData)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of regions matching the active filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.regions.list(1).filter({active: true}).last().then(regions => {
          //Our test region should have been returned
          expect(regions[0])
            .to.be.an.instanceof(RegionModel)
            .and.to.include(this.secondRegion)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Fetch a region', function () {
    it('Should return the identified Region resource', function () {
      return expect(ticketing.regions.find(testRegion.id))
        .to.eventually.be.an.instanceof(RegionModel)
        .and.to.include(this.testRegionData)
    })

    it('Should throw a ResourceNotFoundError when using a non-existant ID', function () {
      return expect(ticketing.regions.find(12345))
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
      return expect(ticketing.regions.find(testRegion.id))
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
      return expect(ticketing.regions.find(testRegion.id))
        .to.eventually.be.rejectedWith("There is presently no resource with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })

    it('Should throw a ResourceIndelibleError when attached to a venue', function () {
      return expect(this.secondRegion.delete())
        .to.eventually.be.rejectedWith("A region cannot be deleted if it has venues attached")
        .and.be.an.instanceOf(ResourceIndelibleError)
    })
  })
})