//Control execution order
import './hosts'

import { TickeTing, Event, BadDataError, InvalidStateError, PermissionError, ResourceExistsError, ResourceNotFoundError } from '../../src'
import { CategoryModel, EventModel, VenueModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing } from '../setup'

//Global event object
let testEvent = null

describe("Events", function(){

  //Set hook timeout
  this.timeout(10000)

  before(async function(){
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

    //An event to test duplication
    this.secondEvent = await ticketing.events.create({
      host: this.host,
      title: "Second Event",
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category,
      subcategory: "Event Subcategory",
      venue: this.venue
    })

    //Initialise test data for suite
    this.testEventData = {
      host: this.host,
      title: "Test Event "+Math.floor(Math.random() * 999999),
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category,
      subcategory: "Event Subcategory",
      start: "2034-06-07T20:00",
      end: "2034-06-07T23:00",
      venue: this.venue,
      disclaimer: "Attend at your own risk",
      tags: ["homelander", "queen maeve", "the deep", "A-Train"]
    }
  })

  after(async function(){
    await this.secondEvent.delete()
    await this.category.delete()
    await this.host.delete()
    await this.venue.delete()
    await this.region.delete()
  })

  describe('Register an event', function () {
    it('Should return a valid event object', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.create(this.testEventData).then((event => {
          testEvent = event

          expect(event).to.be.an.instanceof(EventModel)
          expect(event.description).to.equal(this.testEventData.description)
          expect(event.type).to.equal(this.testEventData.type)
          expect(event.public).to.equal(this.testEventData.public)
          expect(event.category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.testEventData.category.uri)
          expect(event.subcategory).to.equal(this.testEventData.subcategory)
          expect(event.start).to.equal(this.testEventData.start)
          expect(event.end).to.equal(this.testEventData.end)
          expect(event.venue).to.be.an.instanceOf(VenueModel).
            and.to.have.property("uri", this.testEventData.venue.uri)
          expect(event.disclaimer).to.equal(this.testEventData.disclaimer)
          expect(event.banner).to.equal(`${ticketing.mediaURL}/banner/${event.id}`)
          expect(event.thumbnail).to.equal(`${ticketing.mediaURL}/thumbnail/${event.id}`)
          expect(event.status).to.equal("Draft")
          expect(event.published).to.be.a.string
          expect(event.popularity).to.equal(0)

          resolve(true)
        })).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      return expect(ticketing.events.create({
        host: this.host,
        category: this.category,
        venue: this.venue,
        title: "",
        description: "",
        public: "",
        subcategory: ""
      }))
      .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: type, title, description, subcategory, public.")
      .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a BadDataError if a non-venue is passed in', function () {
      return expect(ticketing.events.create({
        host: this.host,
        category: this.category,
        venue: "Non-Venue"
      }))
      .to.eventually.be.rejectedWith("Please provide a valid venue for the event")
      .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError when using an existing title', function () {
      return expect(ticketing.events.create(this.testEventData))
        .to.eventually.be.rejectedWith("The following arguments conflict with those of another event: title.")
        .and.be.an.instanceOf(ResourceExistsError)
    })

    it('Should throw a PermissionError when not a host administrator', function () {
      let unauthorised_sdk = null
      if(process.env.npm_config_env == "production"){
        unauthorised_sdk = new TickeTing({
          apiKey: "0acb10082a313f517954a34d2a7aedb7",
          sandbox: false
        })
      }else{
        unauthorised_sdk = new TickeTing({
          apiKey: "413c7e517b63822c3037ead7679c780e",
          sandbox: true
        })
      }

      let payload = JSON.parse(JSON.stringify(this.testEventData))
      payload.title = "Test Event "+Math.floor(Math.random() * 999999)
      payload.host = this.host
      payload.category = this.category
      payload.venue = this.venue

      return expect(unauthorised_sdk.events.create(payload))
        .to.eventually.be.rejectedWith("This account is not an administrator for the relevant event host.")
        .and.be.an.instanceOf(PermissionError)
    })
  })

  describe('List published events', function () {
    it('Should return a collection of Event resources', function () {
      return expect(ticketing.events.published.list(5)).eventually.to.all.be.instanceof(EventModel)
    })

    it('Should return a collection of events matching the region filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).filter({region: this.region.id}).then(events => {
          for(let event of events){
            expect(event.venue.region.self).to.equal(this.region.self)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return events sorted by title in ascending order', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).sort("alphabetical").then(events => {
          expect(events.map(event => event.title.toLowerCase())).to.be.ascending

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return events sorted by publication date in descending order', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).sort("published", false).then(events => {
          expect(events).to.be.descendingBy("published")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return events sorted by popularity in ascending order', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).sort("popularity").then(events => {
          expect(events).to.be.ascendingBy("popularity")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return events sorted by start date in descending order', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).sort("start", false).then(events => {
          expect(events).to.be.descendingBy("start")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('List all events', function () {
    it('Should return a collection of Event resources', function () {
      return expect(ticketing.events.list(5).sort("start", false)).eventually.to.all.be.instanceof(EventModel)
    })

    it('Should contain the newly created event as its first resource', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(1).sort("start", false).first().then(events => {
          expect(events[0]).to.be.an.instanceof(EventModel)
          expect(events[0].description).to.equal(this.testEventData.description)
          expect(events[0].type).to.equal(this.testEventData.type)
          expect(events[0].public).to.equal(this.testEventData.public)
          expect(events[0].category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.testEventData.category.uri)
          expect(events[0].subcategory).to.equal(this.testEventData.subcategory)
          expect(events[0].start).to.equal(this.testEventData.start)
          expect(events[0].venue).to.be.an.instanceof(VenueModel)
            .and.to.have.property("uri", this.testEventData.venue.uri)
          expect(events[0].disclaimer).to.equal(this.testEventData.disclaimer)
          expect(events[0].banner).to.equal(`${ticketing.mediaURL}/banner/${events[0].id}`)
          expect(events[0].thumbnail).to.equal(`${ticketing.mediaURL}/thumbnail/${events[0].id}`)
          expect(events[0].status).to.equal("Draft")
          expect(events[0].published).to.be.a.string
          expect(events[0].popularity).to.equal(0)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the region filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).filter({region: this.region.id}).then(events => {
          expect(events.length).to.be.least(1)

          for(let event of events){
            expect(event.venue.region.self).to.equal(this.region.self)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the title filter', function () {
      return expect(ticketing.events.list(5).filter({title: this.testEventData.title}))
        .to.eventually.have.lengthOf.at.least(1)
        .and.to.all.have.property("title", this.testEventData.title)
    })

    it('Should return a collection of events matching the status filter', function () {
      return expect(ticketing.events.list(5).filter({status: "Draft"}))
        .to.eventually.have.lengthOf.at.least(1)
        .and.to.all.have.property("status", "Draft")
    })

    it('Should return a collection of events matching the active filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).filter({active: true}).then(events => {
          expect(events.length).to.be.least(1)

          for(let event of events){
            expect(new Date(event.end)).to.be.least(new Date())
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the public filter', function () {
      return expect(ticketing.events.list(5).filter({public: true}))
        .to.eventually.have.lengthOf.at.least(1)
        .and.to.all.have.property("public", true)
    })

    it('Should return events sorted by title in ascending order', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).sort("alphabetical").then(events => {
          expect(events).to.have.lengthOf.at.least(1)
          expect(events.map(event => event.title.toLowerCase())).to.be.ascending

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return events sorted by publication date in descending order', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).sort("published", false).then(events => {
          expect(events).to.have.lengthOf.at.least(1)
            .and.to.be.descendingBy("published")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return events sorted by popularity in ascending order', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).sort("popularity").then(events => {
          expect(events).to.have.lengthOf.at.least(1)
            .and.to.be.ascendingBy("popularity")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return events sorted by start date in descending order', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).sort("start", false).then(events => {
          expect(events).to.have.lengthOf.at.least(1)
            .and.to.be.descendingBy("start")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Fetch an event', function () {
    it('Should return the identified Event resource', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.find(testEvent.id).then(event => {
          expect(event).to.be.an.instanceof(EventModel)
          expect(event.description).to.equal(this.testEventData.description)
          expect(event.type).to.equal(this.testEventData.type)
          expect(event.public).to.equal(this.testEventData.public)
          expect(event.category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.testEventData.category.uri)
          expect(event.subcategory).to.equal(this.testEventData.subcategory)
          expect(event.start).to.equal(this.testEventData.start)
          expect(event.end).to.equal(this.testEventData.end)
          expect(event.venue).to.be.an.instanceof(VenueModel)
            .and.to.have.property("uri", this.testEventData.venue.uri)
          expect(event.disclaimer).to.equal(this.testEventData.disclaimer)
          expect(event.banner).to.equal(`${ticketing.mediaURL}/banner/${event.id}`)
          expect(event.thumbnail).to.equal(`${ticketing.mediaURL}/thumbnail/${event.id}`)
          expect(event.status).to.equal("Draft")
          expect(event.published).to.be.a.string
          expect(event.popularity).to.equal(0)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should throw a ResourceNotFoundError when using a non-existant ID', function () {
      return expect(ticketing.events.find(12345))
        .to.eventually.be.rejectedWith("There is presently no resource with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })

    it('Should throw a PermissionError when accessed with another user', function () {
      let unauthorised_sdk = null
      if(process.env.npm_config_env == "production"){
        unauthorised_sdk = new TickeTing({
          apiKey: "0acb10082a313f517954a34d2a7aedb7",
          sandbox: false
        })
      }else{
        unauthorised_sdk = new TickeTing({
          apiKey: "413c7e517b63822c3037ead7679c780e",
          sandbox: true
        })
      }

      return expect(unauthorised_sdk.events.find(testEvent.id))
        .to.eventually.be.rejectedWith("You are not authorised to access this unlisted event.")
        .and.be.an.instanceOf(PermissionError)
    })
  })

  describe('Update an event', function () {
    it('Should save the changes made to the event', function () {
      //Make changes to the event
      testEvent.public = false
      testEvent.end = "2034-09-07T23:00"

      //Save changes
      return expect(testEvent.save()).eventually.be.true
    })

    it('Should persist event changes', function () {
      return expect(ticketing.events.find(testEvent.id))
        .to.eventually.include({
          "public": false,
          "end": "2034-09-07T23:00"
        })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      //Make invalid changes to the event
      testEvent.title = ""

      return expect(testEvent.save())
        .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: title.")
        .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError when using an existing title', function () {
      //Attempt to change the title of the existing event to that of the second one
      testEvent.title = this.secondEvent.title

      return expect(testEvent.save())
        .to.eventually.be.rejectedWith("The following arguments conflict with those of another event: title.")
        .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('Submit an event for review', function () {
    it('Should submit the event for review', function () {
      return expect(testEvent.submit()).to.eventually.be.true
    })

    it('Should throw a InvalidStateError when already submitted', function () {
      //Attempt to resubmit the same event
      return expect(testEvent.submit())
        .to.eventually.be.rejectedWith("The event has already been submitted or cancelled.")
        .and.be.an.instanceOf(InvalidStateError)
    })
  })

  describe('Delete an event', function () {
    it('Should delete the event from the system', function () {
      return expect(testEvent.delete()).to.eventually.be.true
    })

    it('Event should no longer be retrievable', function () {
      return expect(ticketing.events.find(testEvent.id))
        .to.eventually.be.rejectedWith("There is presently no resource with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })
})