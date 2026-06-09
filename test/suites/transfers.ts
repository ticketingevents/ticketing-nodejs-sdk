//Control execution order
import './orders'

import { 
	TickeTing, BadDataError, InvalidStateError, PermissionError,
	ResourceNotFoundError, UnsupportedOperationError, ResourceIndelibleError
} from '../../src'
import { ParcelModel, TransferModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api, unauthorised_sdk } from '../setup'

//Global token objects
let testParcel = null
let testTransfer = null

describe.skip("Transfers", function(){
  //Set hook timeout
  this.timeout(60000)

	before(async function(){
		//Create a sender
		this.sender = await ticketing.accounts.create({
      username: "transfer.sender"+Math.floor(Math.random() * 999999),
      password: "WuT4NGcl4n",
      email: "transfer.sender"+Math.floor(Math.random() * 999999)+"@usmc.gov",
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

		//Create a recipient
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

		//Place and fulful order order
		let cart = await ticketing.orders.start()
		cart.add(this.section, 10)
		this.order = await cart.checkout(this.sender)

    //Create a pending transfer
    let parcel = await ticketing.transfers.start()
    parcel.add(this.section, 5)

    let recipient = await ticketing.accounts.lookup({identification: this.recipient.email})
    this.transfer = await parcel.send(this.sender, recipient)
	})

	after(async function(){
		await this.tier.delete()
		await this.event.delete()
		await this.category.delete()
		await this.venue.delete()
		await this.region.delete()
		await this.host.delete()
		await this.recipient.delete()
		await this.sender.delete()
	})

	describe('Initiate a transfer', function () {
		it('Should return a valid parcel object', function () {
			return new Promise((resolve, reject) => {
				ticketing.transfers.start().then((parcel => {
					testParcel = parcel

					expect(parcel).to.be.an.instanceof(ParcelModel)
					expect(parcel.initiated).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(parcel.tickets).to.be.empty

					resolve(true)
				})).catch(error=>{
					reject(error)
				})
			})
		})
	})

	describe('Add tickets to a transfer', function () {
		it('Should add tickets to the parcel', function () {
			return new Promise((resolve, reject) => {
				let quantity = 5
				testParcel.add(this.section, quantity).then(success => {
		      		expect(success).to.be.true

					expect(testParcel.tickets.length).to.eq(1)
					if(testParcel.tickets.length > 0){
						expect(testParcel.tickets[0]).to.include({
							section: this.section,
							quantity: quantity
						})
					}

					resolve(true)
				}).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a BadDataError if a non-positive integer quantity of tickets is added', function () {
			return expect(testParcel.add(this.section, -5))
			  .to.eventually.be.rejectedWith("The number of tickets to be added to the parcel must be a positive integer.")
			  .and.be.an.instanceOf(BadDataError)
		})
	})

	describe('Remove tickets from a transfer', function () {
		it('Should remove tickets from the parcel', function () {
			return new Promise((resolve, reject) => {
				let originalQuantity = testParcel.tickets[0].quantity
				let quantity = 2

				testParcel.remove(this.section, quantity).then((success => {
		         	expect(success).to.be.true

					expect(testParcel.tickets.length).to.eq(1)
					if(testParcel.tickets.length > 0){
						expect(testParcel.tickets[0]).to.include({
							section: this.section,
							quantity: (originalQuantity - quantity)
						})
					}

					resolve(true)
				})).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a BadDataError if a non-positive integer quantity of tickets is removed', function () {
			return expect(testParcel.remove(this.section, 0))
			  .to.eventually.be.rejectedWith("The number of tickets to be removed from the parcel must be a positive integer.")
			  .and.be.an.instanceOf(BadDataError)
		})

		it('Should throw an UnsupportedOperationError if removing more tickets than are present in the cart', function () {
			return expect(testParcel.remove(this.section, 51))
			  .to.eventually.be.rejectedWith("The parcel contains fewer tickets than the quantity to be removed.")
			  .and.be.an.instanceOf(UnsupportedOperationError)
		})
	})

	describe('Set tickets to be transferred', function () {
		it('Should set item quantity in the parcel', function () {
			return new Promise((resolve, reject) => {
				let quantity = 5

				testParcel.set(this.section, quantity).then((success => {
		    		expect(success).to.be.true
					
					expect(testParcel.tickets.length).to.eq(1)
					if(testParcel.tickets.length > 0){
						expect(testParcel.tickets[0]).to.include({
							section: this.section,
							quantity: quantity
						})
					}

					resolve(true)
				})).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a BadDataError if a non-positive integer quantity of tickets is set', function () {
			return expect(testParcel.set(this.section, -10))
			  .to.eventually.be.rejectedWith("The ticket quantity must be a positive integer.")
			  .and.be.an.instanceOf(BadDataError)
		})
	})

	describe('Send a transfer', function () {
		it('Should return a valid transfer object', function () {
			return new Promise((resolve, reject) => {
				//Verify recipient data
				ticketing.accounts.lookup({identification: this.recipient.username}).then(recipient => {
					//Send transfer to verified recipient
					testParcel.send(this.sender, recipient).then((transfer => {
						testTransfer = transfer

						expect(transfer).to.be.an.instanceof(TransferModel)
						expect(transfer.status).to.eq("Pending")
						expect(transfer.initiated).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
						expect(transfer.sender).to.equal(this.sender)
						expect(transfer.recipient.number).to.equal(this.recipient.number)

						expect(transfer.tickets.length).to.eq(1)
						expect(transfer.tickets[0].event.uri).to.equal(this.event.uri)
						expect(transfer.tickets[0].section.name).to.equal(this.section.name)
						expect(transfer.tickets[0].quantity).to.eq(testParcel.tickets[0].quantity)

						resolve(true)
					})).catch(error=>{
						reject(error)
					})
				})
			})
		})

		it('Should throw a PermissionError if the authenticated user is unauthorised to initiate transfers on behalf of the sender', function () {
			return new Promise((resolve, reject) => {
				unauthorised_sdk.transfers.start().then(unauthorised_parcel => {
					unauthorised_parcel.add(this.section, 5)
					expect(unauthorised_parcel.send(this.sender, this.recipient))
					  .to.eventually.be.rejectedWith("The authenticated user is not permitted to initiate transfers on behalf of the sender.")
					  .and.be.an.instanceOf(PermissionError)

					resolve(true)
				})
			})
		})

		it('Should throw a BadDataError if the sender does not own sufficient tickets.', function () {
			return new Promise((resolve, reject) => {
				ticketing.accounts.lookup({identification: this.recipient.username}).then(recipient => {
					expect(testParcel.send(this.sender, recipient))
					  .to.eventually.be.rejectedWith("The sender does not hold sufficient itckets in their wallet to complete this transfer")
					  .and.be.an.instanceOf(BadDataError)
				})

				resolve(true)
			})
		})

		it('Should throw an InvalidStateError if the sender attempts to transfer tickets to themselves.', function () {
			return new Promise((resolve, reject) => {
				ticketing.accounts.lookup({identification: this.recipient.username}).then(recipient => {
					expect(testParcel.send(this.sender, this.sender))
					  .to.eventually.be.rejectedWith("The sender cannot transfer tickets to themselves.")
					  .and.be.an.instanceOf(InvalidStateError)
				})

				resolve(true)
			})
		})
	})

	describe('Fetch a transfer', function () {
		it('Should return the identified Transfer resource', function () {
			return new Promise((resolve, reject) => {
				ticketing.transfers.find(testTransfer.id).then(transfer => {
					expect(transfer).to.be.an.instanceof(TransferModel)
					expect(transfer.id).to.eq(testTransfer.id)
					expect(transfer.status).to.eq(testTransfer.status)
					expect(transfer.initiated).to.eq(testTransfer.initiated)
					expect(transfer.sender.number).to.equal(testTransfer.sender.number)
					expect(transfer.recipient.number).to.equal(testTransfer.recipient.number)

					expect(transfer.tickets.length).to.eq(testTransfer.tickets.length)
					for(let i = 0; i < transfer.tickets.length; i++){
						expect(transfer.tickets[i].event.uri).to.eq(testTransfer.tickets[i].event.uri)
						expect(transfer.tickets[i].section.uri).to.eq(testTransfer.tickets[i].section.uri)	
						expect(transfer.tickets[i].quantity).to.eq(testTransfer.tickets[i].quantity)
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should throw a ResourceNotFoundError when using a non-existant transfer id', function () {
			return expect(ticketing.transfers.find("17096551195817"))
				.to.eventually.be.rejectedWith("There is presently no resource with the given URI.")
				.and.be.an.instanceOf(ResourceNotFoundError)
		})

		it("Should throw a PermissionError if the authenticated user is unauthorised to retrieve this sender's transfers", function () {
			return expect(unauthorised_sdk.transfers.find(testTransfer.id))
			  .to.eventually.be.rejectedWith("This account is not permitted to manage transfers on behalf of the sender.")
			  .and.be.an.instanceOf(PermissionError)
		})
	})

	describe('Camcel a transfer', function () {
		it('Should cancel the transfer', function () {
			return expect(testTransfer.cancel()).to.eventually.be.true
		})

		it('Should persist transfer cancellation', function () {
			return expect(ticketing.transfers.find(testTransfer.id))
				.to.eventually.include({status: "Cancelled"})
		})

		it('Should throw an InvalidStateError if the transfer has already been cancelled', function () {
			return expect(testTransfer.cancel())
			  .to.eventually.be.rejectedWith( "A cancelled transfer cannot be cancelled.")
			  .and.be.an.instanceOf(InvalidStateError)
		})
	})

	describe('Claim a transfer', function () {
		it('Should throw an PermissionError if a transfer is claimed by someone other than its recipient', function () {
			return expect(this.transfer.claim())
			  .to.eventually.be.rejectedWith("Only a transfer's recipient can claim a transfer.")
			  .and.be.an.instanceOf(PermissionError)
		})

		it('Should complete the transfer', function () {
			return new Promise((resolve, reject) => {
				let recipient_sdk = new TickeTing({
				  apiKey: process.env.ADMINISTRATOR_KEY || '07b2f3b08810a4296ee19fc59dff48b0'
				})

				recipient_sdk.session.start({
					identification: this.recipient.username,
					password: "WuT4NGcl4n"
				})

				recipient_sdk.transfers.find(this.transfer.id).then(transfer => {
					this.transfer = transfer

					transfer.claim().then(success => {
						expect(success).to.be.true
						resolve(true)
					})
				})
			})
		})

		it('Should persist transfer claim', function () {
			return expect(ticketing.transfers.find(this.transfer.id))
				.to.eventually.include({status: "Claimed"})
		})

		it('Should throw an InvalidStateError if the transfer has already been claimed', function () {
			return expect(this.transfer.claim())
			  .to.eventually.be.rejectedWith("This transfer can no longer be claimed.")
			  .and.be.an.instanceOf(InvalidStateError)
		})
	})
})