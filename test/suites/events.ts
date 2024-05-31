//Control execution order
import './venues'

import { TickeTing, Event, BadDataError, PermissionError, ResourceExistsError, ResourceNotFoundError } from '../../src'
import { EventModel } from  '../../src/model'
import { Collection, APIAdapter } from  '../../src/util'
import { expect } from '../setup'

//Global event object
let testEvent = null

describe("Events", function(){
  //Set timeout for tests in suite
  this.timeout(15000)

  before(async function(){
    //Setup SDK for testing
    this.ticketing = new TickeTing({
      apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
      sandbox: true
    })

    this.__adapter = new APIAdapter(
      "07b2f3b08810a4296ee19fc59dff48b0",
      true
    )

    //Create an event host
    this.host = /([A-Za-z0-9\-]+)$/.exec(
      (await this.__adapter.post("/hosts", {
        name: "Host "+Math.floor(Math.random() * 999999),
        contact: "Jane Doe",
        email: "jane@eventhost.com"
      })).data.self
    )[1]

    //Create an event category
    this.category = (await this.__adapter.post("/categories", {
      name: "Event Category "+Math.floor(Math.random() * 999999),
      subcategories: ["Event Subcategory"]
    })).data

    //Create an event venue
    this.region = await this.ticketing.regions.create({
      "name": "Region "+Math.floor(Math.random() * 999999),
      "country": "New Country"
    })

    this.venue = await this.ticketing.venues.create({
      name: "Venue "+Math.floor(Math.random() * 999999),
      region: this.region,
      longitude: -70.99214,
      latitude: 43.75518,
      address: "Miami Beach, Miami, Florida"
    })

    //An event to test duplication
    this.secondEvent = await this.ticketing.events.create({
      host: this.host,
      title: "Second Event",
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category.self,
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
      category: this.category.self,
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

    this.__adapter.delete(this.category.self).then(response => {})
    this.__adapter.delete(`/hosts/${this.host}`).then(response => {})
    this.venue.delete().then(result => {
      this.region.delete().then(response => {})
    })
  })

  describe('Register an event', function () {
    it('Should return a valid event object', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.events.create(this.testEventData).then((event => {
          testEvent = event

          expect(event).to.be.an.instanceof(EventModel)
          expect(event.description).to.equal(this.testEventData.description)
          expect(event.type).to.equal(this.testEventData.type)
          expect(event.public).to.equal(this.testEventData.public)
          expect(event.category).to.equal(this.category.name)
          expect(event.subcategory).to.equal(this.testEventData.subcategory)
          expect(event.start).to.equal(this.testEventData.start)
          expect(event.end).to.equal(this.testEventData.end)
          expect(event.venue.self).to.equal(this.testEventData.venue.self)
          expect(event.disclaimer).to.equal(this.testEventData.disclaimer)
          expect(event.banner).to.equal("")
          expect(event.thumbnail).to.equal("")
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
      return expect(this.ticketing.events.create({
        host: this.host,
        venue: this.venue,
        title: "",
        description: "",
        public: "",
        category: "",
        subcategory: ""
      }))
      .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: type, title, description, category, subcategory, public.")
      .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a BadDataError if a non-venue is passed in', function () {
      return expect(this.ticketing.events.create({
        venue: "Non-Venue"
      }))
      .to.eventually.be.rejectedWith("Please provide a valid venue for the event")
      .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError when using an existing name', function () {
      return expect(this.ticketing.events.create(this.testEventData))
        .to.eventually.be.rejectedWith("The following arguments conflict with those of another event: title.")
        .and.be.an.instanceOf(ResourceExistsError)
    })

    it('Should throw a PermissionError when not a host administrator', function () {
      let unauthorised_sdk = new TickeTing({
        apiKey: "e5367bc1de7dd8efbfa1338752f60c83",
        sandbox: true
      })

      let payload = JSON.parse(JSON.stringify(this.testEventData))
      payload.title = "Test Event "+Math.floor(Math.random() * 999999)
      payload.venue = this.venue

      return expect(unauthorised_sdk.events.create(payload))
        .to.eventually.be.rejectedWith("This account is not an administrator for the relevant event host.")
        .and.be.an.instanceOf(PermissionError)
    })
  })

  describe('List event venues', function () {
    it('Should return a collection of Event resources', function () {
      return expect(this.ticketing.events.list()).eventually.to.all.be.instanceof(EventModel)
    })

    it('Should contain the newly created event as its last resource', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.events.list(1).last().then(events => {
          expect(events[0]).to.be.an.instanceof(EventModel)
          expect(events[0].description).to.equal(this.testEventData.description)
          expect(events[0].type).to.equal(this.testEventData.type)
          expect(events[0].public).to.equal(this.testEventData.public)
          expect(events[0].category).to.equal(this.category.name)
          expect(events[0].subcategory).to.equal(this.testEventData.subcategory)
          expect(events[0].start).to.equal(this.testEventData.start)
          expect(events[0].venue.self).to.equal(this.testEventData.venue.self)
          expect(events[0].disclaimer).to.equal(this.testEventData.disclaimer)
          expect(events[0].banner).to.equal("")
          expect(events[0].thumbnail).to.equal("")
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
        this.ticketing.events.list().filter({region: this.region.id}).then(events => {
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
      return new Promise((resolve, reject) => {
        this.ticketing.events.list().filter({title: this.testEventData.title}).then(events => {
          expect(events.length).to.be.least(1)
          expect(events).to.all.have.property("title", this.testEventData.title)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the status filter', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.events.list().filter({status: "Draft"}).then(events => {
          expect(events.length).to.be.least(1)
          expect(events).to.all.have.property("status", "Draft")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the active filter', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.events.list().filter({active: true}).then(events => {
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
      return new Promise((resolve, reject) => {
        this.ticketing.events.list().filter({public: true}).then(events => {
          expect(events.length).to.be.least(1)
          expect(events).to.all.have.property("public", true)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Delete an event', function () {
    it('Should delete the event from the system', function () {
      return expect(testEvent.delete()).to.eventually.be.true
    })

    it('Event should no longer be retrievable', function () {
      return expect(this.ticketing.events.find(testEvent.id))
        .to.eventually.be.rejectedWith("There is presently no resource with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })
})