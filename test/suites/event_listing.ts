//Control execution order
import './content_review'

import { TickeTing, BadDataError, InvalidStateError, PermissionError, ResourceExistsError, ResourceNotFoundError } from '../../src'
import { CategoryModel, EventListingModel, TierListingModel, VenueModel, HostModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api, unauthorised_sdk } from '../setup'

//Global event object
let testEvent = null

describe("Event Listing", function(){

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

    //An event to test listing
    this.testEvent = await this.host.events.create({
      title: "Second Event "+Math.floor(Math.random() * 999999),
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category,
      subcategory: this.category.subcategories[0],
      start: "3033-06-07T20:00:00",
      end: "3035-06-07T23:00:00",
      venue: this.venue,
      banner: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==",
      thumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q=="
    })

    //Create test tiers
    this.testTier = await this.host.tiers.create({
        name: "Test Tier "+Math.floor(Math.random() * 999999),
        description: "Spend a day shadowing a supe!",
        price: 500.00,
        capacity: 5,
        available_from: "2025-05-02T21:00:00",
        available_to: "2035-07-01T00:00:00",
        events: [{
            "event": this.testEvent,
            "share": 100
        }],
        "artwork": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCAgJDBQNDAsLDBgREg4UHRkeHhwZHBsgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwApE//Z",
    })

    let submission = await this.testEvent.submissions.create()
    await submission.approve("Your event is approved!")
    await this.testEvent.publish()

    //Event to test inaccessibility of unlisted events
    this.secondEvent = await this.host.events.create({
      title: "Test Event "+Math.floor(Math.random() * 999999),
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category,
      subcategory: this.category.subcategories[0],
      start: "2025-06-07T20:00:00",
      end: "2025-06-07T23:00:00",
      venue: this.venue,
      disclaimer: "Attend at your own risk",
      tags: ["homelander", "queen maeve", "the deep", "A-Train"]
    })

    this.secondTier = await this.host.tiers.create({
        name: "Second Tier "+Math.floor(Math.random() * 999999),
        description: "General access!",
        price: 100.00,
        capacity: 250,
        available_from: "2025-05-02T21:00:00",
        available_to: "2035-07-01T00:00:00",
        events: [{
            "event": this.secondEvent,
            "share": 100
        }]
    })
  })

  after(async function(){
    await this.secondTier.delete()
    await this.testTier.delete()
    await this.secondEvent.delete()
    await this.testEvent.delete()
    await this.venue.delete()
    await this.region.delete()
    await this.category.delete()
    await this.host.delete()
  })

  describe('Search event listings', function () {
    it('Should return a collection of EventListing resources', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).sort("start", false).then(events => {
          expect(events.length).to.be.at.least(1)
          expect(events[0]).to.be.an.instanceof(EventListingModel)
          expect(events[0].uri).to.equal(`/events/${this.testEvent.id}`)
          expect(events[0].title).to.equal(this.testEvent.title)
          expect(events[0].description).to.equal(this.testEvent.description)
          expect(events[0].start).to.equal(this.testEvent.start)
          expect(events[0].end).to.equal(this.testEvent.end)
          expect(events[0].host).to.be.an.instanceOf(HostModel).
            and.to.have.property("uri", this.host.uri)
          expect(events[0].venue).to.be.an.instanceOf(VenueModel).
            and.to.have.property("uri", this.venue.uri)
          expect(events[0].category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.category.uri)
          expect(events[0].subcategory).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.category.subcategories[0].uri)
          expect(events[0].disclaimer).to.equal(this.testEvent.disclaimer)
          expect(events[0].tags).to.eql(this.testEvent.tags)
          expect(events[0].published).to.be.a("string")
            .and.to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
          expect(events[0].banner).to.equal(`${ticketing.mediaURL}/event/banner/${events[0].id}.jpeg`)
          expect(events[0].thumbnail).to.equal(`${ticketing.mediaURL}/event/thumbnail/${events[0].id}.jpeg`)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the region filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).filter({region: this.region}).then(events => {
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
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).filter({title: this.testEvent.title}).then(events => {
          expect(events.length).to.be.at.least(1)
          
          for(let event of events){
            expect(event.title).to.equal(this.testEvent.title)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
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

    it('Should return a collection of events matching the category filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).filter({category: this.category}).then(events => {
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
        ticketing.events.list(5).filter({subcategory: this.testEvent.subcategory}).then(events => {
          expect(events.length).to.be.at.least(1)
          
          for(let event of events){
            expect(event.subcategory.uri).to.equal(this.testEvent.subcategory.uri)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it.skip('Should return a collection of events matching the featured filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).filter({featured: true}).then(events => {
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
        ticketing.events.list(5).sort("alphabetical").then(events => {
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
          expect(events).to.be.descendingBy("published")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it.skip('Should return events sorted by popularity in ascending order', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).sort("popularity", true).then(events => {
          expect(events).to.be.descendingBy("popularity")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return events sorted by start date in descending order', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.list(5).sort("start", false).then(events => {
          expect(events).to.be.descendingBy("start")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Fetch an event listing', function () {
    it('Should return the identified EventListing resource', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.find(this.testEvent.id).then(event => {
          expect(event).to.be.an.instanceof(EventListingModel)
          expect(event.uri).to.equal(`/events/${this.testEvent.id}`)
          expect(event.title).to.equal(this.testEvent.title)
          expect(event.description).to.equal(this.testEvent.description)
          expect(event.start).to.equal(this.testEvent.start)
          expect(event.end).to.equal(this.testEvent.end)
          expect(event.host).to.be.an.instanceOf(HostModel).
            and.to.have.property("uri", this.host.uri)
          expect(event.venue).to.be.an.instanceOf(VenueModel).
            and.to.have.property("uri", this.venue.uri)
          expect(event.category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.category.uri)
          expect(event.subcategory).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.category.subcategories[0].uri)
          expect(event.disclaimer).to.equal(this.testEvent.disclaimer)
          expect(event.tags).to.eql(this.testEvent.tags)
          expect(event.published).to.be.a("string")
            .and.to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
          expect(event.banner).to.equal(`${ticketing.mediaURL}/event/banner/${event.id}.jpeg`)
          expect(event.thumbnail).to.equal(`${ticketing.mediaURL}/event/thumbnail/${event.id}.jpeg`)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should throw a ResourceNotFoundError when using a non-existant ID', function () {
      return expect(ticketing.events.find(12345678901234))
        .to.eventually.be.rejectedWith("There is presently no event with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })

    it('Should throw a PermissionError when using a non-existant ID', function () {
      return expect(ticketing.events.find(this.secondEvent.id))
        .to.eventually.be.rejectedWith("You are not authorised to access this unlisted event.")
        .and.be.an.instanceOf(PermissionError)
    })
  })

  describe('List event tiers', function () {
    it('Should return a collection of TierListing resources', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.find(this.testEvent.id).then(event => {
          expect(event.tiers.list()).eventually.to.all.be.instanceof(TierListingModel)
          resolve(true)
        })
      })
    })

    it('Should contain the newly created tier as its first resource', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.find(this.testEvent.id).then(event => {
          event.tiers.list(1).then(tiers => {
            expect(tiers[0]).to.be.an.instanceof(TierListingModel)
            expect(tiers[0].name).to.eq(this.testTier.name)
            expect(tiers[0].description).to.eq(this.testTier.description)
            expect(tiers[0].price).to.eq(this.testTier.price)
            expect(tiers[0].available_from).to.eq(this.testTier.available_from)
            expect(tiers[0].available_to).to.eq(this.testTier.available_to)
            expect(tiers[0].artwork).to.match(new RegExp(`\/tier\/artwork\/[0-9]{14}.jpe?g`))
            expect(tiers[0].unit_size).to.eq(this.testTier.unit_size)
            expect(tiers[0].purchase_limit).to.eq(this.testTier.purchase_limit)
            expect(tiers[0].remaining).to.eq(this.testTier.remaining)

            expect(tiers[0].upgrades.length).to.eq(this.testTier.upgrades.length)
            for(let i=0; i < tiers[0].upgrades.length; i++){
                expect(tiers[0].upgrades[i]).to.be.an.instanceOf(TierListingModel)
                    .and.to.have.property("uri", this.testTier.upgrades[i].uri)
            }

            resolve(true)
          }).catch(error => {
            reject(error)
          })
        })
      })
    })

    it('Should return a collection of tiers matching the active filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.events.find(this.testEvent.id).then(event => {
          event.tiers.list().filter({active: true}).then(tiers => {
            expect(tiers).to.have.lengthOf.at.least(1)
            for(let tier of tiers){
              expect(new Date(tier.available_from)).to.be.most(new Date())
              expect(new Date(tier.available_to)).to.be.least(new Date())
            }

            resolve(true)
          }).catch(error => {
            reject(error)
          })
        })
      })
    })
  })
})