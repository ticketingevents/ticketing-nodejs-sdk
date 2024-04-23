import {
  TickeTing, Region, BadDataError, PageAccessError,  ResourceExistsError,
  ResourceNotFoundError
} from '../../src'
import { RegionModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { assert } from '../setup'

//Setup SDK for testing
let ticketing: TickeTing = new TickeTing({
  apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
  sandbox: true
})

suite("Regions", function(){
  this.timeout(10000)

  let regionData: {[key: string]: string} = {}
  let regionId = 0

  setup(function(){
    regionData = {
      name: "Test Region 1",
      country: "Antigua and Barbuda",
      district: "Saint Paul",
      city: "English Harbour"
    }
  })

  suite('Add new region', function () {
    test('Should return a valid region object', async function () {
      let region = await ticketing.regions.create(regionData)

      //Test resource implements the correct interface
      assert.instanceOf(region, RegionModel, "Returned object is not a region.")

      //Test data fields are valid
      assert.propertyVal(region, "name", regionData.name, "Region is not created with the correct name.")
      assert.propertyVal(region, "country", regionData.country, "Region is not created with the correct country.")
      assert.propertyVal(region, "district", regionData.district, "Region is not created with the correct distict.")
      assert.propertyVal(region, "city", regionData.city, "Region is not created with the correct city.")
      assert.propertyVal(region, "icon", `https://restfulcountries.com/assets/images/flags/Antigua-And-Barbuda.png`, "Region is not created with the correct icon.")

      //Assign id of the newly created region to global variable for additional tests
      regionId = Number(region.id)
    })

    test('Should throw a BadDataError if required fields are missing', async function () {
      await ticketing.regions.create({name: "", country: regionData.country}).catch(error => {
        assert.instanceOf(error, BadDataError, "Omitting required Region fields does not throw the correct error")
      })
    })

    test('Should throw a ResourceExistsError when using an existing name', async function () {
      await ticketing.regions.create(regionData).catch(error => {
        assert.instanceOf(error, ResourceExistsError, "Using an existing region name does not throw the correct error")
      })
    })
  })

  suite('List all regions', function () {
    test('Should return a collection of Region resources', async function () {
      let regions = await ticketing.regions.list()
      for(let region of regions){
        assert.instanceOf(region, RegionModel, "One or more returned resources is not a Region")
      }
    })

    test('Should contain the newly created region as its last resource', async function () {
      let region = (await ticketing.regions.list(1).last())[0]

      //Test resource implements the correct interface
      assert.instanceOf(region, RegionModel, "Last resource does not implement the 'Region' interface.")

      //Test data fields are valid
      assert.propertyVal(region, "name", regionData.name, "Last resource has a different name than the newly created region.")
      assert.propertyVal(region, "country", regionData.country, "Last resource has a different country than the newly created region.")
      assert.propertyVal(region, "district", regionData.district, "Last resource has a different district than the newly created region.")
      assert.propertyVal(region, "city", regionData.city, "Last resource has a different city than the newly created region.")
    })
  })

  suite('Fetch a region', function () {
    test('Should return the identified Region resource', async function () {
      let region = await ticketing.regions.find(regionId)

      //Test resource implements the correct interface
      assert.instanceOf(region, RegionModel, "Fetched resource does not implement the 'Region' interface.")

      //Test data fields are valid
      assert.propertyVal(region, "name", regionData.name, "Fetched resource has a different name than the newly created region.")
      assert.propertyVal(region, "country", regionData.country, "Fetched resource has a different country than the newly created region.")
      assert.propertyVal(region, "district", regionData.district, "Fetched resource has a different district than the newly created region.")
      assert.propertyVal(region, "city", regionData.city, "Fetched resource has a different city than the newly created region.")
    })

    test('Should throw a ResourceNotFoundError when using a non-existant ID', async function () {
      await ticketing.regions.find(12345).catch(error => {
        assert.instanceOf(error, ResourceNotFoundError, "Fetching a non-existant region does not throw the correct error")
      })
    })
  })

  suite('Update a region', function () {
    test('Should save the changes made to the region', async function () {
      let region = await ticketing.regions.find(regionId)

      //Make changes to the region
      region.name = "New Name"
      region.district = "New District"

      //Save changes
      let success = await region.save()
      assert.isTrue(success, "save() method does not return true")

      region = await ticketing.regions.find(regionId)

      //Test updated data fields were saved
      assert.propertyVal(region, "name", "New Name", "Updated region's name was not saved successfully.")
      assert.propertyVal(region, "district", "New District", "Updated region's district was not saved successfully")
    })

    test('Should throw a BadDataError if required fields are missing', async function () {
      let region = await ticketing.regions.find(regionId)

      //Make invalid changes to the region
      region.name = ""

      await region.save().catch(error => {
        assert.instanceOf(error, BadDataError, "Updating a region while omitting required Region fields does not throw the correct error")
      })
    })

    test('Should throw a ResourceExistsError when using an existing name', async function () {
      //Create a second region with a new name
      let secondRegion = await ticketing.regions.create({
        "name": "Test Region 2",
        "country": "New Country"
      })

      //Attempt to change the name of the existing region to that of the second one
      let region = await ticketing.regions.find(regionId)
      region.name = "Test Region 2"

      await region.save().catch(error => {
        assert.instanceOf(error, ResourceExistsError, "Updating a region with an existing name does not throw the correct error")
      })

      //Delete the second region
      secondRegion.delete()
    })
  })

  suite('Delete a region', function () {
    test('Should remove the region from the system', async function () {
      let region = await ticketing.regions.find(regionId)

      //Delete the region
      let success = await region.delete()
      assert.isTrue(success, "delete() method does not return true")

      //Confirm region no longer exists
      await ticketing.regions.find(regionId).catch(error => {
        region = null
      })

      assert.isNull(region, "Deleted resource is still available in the system")
    })
  })
})