//Control execution order
import './event_management'

import { TickeTing, EventRevision, BadDataError, InvalidStateError, PermissionError, ResourceExistsError, ResourceNotFoundError } from '../../src'
import { CategoryModel, EventRevisionModel, VenueModel, HostModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api, unauthorised_sdk } from '../setup'

//Global event object
let testEvent = null

describe.skip("Event Listings", function(){

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
      subcategories: ["Event Subcategory "+Math.floor(Math.random() * 999999)
]    })

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
      start: "3034-06-07T20:00",
      end: "3034-06-07T23:00",
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

  describe('Search event listings', function () {
    it('Should return a collection of Event resources', function () {
      return expect(ticketing.events.list(5).sort("start", false)).eventually.to.all.be.instanceof(EventRevisionModel)
    })

    it('Should contain the newly created event as its first resource', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(1).sort("start", false).first().then(events => {
          expect(events[0]).to.be.an.instanceof(EventRevisionModel)
          expect(events[0].description).to.equal(this.testEventData.description)
          expect(events[0].type).to.equal(this.testEventData.type)
          expect(events[0].public).to.equal(this.testEventData.public)
          expect(events[0].category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.testEventData.category.uri)
          expect(events[0].subcategory).to.equal(this.testEventData.subcategory)
          expect(events[0].start).to.equal(this.testEventData.start)
          expect(events[0].disclaimer).to.equal(this.testEventData.disclaimer)
          expect(events[0].banner).to.equal(`${ticketing.mediaURL}/banner/${events[0].id}`)
          expect(events[0].thumbnail).to.equal(`${ticketing.mediaURL}/thumbnail/${events[0].id}`)
          expect(events[0].status).to.equal("Draft")
          expect(events[0].published).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
          expect(events[0].popularity).to.equal(0)

          expect(events[0].venue).to.be.an.instanceof(VenueModel)
            .and.to.have.property("uri", this.testEventData.venue.uri)

          expect(events[0].host).to.be.an.instanceof(HostModel)
            .and.to.have.property("uri", this.testEventData.host.uri)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the region filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).filter({region: this.region}).then(events => {
          expect(events.length).to.be.least(1)

          for(let event of events){
            expect(event.venue.region.uri).to.equal(this.region.uri)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the host filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).filter({host: this.host}).then(events => {
          expect(events.length).to.be.least(1)

          for(let event of events){
            expect(event.host.uri).to.equal(this.host.uri)
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

    it('Should return a collection of events matching the featured filter', function () {
      return expect(ticketing.events.list(5).filter({featured: true}))
        .to.eventually.have.lengthOf.at.least(1)
        .and.to.all.have.property("featured", true)
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

  describe('List published events', function () {
    it('Should return a collection of Event resources', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).sort("start", false).then(events => {
          expect(events.length).to.be.at.least(1)
          expect(events[0]).to.be.an.instanceof(EventRevisionModel)
          expect(events[0].public).to.equal(this.testEventData.public)
          expect(events[0].category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.testEventData.category.uri)
          expect(events[0].subcategory).to.equal(this.testEventData.subcategory)
          expect(events[0].start).to.equal(this.testEventData.start)
          expect(events[0].disclaimer).to.equal(this.testEventData.disclaimer)
          expect(events[0].banner).to.equal(`${ticketing.mediaURL}/banner/${events[0].id}`)
          expect(events[0].thumbnail).to.equal(`${ticketing.mediaURL}/thumbnail/${events[0].id}`)
          expect(events[0].status).to.equal("Listed")
          expect(events[0].published).to.be.a.string
          expect(events[0].popularity).to.equal(0)

          expect(events[0].venue).to.be.an.instanceof(VenueModel)
            .and.to.have.property("uri", this.testEventData.venue.uri)

          expect(events[0].host).to.be.an.instanceof(HostModel)
            .and.to.have.property("uri", this.testEventData.host.uri)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the region filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).filter({region: this.region}).then(events => {
          expect(events.length).to.be.at.least(1)
          
          for(let event of events){
            expect(event.venue.region.uri).to.equal(this.region.uri)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the host filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).filter({host: this.host}).then(events => {
          expect(events.length).to.be.least(1)

          for(let event of events){
            expect(event.host.uri).to.equal(this.host.uri)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the category filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).filter({category: this.category}).then(events => {
          expect(events.length).to.be.at.least(1)
          
          for(let event of events){
            expect(event.category.uri).to.equal(this.category.uri)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the subcategory filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).filter({subcategory: this.secondEvent.subcategory}).then(events => {
          expect(events.length).to.be.at.least(1)
          
          for(let event of events){
            expect(event.subcategory).to.equal(this.secondEvent.subcategory)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the bwfore filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).filter({before: this.testEventData.end}).then(events => {
          expect(events.length).to.be.at.least(1)
          
          for(let event of events){
            expect(new Date(event.end)).to.be.at.most(new Date(this.testEventData.end))
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the after filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).filter({after: this.testEventData.start}).then(events => {
          expect(events.length).to.be.at.least(1)
          
          for(let event of events){
            expect(new Date(event.start)).to.be.at.least(new Date(this.testEventData.start))
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the title filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).filter({title: this.testEventData.title}).then(events => {
          expect(events.length).to.be.at.least(1)
          
          for(let event of events){
            expect(event.title).to.equal(this.testEventData.title)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the active filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).filter({active: true}).then(events => {
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

    it('Should return a collection of events matching the featured filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.published.list(5).filter({featured: true}).then(events => {
          expect(events.length).to.be.least(1)

          for(let event of events){
            expect(event.featured).to.be.true
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
})