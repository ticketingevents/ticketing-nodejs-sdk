//Control execution order
import './orders'

import { TickeTing, BadDataError } from '../../src'
import { HostModel, CategoryModel, VenueModel, EventListingModel, TicketModel } from  '../../src/model'
import { expect, ticketing, api, public_ticketing } from '../setup'

// Global account object
let testAccount = null

describe("Customer Wallet", function(){

  //Set hook timeout
  this.timeout(60000)

  before(async function(){
  	//Create a customer
  	this.customer = await ticketing.accounts.create({
  		username: "mothers.milk"+Math.floor(Math.random() * 999999),
  		password: "WuT4NGcl4n",
  		email: "marvin.milk"+Math.floor(Math.random() * 999999)+"@usmc.gov",
  		firstName: "Marvin",
  		lastName: "Milk",
  		title: "Mr",
  		dateOfBirth: "1974-09-14",
  		phone: "+1 (268) 555 0123",
  		country: "Antigua and Barbuda",
  		firstAddressLine: "Jennings New Extension",
  		secondAddressLine: "",
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
      subcategories: ["Event Subcategory "+Math.floor(Math.random() * 999999),]
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

  	//Create test event
    this.event = await this.host.events.create({
      title: "Test Event "+Math.floor(Math.random() * 999999),
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category,
      subcategory: this.category.subcategories[0],
      start: "2025-05-02T21:00:00",
      end: "2125-07-01T00:00:00",
      venue: this.venue,
      banner: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==",
      thumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q=="
    })

    //Create second event
    this.secondEvent = await this.host.events.create({
      title: "Test Event "+Math.floor(Math.random() * 999999),
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category,
      subcategory: this.category.subcategories[0],
      start: "2025-05-02T21:00:00",
      end: "2125-07-01T00:00:00",
      venue: this.venue,
      banner: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==",
      thumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q=="
    })

    //Publish events
    let submission = await this.secondEvent.submissions.create()
    await submission.approve("Event approved")
    await this.secondEvent.publish()

    submission = await this.event.submissions.create()
    await submission.approve("Event approved")
    await this.event.publish()

    //Create event tiers
    this.tier = await this.host.tiers.create({
      name: "Test tier "+Math.floor(Math.random() * 999999),
      description: "Test admissions with this.",
      price: 0,
      available_from: "2025-05-02T21:00:00",
      available_to: "2125-07-01T00:00:00",
      capacity: 15,
      events: [{
        "event": this.event,
        "share": 100
      }]
    })

    //Create second tier
    this.secondTier = await this.host.tiers.create({
      name: "Test tier "+Math.floor(Math.random() * 999999),
      description: "Test admissions with this.",
      price: 0,
      available_from: "2025-05-02T21:00:00",
      available_to: "2125-07-01T00:00:00",
      capacity: 15,
      events: [{
        "event": this.secondEvent,
        "share": 100
      }]
    })

    //Place and fulfil first order
    let cart = await this.customer.carts.create()
    cart.add(this.tier, 5)
    this.order = await cart.checkout()

    //Place and fulfil second order
    cart = await this.customer.carts.create()
    cart.add(this.secondTier, 5)
    this.secondOrder = await cart.checkout()
  })

  after(async function(){
    await this.secondTier.delete()
    await this.secondEvent.delete()
    await this.tier.delete()
  	await this.event.delete()
  	await this.category.delete()
  	await this.venue.delete()
  	await this.region.delete()
    await this.host.delete()
    await this.customer.delete()
  })

  describe('Retrieve event itinerary', function () {
    it('Should return a collection of Event resources', function () {
      return expect(this.customer.itinerary.list(25)).eventually.to.all.be.instanceof(EventListingModel)
    })

    it('Should contain the newly created event as its first resource', function () {
      return new Promise((resolve, reject) => {
        this.customer.itinerary.list(25).first().then(events => {
          expect(events.length).to.be.at.least(1)

          expect(events[0]).to.be.an.instanceof(EventListingModel)
          expect(events[0].uri).to.equal(`/events/${this.event.id}`)
          expect(events[0].title).to.equal(this.event.title)
          expect(events[0].description).to.equal(this.event.description)
          expect(events[0].start).to.equal(this.event.start)
          expect(events[0].end).to.equal(this.event.end)
          expect(events[0].host).to.be.an.instanceOf(HostModel).
            and.to.have.property("uri", this.host.uri)
          expect(events[0].venue).to.be.an.instanceOf(VenueModel).
            and.to.have.property("uri", this.venue.uri)
          expect(events[0].category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.category.uri)
          expect(events[0].subcategory).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.category.subcategories[0].uri)
          expect(events[0].disclaimer).to.equal(this.event.disclaimer)
          expect(events[0].tags).to.eql(this.event.tags)
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

    it('Should return a collection of events matching the active filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.itinerary.list(25).filter({active: true}).then(events => {
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

    it('Should return events sorted by title in ascending order', function () {
      return new Promise((resolve, reject) => {
        this.customer.itinerary.list(25).sort("alphabetical").then(events => {
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
        this.customer.itinerary.list(25).sort("published", false).then(events => {
          expect(events).to.have.lengthOf.at.least(1)
            .and.to.be.descendingBy("published")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it.skip('Should return events sorted by popularity in ascending order', function () {
      return new Promise((resolve, reject) => {
        this.customer.itinerary.list(25).sort("popularity").then(events => {
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
        this.customer.itinerary.list(25).sort("start", false).then(events => {
          expect(events).to.have.lengthOf.at.least(1)
            .and.to.be.descendingBy("start")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Retrieve customer tickets', function () {
  	it('Should return a collection of Ticket resources', function () {
      return expect(this.customer.wallet.list(25)).eventually.to.all.be.an.instanceof(TicketModel)
  	})

  	it('Should contain valid Ticket resources', function () {
  	  return new Promise((resolve, reject) => {
    		this.customer.wallet.list(25).then(tickets => {
    		  let sample = tickets[Math.floor(Math.random()*tickets.length)]
          expect(sample).to.be.an.instanceof(TicketModel)
    		  expect(sample.serial).to.match(/[0-9A-Z]{6}\-[0-9A-Z]{12}/)
    		  expect(sample.status).to.be.oneOf(["issued", "unclaimed", "held", "redeemed"])
    		  expect(sample.tier.uri).to.oneOf([this.tier.uri, this.secondTier.uri])
    		  expect(sample.issued).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}/)
    		  expect(sample.redeemed).to.eq("0000-00-00T00:00:00")

    		  resolve(true)
    		}).catch(error => {
    		  reject(error)
    		})
  	  })
  	})

    it('Should return a collection of tickets matching the event filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.wallet.list(25).filter({event: this.secondEvent}).then(tickets => {
          expect(tickets.length).to.be.least(1)

          for(let ticket of tickets){
            expect(ticket.tier.uri).to.eq(this.secondTier.uri)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of tickets matching the tier filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.wallet.list(25).filter({tier: this.tier}).then(tickets => {
          expect(tickets.length).to.be.least(1)

          for(let ticket of tickets){
            expect(ticket.tier.uri).to.eq(this.tier.uri)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of tickets matching the serial filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.wallet.list(25).filter({serial: "TES"}).then(tickets => {
          expect(tickets.length).to.be.least(1)

          for(let ticket of tickets){
            expect(ticket.serial).to.match(/^TES/)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of tickets matching the status filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.wallet.list(25).filter({status: "issued"}).then(tickets => {
          expect(tickets.length).to.be.least(1)

          for(let ticket of tickets){
            expect(ticket.status).to.eq("issued")
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })
})