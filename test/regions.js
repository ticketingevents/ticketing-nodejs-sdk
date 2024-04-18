suite("Regions", function(){
  setup(function(){
    regionData = {
      name: "Antigua and Barbuda",
      country: "Antigua and Barbuda",
      district: "Saint Paul",
      city: "English Harbour"
    }

    regionId = 0
  })

  suite('Add new region', function () {
    test('Should return a valid region object', async function () {
      let region = await ticketing.regions.create(regionData)

      //Test resource implements the correct interface
      assert.typeOf(region, "Region", "Returned object does not implement the 'Region' interface.")

      //Test data fields are valid
      assert.propertyVal(region, "name", regionData.name, "Region is not created with the correct name.")
      assert.propertyVal(region, "country", regionData.country, "Region is not created with the correct country.")
      assert.propertyVal(region, "district", regionData.district, "Region is not created with the correct distict.")
      assert.propertyVal(region, "city", regionData.city, "Region is not created with the correct city.")

      //Assign id of the newly created region to global variable for additional tests
      regionId = region.id
    })

    test('Should throw a BadDataError if required fields are missing', function () {
      assert.isRejected(
        ticketing.regions.create({name: "", country: regionData.country}),
        BadDataError,
        "Omitting required Region fields does not throw the correct error"
      );
    })

    test('Should throw a ResourceExistsError when using an existing name', function () {
      assert.isRejected(
        ticketing.regions.create(regionData),
        ResourceExistsError,
        "Using an existing region name does not throw the correct error"
      );
    })
  })

  suite('List all regions', function () {
    test('Should return a collection of Region resources', async function () {
      console.log(ticketing.regions.list())
      let regions = await ticketing.regions.list()
      for(let region of regions){
        assert.typeOf(region, "Region", "One or more returned resources is not a Region")
      }
    })

    test('Should contain the newly created region as its last resource', async function () {
      let region = await ticketing.regions.list().paginate(1).last()

      //Test resource implements the correct interface
      assert.typeOf(region, "Region", "Last resource does not implement the 'Region' interface.")

      //Test data fields are valid
      assert.propertyVal(region, "name", regionData.name, "Last resource has a different name than the newly created region.")
      assert.propertyVal(region, "country", regionData.country, "Last resource has a different country than the newly created region.")
      assert.propertyVal(region, "district", regionData.district, "Last resource has a different district than the newly created region.")
      assert.propertyVal(region, "city", regionData.city, "Last resource has a different city than the newly created region.")
    })
  })

  suite('Fetch a region', function () {
    test('Should return the identified Region resource', async function () {
      let region = await ticketing.regions.list().filter({id: regionId})

      //Test resource implements the correct interface
      assert.typeOf(region, "Region", "Fetched resource does not implement the 'Region' interface.")

      //Test data fields are valid
      assert.propertyVal(region, "name", regionData.name, "Fetched resource has a different name than the newly created region.")
      assert.propertyVal(region, "country", regionData.country, "Fetched resource has a different country than the newly created region.")
      assert.propertyVal(region, "district", regionData.district, "Fetched resource has a different district than the newly created region.")
      assert.propertyVal(region, "city", regionData.city, "Fetched resource has a different city than the newly created region.")
    })

    test('Should throw a ResourceNotFoundError when using a non-existant ID', function () {
      assert.isRejected(
        ticketing.regions.list().filter({id: 12345}),
        ResourceNotFoundError,
        "Fetching a non-existant region does not throw the correct error"
      );
    })
  })

  suite('Update a region', function () {
    test('Should return true on successful update', async function () {
      let region = await ticketing.regions.list().filter({id: regionId})

      //Make changes to the region
      region.name = "New Name"
      region.district = "New District"

      //Save changes
      assert.eventually.isTrue(region.save())
    })

    test('Should save the changes made to the region', async function () {
      let region = await ticketing.regions.list().filter({id: regionId})

      //Test updated data fields were saved
      assert.propertyVal(region, "name", "New Name", "Updated region's name was not saved successfully.")
      assert.propertyVal(region, "district", "New District", "Updated region's district was not saved successfully")
    })

    test('Should throw a BadDataError if required fields are missing', async function () {
      let region = await ticketing.regions.list().filter({id: regionId})

      //Make invalid changes to the region
      region.name = ""

      assert.eventually.isRejected(
        region.save(),
        BadDataError,
        "Updating a region while omitting required Region fields does not throw the correct error"
      );
    })

    test('Should throw a ResourceExistsError when using an existing name', async function () {
      //Create a second region with a new name
      let secondRegion = await ticketing.regions.create({
        "name": "Test Region 2",
        "country": "New Country"
      })

      //Attempt to change the name of the existing region to that of the second one
      let region = await ticketing.regions.list().filter({id: regionId})
      region.name = "Test Region 2"
    
      assert.isRejected(
        region.save(),
        ResourceExistsError,
        "Updating a region with an existing name does not throw the correct error"
      )

      //Delete the second region
      secondRegion.delete()
    })
  })

  suite('Delete a region', function () {
    test('Should return true on successful deletion', async function () {
      let region = await ticketing.regions.list().filter({id: regionId})

      //Delete the region
      assert.eventually.isTrue(region.delete())
    })

    test('Should remove the region from the system', function () {
      //Confirm region no longer exists
      assert.isRejected(
        ticketing.regions.list().filter({id: regionId}),
        ResourceNotFoundError,
        "Deleted resource is still available in the system"
      )
    })
  })
})