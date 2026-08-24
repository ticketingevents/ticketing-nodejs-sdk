//Control execution order
import './event_management'

import { TickeTing, EventRevision, BadDataError, PermissionError, ResourceExistsError, ResourceNotFoundError } from '../../src'
import { CategoryModel, EventRevisionModel, TierModel, VenueModel, HostModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api, unauthorised_sdk } from '../setup'

//Global resource objects
let testTier = null

describe("Tier Management", function(){

  //Set hook timeout
  this.timeout(60000)

  before(async function(){
    //Create a customer
    this.customer = await ticketing.accounts.create({
      username: "mothers.milk"+Math.floor(Math.random() * 999999),
      password: "WuT4NGcl4n",
      email: "marvin.milk@usmc.gov"+Math.floor(Math.random() * 999999),
      firstName: "Marvin",
      lastName: "Milk",
      title: "Mr",
      dateOfBirth: "1974-09-14",
      phone: "+1 (268) 555 0123",
      country: "Antigua and Barbuda",
      firstAddressLine: "Jennings New Extension",
      city: "Jennings",
      state: "Saint Mary's"
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

    //Create an event
    this.event = await this.host.events.create({
      title: "Event "+Math.floor(Math.random() * 999999),
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category,
      subcategory: this.category.subcategories[0],
      start: "3033-06-07T20:00",
      end: "3035-06-07T23:00",
      venue: this.venue,
      banner: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==",
      thumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q=="
    })

    //Publish event
    let submission = await this.event.submissions.create()
    await submission.approve("Event approved")
    await this.event.publish()

    //Create a second event
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

    //Create an upgrade tier
    this.upgrade_tier = await this.host.tiers.create({
        name: "Second Tier "+Math.floor(Math.random() * 999999),
        description: "Spend a day shadowing a supe!",
        price: 500.00,
        capacity: 5,
        available_from: "2025-05-02T21:00",
        available_to: "2025-07-01T00:00",
        events: [{
            "event": this.event,
            "share": 100
        }]
    })

    //Initialise tier data for suite
    this.testTierData = {
        "name": "Backstage Pass",
        "description": "Gain exclusive access to meet the Supes and hang out after the show.",
        "price": 299.9,
        "capacity": 20,
        "available_from": "2025-05-02T21:00:00",
        "available_to": "2035-07-01T00:00:00",
        "events": [{
          "event": this.event,
          "share": 100
        }],
        "artwork": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCAgJDBQNDAsLDBgREg4UHRkeHhwZHBsgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwApE//Z",
        "unit_size": 1,
        "purchase_limit": 10,
        "purchase_note": "Your all set. Remember to give the codeword HOMELANDER when coming backstage.",
        "complimentary": false,
        "transferrable": false,
        "upgrades": [this.upgrade_tier]
    }
  })

  after(async function(){
    await this.upgrade_tier.delete()
    await this.secondEvent.delete()
    await this.event.delete()
    await this.category.delete()
    await this.host.delete()
    await this.venue.delete()
    await this.region.delete()
    await this.customer.delete()
  })

  describe('Create a tier', function () {
    it('Should return a valid Tier object', function () {
      return new Promise((resolve, reject) => {
        this.host.tiers.create(this.testTierData).then((tier => {
            testTier = tier

            expect(tier).to.be.an.instanceof(TierModel)
            expect(tier.name).to.eq(this.testTierData.name)
            expect(tier.description).to.eq(this.testTierData.description)
            expect(tier.price).to.eq(this.testTierData.price)
            expect(tier.capacity).to.eq(this.testTierData.capacity)
            expect(tier.available_from).to.eq(this.testTierData.available_from)
            expect(tier.available_to).to.eq(this.testTierData.available_to)
            expect(tier.artwork).to.match(new RegExp(`\/tier\/artwork\/[0-9]{14}.jpe?g`))
            expect(tier.unit_size).to.eq(this.testTierData.unit_size)
            expect(tier.purchase_limit).to.eq(this.testTierData.purchase_limit)
            expect(tier.purchase_note).to.eq(this.testTierData.purchase_note)
            expect(tier.complimentary).to.eq(this.testTierData.complimentary)
            expect(tier.transferrable).to.eq(this.testTierData.transferrable)
            expect(tier.gross_sales).to.eq(0)
            expect(tier.units_sold).to.eq(0)

            expect(tier.upgrades.length).to.eq(this.testTierData.upgrades.length)
            for(let i=0; i < tier.upgrades.length; i++){
                expect(tier.upgrades[i]).to.be.an.instanceOf(TierModel)
                    .and.to.have.property("uri", this.testTierData.upgrades[i].uri)
            }

            tier.events.then(events => {
              expect(events.length).to.eq(this.testTierData.events.length)
              for(let i=0; i < events.length; i++){
                  expect(events[i].event).to.be.an.instanceOf(EventRevisionModel)
                      .and.to.have.property("uri", this.testTierData.events[i].event.uri)
                  expect(events[i].share).to.eq(this.testTierData.events[i].share)
              }

              resolve(true)
            })
        })).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should throw a BadDataError if a non-event is passed in', function () {
      return expect(this.host.tiers.create({
        events: [{
            event: "Non-event",
            share: 100
        }]
      }))
      .to.eventually.be.rejectedWith("One or more of the specified events is not a valid EventRevision.")
      .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a BadDataError if a non-tier is passed in', function () {
      return expect(this.host.tiers.create({
        upgrades: ["Non-tier"]
      }))
      .to.eventually.be.rejectedWith("One or more of the specified tiers is not a valid Tier.")
      .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError if a duplicate name is submitted', function () {
      return expect(this.host.tiers.create({
        name: "Backstage Pass",
        description: "Gain exclusive access to meet the Supes and hang out after the show.",
        price: 299.9,
        capacity: 20,
        available_from: "2025-05-02T21:00:00",
        available_to: "2025-07-01T00:00:00",
        events: [{
          "event": this.event,
          "share": 100
        }],
      }))
      .to.eventually.be.rejectedWith("One or more of the specified events already has a tier with the given name.")
      .and.be.an.instanceOf(ResourceExistsError)
    })

    after(async function(){
      //Order tickets from the new tier
      let cart = await this.customer.carts.create()
      cart.add(testTier, 5)
      let order = await cart.checkout()
      await order.settle({
        number: "4111111111111111",
        cvv: "123",
        expiryDate: "12/30",
        name: "Marvin M. Milk",
        email: "marvin.milk@usmc.gov",
        phone: "+1 (268) 555 0123",
        address1: "Hermitage Rd.",
        address2: "Jennings New Extension",
        city: "Jennings",
        district: "Saint Mary'\''s",
        country: "Antigua and Barbuda"
      })
    })
  })

  describe('List tiers', function () {
    it('Should return a collection of Tier resources', function () {
      return expect(this.host.tiers.list()).eventually.to.all.be.instanceof(TierModel)
    })

    it('Should contain the newly created tier as its first resource', function () {
      return new Promise((resolve, reject) => {
        this.host.tiers.list(1).next().then(tiers => {
          expect(tiers[0]).to.be.an.instanceof(TierModel)
          expect(tiers[0].name).to.eq(this.testTierData.name)
          expect(tiers[0].description).to.eq(this.testTierData.description)
          expect(tiers[0].price).to.eq(this.testTierData.price)
          expect(tiers[0].capacity).to.eq(this.testTierData.capacity)
          expect(tiers[0].available_from).to.eq(this.testTierData.available_from)
          expect(tiers[0].available_to).to.eq(this.testTierData.available_to)
          expect(tiers[0].artwork).to.match(new RegExp(`\/tier\/artwork\/[0-9]{14}.jpe?g`))
          expect(tiers[0].unit_size).to.eq(this.testTierData.unit_size)
          expect(tiers[0].purchase_limit).to.eq(this.testTierData.purchase_limit)
          expect(tiers[0].purchase_note).to.eq(this.testTierData.purchase_note)
          expect(tiers[0].complimentary).to.eq(this.testTierData.complimentary)
          expect(tiers[0].transferrable).to.eq(this.testTierData.transferrable)
          expect(tiers[0].gross_sales).to.eq(1499.50)
          expect(tiers[0].units_sold).to.eq(5)

          expect(tiers[0].upgrades.length).to.eq(this.testTierData.upgrades.length)
          for(let i=0; i < tiers[0].upgrades.length; i++){
              expect(tiers[0].upgrades[i]).to.be.an.instanceOf(TierModel)
                  .and.to.have.property("uri", this.testTierData.upgrades[i].uri)
          }

          tiers[0].events.then(events => {
            expect(events.length).to.eq(this.testTierData.events.length)
            for(let i=0; i < events.length; i++){
                expect(events[i].event).to.be.an.instanceOf(EventRevisionModel)
                    .and.to.have.property("uri", this.testTierData.events[i].event.uri)
                expect(events[i].share).to.eq(this.testTierData.events[i].share)
            }

            resolve(true)
          })
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of tiers matching the event filter', function () {
      return new Promise((resolve, reject) => {
        this.host.tiers.list().filter({event: this.event}).then(tiers => {
          expect(tiers).to.have.lengthOf.at.least(1)
          tiers[0].events.then(events => {
            expect(events).to.have.lengthOf.at.least(1)

            for(let event of events){
              expect(event.event)
                .to.be.an.instanceOf(EventRevisionModel)
                .and.to.have.property("uri", this.event.uri)
            }

            resolve(true)
          }).catch(error => {
            reject(error)
          })
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Fetch a tier', function () {
    it('Should return the identified Tier resource', function () {
      return new Promise((resolve, reject) => {
        this.host.tiers.find(testTier.id).then(tier => {
          expect(tier).to.be.an.instanceof(TierModel)
          expect(tier.name).to.eq(this.testTierData.name)
          expect(tier.description).to.eq(this.testTierData.description)
          expect(tier.price).to.eq(this.testTierData.price)
          expect(tier.capacity).to.eq(this.testTierData.capacity)
          expect(tier.available_from).to.eq(this.testTierData.available_from)
          expect(tier.available_to).to.eq(this.testTierData.available_to)
          expect(tier.artwork).to.match(new RegExp(`\/tier\/artwork\/[0-9]{14}.jpe?g`))
          expect(tier.unit_size).to.eq(this.testTierData.unit_size)
          expect(tier.purchase_limit).to.eq(this.testTierData.purchase_limit)
          expect(tier.purchase_note).to.eq(this.testTierData.purchase_note)
          expect(tier.complimentary).to.eq(this.testTierData.complimentary)
          expect(tier.transferrable).to.eq(this.testTierData.transferrable)
          expect(tier.gross_sales).to.eq(1499.50)
          expect(tier.units_sold).to.eq(5)

          expect(tier.upgrades.length).to.eq(this.testTierData.upgrades.length)
          for(let i=0; i < tier.upgrades.length; i++){
              expect(tier.upgrades[i]).to.be.an.instanceOf(TierModel)
                  .and.to.have.property("uri", this.testTierData.upgrades[i].uri)
          }

          tier.events.then(events => {
            expect(events.length).to.eq(this.testTierData.events.length)
            for(let i=0; i < events.length; i++){
                expect(events[i].event).to.be.an.instanceOf(EventRevisionModel)
                    .and.to.have.property("uri", this.testTierData.events[i].event.uri)
                expect(events[i].share).to.eq(this.testTierData.events[i].share)
            }

            resolve(true)
          })
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should throw a ResourceNotFoundError when using a non-existant ID', function () {
      return expect(this.host.tiers.find(12345678901234))
        .to.eventually.be.rejectedWith("There is presently no tier with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })

  describe('Update a tier', function () {
    it('Should save the changes made to the tier', function () {
      return new Promise((resolve, reject) => {
        //Make changes to the event
        testTier.name = "Season Pass"

        testTier.events.then(events => {
          events[0].share = 50
          events.push({
            event: this.secondEvent,
            share: 50
          })

          //Save changes
          testTier.save().then(saved => {
            expect(saved).to.be.true
            resolve(true)
          }).catch(error => {
            reject(error)
          })
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should persist event changes', function () {
      return new Promise((resolve, reject) => {
        this.host.tiers.find(testTier.id).then(tier => {
          expect(tier.name).to.equal("Season Pass")

          tier.events.then(events => {
            expect(events).to.have.a.lengthOf(2)
            expect(events[0]).to.have.property("share", 50)
            expect(events[1]).to.have.property("share", 50)
            expect(events[1].event).to.have.property("uri", this.secondEvent.uri)

            resolve(true)
          }).catch(error => {
            reject(error)
          })
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      //Make invalid changes to the event
      testTier.name = ""

      return expect(testTier.save())
        .to.eventually.be.rejectedWith("Your request payload is invalid. Please ensure you have included all required fields and values are well-formed.")
        .and.be.an.instanceOf(BadDataError)
    })
  })

  describe('Delete a tier', function () {
    it('Should delete the tier from the system', function () {
      return expect(testTier.delete()).to.eventually.be.true
    })

    it('Tier should no longer be retrievable', function () {
      return expect(this.host.tiers.find(testTier.id))
        .to.eventually.be.rejectedWith("There is presently no tier with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })
})