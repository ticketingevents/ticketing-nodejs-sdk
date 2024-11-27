//Control execution order
import './filters'

import { TickeTing, UnsupportedSortError } from '../../src'
import { Collection } from  '../../src/util'
import { expect } from '../setup'

describe("Sorting", function(){

  //Set hook timeout
  this.timeout(10000)

  before(async function(){
    //Setup SDK for testing
    let ticketing: TickeTing = new TickeTing({
      apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
      sandbox: true
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

    //Create test events for sorting
    this.testEvents = []
    for(let i=1; i <= 5; i++){
      this.testEvents.push(
        await ticketing.events.create({
          host: this.host,
          title: "Test Event "+Math.floor(Math.random() * 999999),
          description: "Event Description",
          type: "Standard",
          public: true,
          category: this.category,
          subcategory: "Event Subcategory",
          venue: this.venue
        }
      ))
    }

    // Initialise collection handle for testing
    this.collection = ticketing.events.list(5)
  })

  after(async function(){
    //Remove test resources
    let deletions = []
    for(let event of this.testEvents){
      deletions.push(event.delete())
    }

    await Promise.all(deletions)

    this.category.delete().then(response => {})
    this.host.delete().then(response => {})
    this.venue.delete().then(result => {
      this.region.delete().then(response => {})
    })
  })

  describe('#sort()', function () {
    it("Should throw a UnsupportedSortError if the collection does not support the specified sort field", function(){
      return expect(this.collection.sort("unsupported"))
        .to.eventually.be.rejectedWith("The collection cannot be sorted by unsupported.")
        .and.be.an.instanceOf(UnsupportedSortError)
    })
  })
})