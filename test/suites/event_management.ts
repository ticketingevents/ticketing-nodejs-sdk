//Control execution order
import './hosts'

import { TickeTing, EventRevision, BadDataError, InvalidStateError, PermissionError, ResourceExistsError, ResourceNotFoundError } from '../../src'
import { CategoryModel, EventRevisionModel, VenueModel, HostModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api, unauthorised_sdk } from '../setup'

//Global event object
let testEvent = null

describe("Event Management", function(){

  //Set hook timeout
  this.timeout(60000)

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
      subcategories: ["Event Subcategory "+Math.floor(Math.random() * 999999)]
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
    this.secondEvent = await this.host.events.create({
      title: "Second Event "+Math.floor(Math.random() * 999999),
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category,
      subcategory: this.category.subcategories[0],
      start: "3033-06-07T20:00",
      end: "3035-06-07T23:00",
      venue: this.venue
    })

    //Initialise test data for suite
    this.testEventData = {
      title: "Test Event "+Math.floor(Math.random() * 999999),
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category,
      subcategory: this.category.subcategories[0],
      start: "3032-06-07T20:00",
      end: "3032-06-07T23:00",
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
    it('Should return a valid EventRevision object', function () {
      return new Promise((resolve, reject) => {
        this.host.events.create(this.testEventData).then((event => {
          testEvent = event

          expect(event).to.be.an.instanceof(EventRevisionModel)
          expect(event.title).to.equal(this.testEventData.title)
          expect(event.description).to.equal(this.testEventData.description)
          expect(event.type).to.equal(this.testEventData.type)
          expect(event.public).to.equal(this.testEventData.public)
          expect(event.start).to.equal(this.testEventData.start)
          expect(event.end).to.equal(this.testEventData.end)
          expect(event.status).to.equal("Draft")
          expect(event.venue).to.be.an.instanceOf(VenueModel).
            and.to.have.property("uri", this.testEventData.venue.uri)
          expect(event.category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.testEventData.category.uri)
          expect(event.subcategory).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.testEventData.subcategory.uri)
          expect(event.disclaimer).to.equal(this.testEventData.disclaimer)
          expect(event.tags).to.deep.equal(this.testEventData.tags)
          expect(event.published).to.be.a.string
          expect(event.popularity).to.equal(0)

          resolve(true)
        })).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      return expect(this.host.events.create({
        host: this.host,
        category: this.category,
        venue: this.venue,
        title: "",
        description: "",
        public: "",
        subcategory: this.category.subcategories[0]
      }))
      .to.eventually.be.rejectedWith("Your request payload is invalid. Please ensure you have included all required fields and values are well-formed.")
      .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a BadDataError if a non-venue is passed in', function () {
      return expect(this.host.events.create({
        host: this.host,
        category: this.category,
        subcategory: this.category.subcategories[0],
        venue: "Non-Venue"
      }))
      .to.eventually.be.rejectedWith("Please provide a valid venue for the event")
      .and.be.an.instanceOf(BadDataError)
    })
  })

  describe('List events', function () {
    it('Should return a collection of EventRevision resources', function () {
      return expect(this.host.events.list()).eventually.to.all.be.instanceof(EventRevisionModel)
    })

    it('Should contain the newly created event as its first resource', function () {
      return new Promise((resolve, reject) => {
        this.host.events.list(1).sort("start", false).first().then(events => {
          expect(events[0]).to.be.an.instanceof(EventRevisionModel)
          expect(events[0].title).to.equal(this.secondEvent.title)
          expect(events[0].description).to.equal(this.secondEvent.description)
          expect(events[0].type).to.equal(this.secondEvent.type)
          expect(events[0].public).to.equal(this.secondEvent.public)
          expect(events[0].start).to.equal(this.secondEvent.start)
          expect(events[0].end).to.equal(this.secondEvent.end)
          expect(events[0].status).to.equal("Draft")
          expect(events[0].venue).to.be.an.instanceof(VenueModel)
            .and.to.have.property("uri", this.secondEvent.venue.uri)
          expect(events[0].category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.secondEvent.category.uri)
          expect(events[0].subcategory).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.secondEvent.subcategory.uri)
          expect(events[0].disclaimer).to.equal(this.secondEvent.disclaimer)
          expect(events[0].tags).to.deep.equal(this.secondEvent.tags)
          expect(events[0].published).to.be.a.string
          expect(events[0].popularity).to.equal(0)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the title filter', function () {
      return expect(this.host.events.list(5).filter({title: this.testEventData.title}))
        .to.eventually.have.lengthOf.at.least(1)
        .and.to.all.have.property("title", this.testEventData.title)
    })

    it('Should return a collection of events matching the active filter', function () {
      return new Promise((resolve, reject) => {
        this.host.events.list(5).filter({active: true}).then(events => {
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
      return expect(this.host.events.list(5).filter({public: true}))
        .to.eventually.have.lengthOf.at.least(1)
        .and.to.all.have.property("public", true)
    })

    it('Should return events sorted by title in ascending order', function () {
      return new Promise((resolve, reject) => {
        this.host.events.list(5).sort("alphabetical").then(events => {
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
        this.host.events.list(5).sort("published", false).then(events => {
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
        this.host.events.list(5).sort("popularity").then(events => {
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
        this.host.events.list(5).sort("start", false).then(events => {
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
    it('Should return the identified EventRevision resource', function () {
      return new Promise((resolve, reject) => {
        this.host.events.find(testEvent.id).then(event => {
          expect(event).to.be.an.instanceof(EventRevisionModel)
          expect(event.title).to.equal(this.testEventData.title)
          expect(event.description).to.equal(this.testEventData.description)
          expect(event.type).to.equal(this.testEventData.type)
          expect(event.public).to.equal(this.testEventData.public)
          expect(event.start).to.equal(this.testEventData.start)
          expect(event.end).to.equal(this.testEventData.end)
          expect(event.status).to.equal("Draft")
          expect(event.venue).to.be.an.instanceof(VenueModel)
            .and.to.have.property("uri", this.testEventData.venue.uri)
          expect(event.category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.testEventData.category.uri)
          expect(event.subcategory).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.testEventData.subcategory.uri)
          expect(event.disclaimer).to.equal(this.testEventData.disclaimer)
          expect(event.tags).to.deep.equal(this.testEventData.tags)
          expect(event.published).to.be.a.string
          expect(event.popularity).to.equal(0)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should throw a PermissionError when using a non-existant ID', function () {
      return expect(this.host.events.find(12345678901234))
        .to.eventually.be.rejectedWith("You are not authorised to access this unlisted event.")
        .and.be.an.instanceOf(PermissionError)
    })
  })

  describe('Update an event', function () {
    it('Should save the changes made to the event', function () {
      //Make changes to the event
      testEvent.type = "Registration"
      testEvent.description = "New event description"

      //Save changes
      return expect(testEvent.save()).eventually.be.true
    })

    it('Should persist event changes', function () {
      return expect(this.host.events.find(testEvent.id))
        .to.eventually.include({
          "type": "Registration",
          "description": "New event description"
        })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      //Make invalid changes to the event
      testEvent.title = ""

      return expect(testEvent.save())
        .to.eventually.be.rejectedWith("Your request payload is invalid. Please ensure you have included all required fields and values are well-formed.")
        .and.be.an.instanceOf(BadDataError)
    })
  })

  describe('Delete an event', function () {
    it('Should delete the event from the system', function () {
      return expect(testEvent.delete()).to.eventually.be.true
    })

    it('Event should no longer be retrievable', function () {
      return expect(this.host.events.find(testEvent.id))
        .to.eventually.be.rejectedWith("You are not authorised to access this unlisted event.")
        .and.be.an.instanceOf(PermissionError)
    })
  })
})
