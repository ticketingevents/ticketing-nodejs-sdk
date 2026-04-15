//Control execution order
import './transfers'

import { TickeTing, BadDataError } from '../../src'
import { HostModel, CategoryModel, VenueModel, EventRevisionModel, SectionModel,
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
  	await this.section.delete()
  	await this.event.delete()
  	await this.category.delete()
  	await this.venue.delete()
  	await this.region.delete()
    await this.host.delete()
    await this.recipient.delete()
    await this.customer.delete()
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