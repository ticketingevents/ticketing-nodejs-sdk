//Control execution order
import './accounts'

import { Category, BadDataError,  ResourceExistsError, ResourceNotFoundError, ResourceIndelibleError } from '../../src'
import { CategoryModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing } from '../setup'

// Global category object
let testCategory = null

describe.skip("Categories", function(){

  //Set hook timeout
  this.timeout(10000)

  before(async function(){
    //Initialise test data for suite
    this.testCategoryData = {
      name: "Test Category "+Math.floor(Math.random() * 999999),
      subcategories: ["Subcategory 1", "Subcategory 2","Subcategory 3"]
    }

    //A category to test duplication
    this.secondCategory = await ticketing.categories.create({
      "name": "Test Category "+Math.floor(Math.random() * 999999),
      subcategories: ["Event Subcategory"]
    })

    //Create an event host
    this.host = await ticketing.hosts.create({
      name: "Host "+Math.floor(Math.random() * 999999),
      contact: "Jane Doe",
      email: "jane@eventhost.com"
    })

    //Create an event venue
    this.region = await ticketing.regions.create({
      "name": "Region "+Math.floor(Math.random() * 999999),
      "country": "Antigua and Barbuda"
    })

    this.venue = await ticketing.venues.create({
      name: "Venue "+Math.floor(Math.random() * 999999),
      region: this.region,
      longitude: -70.99214,
      latitude: 43.75518,
      address: "Miami Beach, Miami, Florida"
    })

    //Create an event to test category cannot be deleted
    this.testEvent = await ticketing.events.create({
      host: this.host,
      title: "Second Event",
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.secondCategory,
      subcategory: "Event Subcategory",
      venue: this.venue
    })
  })

  after(async function(){
    await this.testEvent.delete()
    await this.host.delete()
    await this.venue.delete()
    await this.region.delete()
    await this.secondCategory.delete()
  })

  describe('Add new category', function () {
    it('Should return a valid category object', function () {
      return new Promise((resolve, reject) => {
        ticketing.categories.create(this.testCategoryData).then((category => {
          testCategory = category

          expect(category)
            .to.be.an.instanceof(CategoryModel)
            .and.to.deep.include(this.testCategoryData)

          resolve(true)
        })).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      return expect(ticketing.categories.create({name: "", subcategories: this.testCategoryData.subcategories}))
        .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: name.")
        .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError when using an existing name', function () {
      return expect(ticketing.categories.create(this.testCategoryData))
        .to.eventually.be.rejectedWith("The following arguments conflict with those of another category: name.")
        .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('List all categories', function () {
    it('Should return a collection of Category resources', function () {
      return expect(ticketing.categories.list()).eventually.to.all.be.instanceof(CategoryModel)
    })

    it('Should contain the newly created category as its last resource', function () {
      return new Promise((resolve, reject) => {
        ticketing.categories.list(1).last().then(categories => {
          expect(categories[0])
            .to.be.an.instanceof(CategoryModel)
            .and.to.deep.include(this.testCategoryData)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Fetch a category', function () {
    it('Should return the identified Category resource', function () {
      return expect(ticketing.categories.find(testCategory.id))
        .to.eventually.be.an.instanceof(CategoryModel)
        .and.to.deep.include(this.testCategoryData)
    })

    it('Should throw a ResourceNotFoundError when using a non-existant ID', function () {
      return expect(ticketing.categories.find(12345))
        .to.eventually.be.rejectedWith("There is presently no resource with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })

  describe('Update a category', function () {
    it('Should save the changes made to the category', function () {
      //Make changes to the category
      testCategory.name = "New Category"
      testCategory.subcategories = ["Subcategory 1", "Subcategory 3"]

      //Save changes
      return expect(testCategory.save()).eventually.be.true
    })

    it('Should persist category changes', function () {
      return expect(ticketing.categories.find(testCategory.id))
        .to.eventually.deep.include({
          "name": "New Category",
          "subcategories": ["Subcategory 1", "Subcategory 3"]
        })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      //Make invalid changes to the category
      testCategory.name = ""

      return expect(testCategory.save())
        .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: name.")
        .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError when using an existing name', function () {
      //Attempt to change the name of the existing category to that of the second one
      testCategory.name = this.secondCategory.name

      return expect(testCategory.save())
        .to.eventually.be.rejectedWith("The following arguments conflict with those of another category: name.")
        .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('Delete a category', function () {
    it('Should delete the category from the system', function () {
      return expect(testCategory.delete()).to.eventually.be.true
    })

    it('Category should no longer be retrievable', function () {
      return expect(ticketing.categories.find(testCategory.id))
        .to.eventually.be.rejectedWith("There is presently no resource with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })

    it('Should throw a ResourceIndelibleError when attached to an event', function () {
      return expect(this.secondCategory.delete())
        .to.eventually.be.rejectedWith("You cannot delete in-use event categories.")
        .and.be.an.instanceOf(ResourceIndelibleError)
    })
  })
})