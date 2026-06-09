//Control execution order
import './transfers'

import { TickeTing, BadDataError } from '../../src'
import { HostModel, CategoryModel, VenueModel, EventRevisionModel,
          TicketModel, TransferModel } from  '../../src/model'
import { expect, ticketing, api, public_ticketing } from '../setup'

// Global account object
let testAccount = null

describe.skip("Account Resources", function(){

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

    //Create a transfer recipient
    this.recipient = await ticketing.accounts.create({
          username: "transfer.recipient"+Math.floor(Math.random() * 999999),
          password: "WuT4NGcl4n",
          email: "transfer.recipient"+Math.floor(Math.random() * 999999)+"@usmc.gov",
          firstName: "Transfer",
          lastName: "Recipient",
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
  	this.event = await this.host.events.create({
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

    //Create event tiers
    this.tier = await this.host.tiers.create({
      name: "Test Section "+Math.floor(Math.random() * 999999),
      description: "Test admissions with this.",
      price: 0,
      available_from: (new Date()).toISOString(),
      available_to: "9999-12-31T23:59:59.999Z",
      capacity: 15,
      events: [{
        "event": this.event,
        "share": 100
      }]
    })

  	//Place order for fulfillment tests
  	let cart = await ticketing.orders.start()
  	cart.add(this.section, 5)
  	this.order = await cart.checkout(this.customer)
    this.secondOrder = await cart.checkout(this.recipient)

    //Create incoming and outgoing transfers for history tests
    let parcel = await ticketing.transfers.start()
    parcel.add(this.section, 3)

    let customer = await ticketing.accounts.lookup({identification: this.customer.username})
    let recipient = await ticketing.accounts.lookup({identification: this.recipient.username})

    this.transfer = await parcel.send(this.customer, recipient)
    this.secondTransfer = await parcel.send(this.recipient, customer)

  	//Make new account an administrator of the test host
  	await api.post(`${this.host.uri}/administrators`, {
  		"account": this.customer.number
  	})
  })

  after(async function(){
    await this.secondTransfer.cancel()
    await this.transfer.cancel()
    await this.secondOrder.refund("Test")
    await this.order.refund("Test")
    await this.tier.delete()
  	await this.event.delete()
  	await this.category.delete()
  	await this.venue.delete()
  	await this.region.delete()
    await this.host.delete()
    await this.recipient.delete()
    await this.customer.delete()
  })

  describe('List event itinerary', function () {
    it('Should return a collection of Event resources', function () {
      return expect(this.customer.itinerary(25)).eventually.to.all.be.instanceof(EventRevisionModel)
    })

    it('Should contain the newly created event as its first resource', function () {
      return new Promise((resolve, reject) => {
        this.customer.itinerary(25).first().then(events => {
          expect(events[0]).to.be.an.instanceof(EventRevisionModel)
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
        this.customer.itinerary(25).filter({active: true}).then(events => {
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
        this.customer.itinerary(25).sort("alphabetical").then(events => {
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
        this.customer.itinerary(25).sort("published", false).then(events => {
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
        this.customer.itinerary(25).sort("popularity").then(events => {
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
        this.customer.itinerary(25).sort("start", false).then(events => {
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
      return expect(this.customer.wallet(25)).eventually.to.all.be.an.instanceof(TicketModel)
  	})

  	it('Should contain valid Ticket resources', function () {
  	  return new Promise((resolve, reject) => {
    		this.customer.wallet(25).then(tickets => {
    		  let sample = tickets[Math.floor(Math.random()*tickets.length)]
          expect(sample).to.be.an.instanceof(TicketModel)
    		  expect(sample.serial).to.match(/[0-9A-Z]{6}\-[0-9A-Z]{12}/)
    		  expect(sample.status).to.be.oneOf(["Issued", "Pending"])
    		  expect(sample.section.uri).to.eq(this.section.uri)
    		  expect(sample.issued).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\+00:00/)
    		  expect(sample.redeemed).to.eq("N/A")
          expect(sample.owner).to.eq(`${this.customer.firstName} ${this.customer.lastName} (${this.customer.username})`)

    		  resolve(true)
    		}).catch(error => {
    		  reject(error)
    		})
  	  })
  	})

    it('Should return a collection of tickets matching the event filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.wallet(25).filter({event: this.event}).then(tickets => {
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
        this.customer.wallet(25).filter({section: this.section}).then(tickets => {
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
        this.customer.wallet(25).filter({serial: "TES"}).then(tickets => {
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
        this.customer.wallet(25).filter({status: "Issued"}).then(tickets => {
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

  describe('Retrieve incoming transfer history', function () {
    it('Should return a collection of Transfer resources', function () {
      return expect(this.customer.inbox).eventually.to.all.be.an.instanceof(TransferModel)
    })

    it('Should contain valid Transfer resources', function () {
      return new Promise((resolve, reject) => {
        this.customer.inbox.then(transfers => {
          let sample = transfers[Math.floor(Math.random()*transfers.length)]
          expect(sample).to.be.an.instanceof(TransferModel)
          expect(sample.status).to.eq("Pending")
          expect(sample.initiated).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
          expect(sample.sender).to.eq(`${this.recipient.firstName} ${this.recipient.lastName} (${this.recipient.username})`)
          expect(sample.recipient).to.eq(`${this.customer.firstName} ${this.customer.lastName} (${this.customer.username})`)

          expect(sample.tickets.length).to.eq(1)
          expect(sample.tickets[0].event.uri).to.equal(this.event.uri)
          expect(sample.tickets[0].section.name).to.equal(this.section.name)
          expect(sample.tickets[0].quantity).to.eq(3)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of transfers matching the status filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.inbox.filter({status: "Pending"}).then(transfers => {
          expect(transfers.length).to.be.least(1)

          for(let transfer of transfers){
            expect(transfer.status).to.eq("Pending")
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Retrieve outgoing transfer history', function () {
    it('Should return a collection of Transfer resources', function () {
      return expect(this.customer.outbox).eventually.to.all.be.an.instanceof(TransferModel)
    })

    it('Should contain valid Transfer resources', function () {
      return new Promise((resolve, reject) => {
        this.customer.outbox.then(transfers => {
          let sample = transfers[Math.floor(Math.random()*transfers.length)]
          expect(sample).to.be.an.instanceof(TransferModel)
          expect(sample.status).to.eq("Pending")
          expect(sample.initiated).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
          expect(sample.recipient).to.eq(`${this.recipient.firstName} ${this.recipient.lastName} (${this.recipient.username})`)
          expect(sample.sender).to.eq(`${this.customer.firstName} ${this.customer.lastName} (${this.customer.username})`)

          expect(sample.tickets.length).to.eq(1)
          expect(sample.tickets[0].event.uri).to.equal(this.event.uri)
          expect(sample.tickets[0].section.name).to.equal(this.section.name)
          expect(sample.tickets[0].quantity).to.eq(3)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of transfers matching the status filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.outbox.filter({status: "Pending"}).then(transfers => {
          expect(transfers.length).to.be.least(1)

          for(let transfer of transfers){
            expect(transfer.status).to.eq("Pending")
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })
})