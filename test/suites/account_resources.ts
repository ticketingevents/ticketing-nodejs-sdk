//Control execution order
import './accounts'

import { TickeTing, BadDataError } from '../../src'
import { HostModel, CategoryModel, VenueModel, EventModel, SectionModel, WalletTicketModel } from  '../../src/model'
import { expect, ticketing, api, public_ticketing } from '../setup'

// Global account object
let testAccount = null

describe("Account Resources", function(){

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

  	//Create test event
  	this.event = await ticketing.events.create({
  		host: this.host,
  		title: "Test Event "+Math.floor(Math.random() * 999999),
  		description: "Event Description",
  		type: "Standard",
  		public: true,
  		category: this.category,
  		subcategory: "Event Subcategory",
  		venue: this.venue,
  		start: (new Date()).toISOString(),
  		end: "9999-12-31T23:59:59.999Z"
  	})

  	//Create event sections
  	let sectionData = (await api.post(`${this.event.uri}/sections`, {
  		name: "Test Section "+Math.floor(Math.random() * 999999),
  		description: "Test admissions with this.",
  		basePrice: 0,
  		salesStart: (new Date()).toISOString(),
  		salesEnd: "9999-12-31T23:59:59.999Z",
  		capacity: 15
  	})).data

  	sectionData.self = `${this.event.uri}${sectionData.self}`
  	this.section = new SectionModel(sectionData, api)

  	//Place order for fulfillment tests
  	let cart = await ticketing.orders.start()
  	cart.add(this.section, 5)
  	this.order = await cart.checkout(this.customer)

  	//Make new account an administrator of the test host
  	await api.post(`${this.host.uri}/administrators`, {
  		"account": this.customer.number
  	})
  })

  after(async function(){
    await this.order.refund("Test")
  	await this.section.delete()
  	await this.event.delete()
  	await this.category.delete()
  	await this.venue.delete()
  	await this.region.delete()
    await this.host.delete()
	 await this.customer.delete()
  })

  describe('List event itinerary', function () {
    it('Should return a collection of Event resources', function () {
      return expect(this.customer.itinerary).eventually.to.all.be.instanceof(EventModel)
    })

    it('Should contain the newly created event as its first resource', function () {
      return new Promise((resolve, reject) => {
        this.customer.itinerary.first().then(events => {
          expect(events[0]).to.be.an.instanceof(EventModel)
          expect(events[0].title).to.equal(this.event.title)
          expect(events[0].description).to.equal(this.event.description)
          expect(events[0].type).to.equal(this.event.type)
          expect(events[0].public).to.equal(this.event.public)
          expect(events[0].category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.event.category.uri)
          expect(events[0].subcategory).to.equal(this.event.subcategory)
          expect(events[0].start).to.equal(this.event.start)
          expect(events[0].disclaimer).to.equal(this.event.disclaimer)
          expect(events[0].status).to.equal(this.event.status)
          expect(events[0].published).to.equal(this.event.published)

          expect(events[0].venue).to.be.an.instanceof(VenueModel)
            .and.to.have.property("uri", this.event.venue.uri)

          expect(events[0].host).to.be.an.instanceof(HostModel)
            .and.to.have.property("uri", this.event.host.uri)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of events matching the active filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.itinerary.filter({active: true}).then(events => {
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
        this.customer.itinerary.sort("alphabetical").then(events => {
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
        this.customer.itinerary.sort("published", false).then(events => {
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
        this.customer.itinerary.sort("popularity").then(events => {
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
        this.customer.itinerary.sort("start", false).then(events => {
          expect(events).to.have.lengthOf.at.least(1)
            .and.to.be.descendingBy("start")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('List ticket wallet', function () {
	it('Should return a collection of Ticket resources', function () {
	  return expect(this.customer.wallet).eventually.to.all.be.instanceof(WalletTicketModel)
	})

	it('Should contain valid Ticket resources', function () {
	  return new Promise((resolve, reject) => {
		this.customer.wallet.then(tickets => {
		  let sample = tickets[Math.floor(Math.random()*tickets.length)]
		  expect(sample).to.be.an.instanceof(WalletTicketModel)
		  expect(sample.serial).to.match(/[0-9A-Z]{6}\-[0-9A-Z]{12}/)
		  expect(sample.status).to.eq("Issued")
		  expect(sample.section.uri).to.eq(this.section.uri)
		  expect(sample.issued).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\+00:00/)
		  expect(sample.redeemed).to.eq("N/A")

		  resolve(true)
		}).catch(error => {
		  reject(error)
		})
	  })
	})

    it('Should return a collection of tickets matching the event filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.wallet.filter({event: this.event}).then(tickets => {
          expect(tickets.length).to.be.least(1)

          for(let ticket of tickets){
            expect(ticket.section.uri).to.eq(this.section.uri)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of tickets matching the section filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.wallet.filter({section: this.section}).then(tickets => {
          expect(tickets.length).to.be.least(1)

          for(let ticket of tickets){
            expect(ticket.section.uri).to.eq(this.section.uri)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of tickets matching the serial filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.wallet.filter({serial: "TES"}).then(tickets => {
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
        this.customer.wallet.filter({status: "Issued"}).then(tickets => {
          expect(tickets.length).to.be.least(1)

          for(let ticket of tickets){
            expect(ticket.status).to.eq("Issued")
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('List managed hosts', function () {
    it('Should return a collection of Host resources', function () {
      return expect(this.customer.hosts).eventually.to.all.be.instanceof(HostModel)
    })

    it('Should contain the test host', function () {
      return new Promise((resolve, reject) => {
        this.customer.hosts.then(hosts => {
          expect(hosts[0])
            .to.be.an.instanceof(HostModel)
            .and.to.deep.include(this.host.serialise())

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })
})