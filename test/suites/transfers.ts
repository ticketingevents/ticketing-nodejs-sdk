//Control execution order
import './customer_wallet'

import { 
	TickeTing, BadDataError, InvalidStateError, PermissionError,
	ResourceNotFoundError, UnsupportedOperationError, ResourceIndelibleError
} from '../../src'
import { ParcelModel, TransferModel, AccountListingModel, TierListingModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api, unauthorised_sdk } from '../setup'

//Global token objects
let testParcel = null
let testTransfer = null

describe("Transfers", function(){
  //Set hook timeout
  this.timeout(60000)

	before(async function(){
		//Create a sender
		this.sender = await ticketing.accounts.create({
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

		//Create a recipient
		this.recipient = await ticketing.accounts.create({
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

  	//Create event tiers
  	this.tier = await this.host.tiers.create({
  		name: "Test tier "+Math.floor(Math.random() * 999999),
  		description: "Test admissions with this.",
  		price: 0,
      available_from: "2025-05-02T21:00:00",
      available_to: "2125-07-01T00:00:00",
  		capacity: 20,
      events: [{
        "event": this.event,
        "share": 100
      }]
  	})

  	//Publish event
    let submission = await this.event.submissions.create()
    await submission.approve("Event approved")
    await this.event.publish()

		//Place order for fulfillment tests
		let cart = await this.sender.carts.create()
		cart.add(this.tier, 15)
		this.activeOrder = await cart.checkout()

		//Place transfers for testing acceptance and rejection
		let parcel = await this.sender.parcels.create()
		await parcel.add(this.tier, 5)

		this.firstTransfer = await parcel.send(this.recipient)
		this.secondTransfer = await parcel.send(this.recipient)
	})

	after(async function(){
		if(this.activeOrder.status == "pending"){
			await this.activeOrder.cancel()
		}

		await this.tier.delete()
		await this.event.delete()
		await this.category.delete()
		await this.venue.delete()
		await this.region.delete()
		await this.host.delete()
		await this.recipient.delete()
		await this.sender.delete()
	})

	describe('Create a ticket parcel', function () {
		it('Should return a valid parcel object', function () {
			return new Promise((resolve, reject) => {
				this.sender.parcels.create().then((parcel => {
					testParcel = parcel

					expect(parcel).to.be.an.instanceof(ParcelModel)
					expect(parcel.created).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(parcel.tickets).to.be.empty

					resolve(true)
				})).catch(error=>{
					reject(error)
				})
			})
		})
	})

	describe('Add tickets to a parcel', function () {
		it('Should add tickets to the parcel', function () {
			return new Promise((resolve, reject) => {
				let quantity = 5
				testParcel.add(this.tier, quantity).then(success => {
		      expect(success).to.be.true
					
					expect(testParcel.tickets.length).to.eq(1)
					if(testParcel.tickets.length > 0){
						expect(testParcel.tickets[0]).to.include({
							tier: this.tier,
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
			return expect(testParcel.add(this.tier, -5))
			  .to.eventually.be.rejectedWith("The number of tickets to be added to the parcel must be a positive integer.")
			  .and.be.an.instanceOf(BadDataError)
		})

		it('Should throw an UnsupportedOperationError if adding more tickets than the customer has available', function () {
			return expect(testParcel.add(this.tier, 101))
			  .to.eventually.be.rejectedWith("The customer does not own sufficient tickets in this tier to add to the parcel.")
			  .and.be.an.instanceOf(UnsupportedOperationError)
		})
	})

	describe('Remove tickets from a parcel', function () {
		it('Should remove tickets from the parcel', function () {
			return new Promise((resolve, reject) => {
				let originalQuantity = testParcel.tickets[0].quantity
				let quantity = 2

				testParcel.remove(this.tier, quantity).then((success => {
		         expect(success).to.be.true

					expect(testParcel.tickets.length).to.eq(1)
					if(testParcel.tickets.length > 0){
						expect(testParcel.tickets[0]).to.include({
							tier: this.tier,
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
			return expect(testParcel.remove(this.tier, 0))
			  .to.eventually.be.rejectedWith("The number of tickets to be removed from the parcel must be a positive integer.")
			  .and.be.an.instanceOf(BadDataError)
		})

		it('Should throw an UnsupportedOperationError if removing more tickets than are present in the parcel', function () {
			return expect(testParcel.remove(this.tier, 51))
			  .to.eventually.be.rejectedWith("The parcel contains fewer tickets than the quantity to be removed.")
			  .and.be.an.instanceOf(UnsupportedOperationError)
		})
	})

	describe('Set number of tickets in a parcel', function () {
		it('Should set the ticket quantity in the parcel', function () {
			return new Promise((resolve, reject) => {
				let quantity = 5

				testParcel.set(this.tier, quantity).then((success => {
		    	expect(success).to.be.true
					
					expect(testParcel.tickets.length).to.eq(1)
					if(testParcel.tickets.length > 0){
						expect(testParcel.tickets[0]).to.include({
							tier: this.tier,
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
			return expect(testParcel.set(this.tier, -10))
			  .to.eventually.be.rejectedWith("The target ticket quantity must be a positive integer.")
			  .and.be.an.instanceOf(BadDataError)
		})

		it('Should throw an UnsupportedOperationError if the specified quantity would exceed the number of tickets owned', function () {
			return expect(testParcel.set(this.tier, 100))
			  .to.eventually.be.rejectedWith("The customer does not own sufficient tickets to set the quantity to the specified value.")
			  .and.be.an.instanceOf(UnsupportedOperationError)
		})
	})

	describe('Initiate a transfer', function () {
		it('Should return a valid transfer object', function () {
			return new Promise((resolve, reject) => {
				testParcel.send(this.recipient).then((transfer => {
					testTransfer = transfer

					expect(transfer).to.be.an.instanceof(TransferModel)
					expect(transfer.status).to.eq("pending")
					expect(transfer.initiated).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(transfer.completed).to.eq("0000-00-00T00:00:00")

          expect(transfer.sender).to.be.an.instanceof(AccountListingModel)
          expect(transfer.sender.username).to.equal(this.sender.username)
          expect(transfer.sender.firstName).to.equal(this.sender.firstName)
          expect(transfer.sender.lastName).to.equal(this.sender.lastName)
          expect(transfer.sender.title).to.equal(this.sender.title)

          expect(transfer.recipient).to.be.an.instanceof(AccountListingModel)
          expect(transfer.recipient.username).to.equal(this.recipient.username)
          expect(transfer.recipient.firstName).to.equal(this.recipient.firstName)
          expect(transfer.recipient.lastName).to.equal(this.recipient.lastName)
          expect(transfer.recipient.title).to.equal(this.recipient.title)

					expect(transfer.tickets.length).to.eq(1)
          expect(transfer.tickets[0].quantity).to.eq(testParcel.tickets[0].quantity)
          expect(transfer.tickets[0].tier).to.be.an.instanceof(TierListingModel)
          expect(transfer.tickets[0].tier.name).to.eq(testParcel.tickets[0].tier.name)
          expect(transfer.tickets[0].tier.description).to.eq(testParcel.tickets[0].tier.description)
          expect(transfer.tickets[0].tier.price).to.eq(testParcel.tickets[0].tier.price)
          expect(transfer.tickets[0].tier.available_from).to.eq(testParcel.tickets[0].tier.available_from)
          expect(transfer.tickets[0].tier.available_to).to.eq(testParcel.tickets[0].tier.available_to)
          expect(transfer.tickets[0].tier.artwork).to.eq("")
          expect(transfer.tickets[0].tier.unit_size).to.eq(testParcel.tickets[0].tier.unit_size)
          expect(transfer.tickets[0].tier.purchase_limit).to.eq(testParcel.tickets[0].tier.purchase_limit)
          expect(transfer.tickets[0].tier.transferrable).to.eq(testParcel.tickets[0].tier.transferrable)

					resolve(true)
				})).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a BadDataError if the customer holds insufficient tickets to complete the transfer', function () {
			return expect(testParcel.send(this.recipient))
			  .to.eventually.be.rejectedWith("The sender does not hold sufficient itckets in their wallet to complete this transfer.")
			  .and.be.an.instanceOf(BadDataError)
		})
	})

	describe('List outgoing customer transfers', function () {
		it('Should return a collection of Transfer resources', function () {
			return expect(this.sender.transfers.outgoing(5)).to.eventually.all.be.instanceof(TransferModel)
		})

		it('Should contain the newly initiated transfer as its last resource', function () {
			return new Promise((resolve, reject) => {
				this.sender.transfers.outgoing().then(transfers => {
					let transfer = transfers[transfers.length-1]

					expect(transfer).to.be.an.instanceof(TransferModel)
					expect(transfer.status).to.eq("pending")
					expect(transfer.initiated).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(transfer.completed).to.eq("0000-00-00T00:00:00")

          expect(transfer.sender).to.be.an.instanceof(AccountListingModel)
          expect(transfer.sender.username).to.equal(this.sender.username)
          expect(transfer.sender.firstName).to.equal(this.sender.firstName)
          expect(transfer.sender.lastName).to.equal(this.sender.lastName)
          expect(transfer.sender.title).to.equal(this.sender.title)

          expect(transfer.recipient).to.be.an.instanceof(AccountListingModel)
          expect(transfer.recipient.username).to.equal(this.recipient.username)
          expect(transfer.recipient.firstName).to.equal(this.recipient.firstName)
          expect(transfer.recipient.lastName).to.equal(this.recipient.lastName)
          expect(transfer.recipient.title).to.equal(this.recipient.title)

					expect(transfer.tickets.length).to.eq(1)
          expect(transfer.tickets[0].quantity).to.eq(testParcel.tickets[0].quantity)
          expect(transfer.tickets[0].tier).to.be.an.instanceof(TierListingModel)
          expect(transfer.tickets[0].tier.name).to.eq(testParcel.tickets[0].tier.name)
          expect(transfer.tickets[0].tier.description).to.eq(testParcel.tickets[0].tier.description)
          expect(transfer.tickets[0].tier.price).to.eq(testParcel.tickets[0].tier.price)
          expect(transfer.tickets[0].tier.available_from).to.eq(testParcel.tickets[0].tier.available_from)
          expect(transfer.tickets[0].tier.available_to).to.eq(testParcel.tickets[0].tier.available_to)
          expect(transfer.tickets[0].tier.artwork).to.eq("")
          expect(transfer.tickets[0].tier.unit_size).to.eq(testParcel.tickets[0].tier.unit_size)
          expect(transfer.tickets[0].tier.purchase_limit).to.eq(testParcel.tickets[0].tier.purchase_limit)
          expect(transfer.tickets[0].tier.transferrable).to.eq(testParcel.tickets[0].tier.transferrable)

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of transfers matching the status filter', function () {
			return new Promise((resolve, reject) => {
				this.sender.transfers.outgoing(5).filter({status: "pending"}).then(transfers => {
					expect(transfers.length).to.be.least(1)

					for(let transfer of transfers){
						expect(transfer.status).to.equal("pending")
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})
	})

	describe('List incoming customer transfers', function () {
		it('Should return a collection of Transfer resources', function () {
			return expect(this.recipient.transfers.incoming(5)).to.eventually.all.be.instanceof(TransferModel)
		})

		it('Should contain the newly initiated transfer as its last resource', function () {
			return new Promise((resolve, reject) => {
				this.recipient.transfers.incoming().then(transfers => {
					let transfer = transfers[transfers.length-1]

					expect(transfer).to.be.an.instanceof(TransferModel)
					expect(transfer.status).to.eq("pending")
					expect(transfer.initiated).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(transfer.completed).to.eq("0000-00-00T00:00:00")

          expect(transfer.sender).to.be.an.instanceof(AccountListingModel)
          expect(transfer.sender.username).to.equal(this.sender.username)
          expect(transfer.sender.firstName).to.equal(this.sender.firstName)
          expect(transfer.sender.lastName).to.equal(this.sender.lastName)
          expect(transfer.sender.title).to.equal(this.sender.title)

          expect(transfer.recipient).to.be.an.instanceof(AccountListingModel)
          expect(transfer.recipient.username).to.equal(this.recipient.username)
          expect(transfer.recipient.firstName).to.equal(this.recipient.firstName)
          expect(transfer.recipient.lastName).to.equal(this.recipient.lastName)
          expect(transfer.recipient.title).to.equal(this.recipient.title)

					expect(transfer.tickets.length).to.eq(1)
          expect(transfer.tickets[0].quantity).to.eq(testParcel.tickets[0].quantity)
          expect(transfer.tickets[0].tier).to.be.an.instanceof(TierListingModel)
          expect(transfer.tickets[0].tier.name).to.eq(testParcel.tickets[0].tier.name)
          expect(transfer.tickets[0].tier.description).to.eq(testParcel.tickets[0].tier.description)
          expect(transfer.tickets[0].tier.price).to.eq(testParcel.tickets[0].tier.price)
          expect(transfer.tickets[0].tier.available_from).to.eq(testParcel.tickets[0].tier.available_from)
          expect(transfer.tickets[0].tier.available_to).to.eq(testParcel.tickets[0].tier.available_to)
          expect(transfer.tickets[0].tier.artwork).to.eq("")
          expect(transfer.tickets[0].tier.unit_size).to.eq(testParcel.tickets[0].tier.unit_size)
          expect(transfer.tickets[0].tier.purchase_limit).to.eq(testParcel.tickets[0].tier.purchase_limit)
          expect(transfer.tickets[0].tier.transferrable).to.eq(testParcel.tickets[0].tier.transferrable)

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of transfers matching the status filter', function () {
			return new Promise((resolve, reject) => {
				this.recipient.transfers.incoming(5).filter({status: "pending"}).then(transfers => {
					expect(transfers.length).to.be.least(1)

					for(let transfer of transfers){
						expect(transfer.status).to.equal("pending")
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})
	})

	describe('Fetch a transfer', function () {
		it('Should return the identified Transfer resource', function () {
			return new Promise((resolve, reject) => {
				this.sender.transfers.find(testTransfer.id).then(transfer => {
					expect(transfer).to.be.an.instanceof(TransferModel)
					expect(transfer.status).to.eq("pending")
					expect(transfer.initiated).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(transfer.completed).to.eq("0000-00-00T00:00:00")

          expect(transfer.sender).to.be.an.instanceof(AccountListingModel)
          expect(transfer.sender.username).to.equal(this.sender.username)
          expect(transfer.sender.firstName).to.equal(this.sender.firstName)
          expect(transfer.sender.lastName).to.equal(this.sender.lastName)
          expect(transfer.sender.title).to.equal(this.sender.title)

          expect(transfer.recipient).to.be.an.instanceof(AccountListingModel)
          expect(transfer.recipient.username).to.equal(this.recipient.username)
          expect(transfer.recipient.firstName).to.equal(this.recipient.firstName)
          expect(transfer.recipient.lastName).to.equal(this.recipient.lastName)
          expect(transfer.recipient.title).to.equal(this.recipient.title)

					expect(transfer.tickets.length).to.eq(1)
          expect(transfer.tickets[0].quantity).to.eq(testParcel.tickets[0].quantity)
          expect(transfer.tickets[0].tier).to.be.an.instanceof(TierListingModel)
          expect(transfer.tickets[0].tier.name).to.eq(testParcel.tickets[0].tier.name)
          expect(transfer.tickets[0].tier.description).to.eq(testParcel.tickets[0].tier.description)
          expect(transfer.tickets[0].tier.price).to.eq(testParcel.tickets[0].tier.price)
          expect(transfer.tickets[0].tier.available_from).to.eq(testParcel.tickets[0].tier.available_from)
          expect(transfer.tickets[0].tier.available_to).to.eq(testParcel.tickets[0].tier.available_to)
          expect(transfer.tickets[0].tier.artwork).to.eq("")
          expect(transfer.tickets[0].tier.unit_size).to.eq(testParcel.tickets[0].tier.unit_size)
          expect(transfer.tickets[0].tier.purchase_limit).to.eq(testParcel.tickets[0].tier.purchase_limit)
          expect(transfer.tickets[0].tier.transferrable).to.eq(testParcel.tickets[0].tier.transferrable)

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should throw a ResourceNotFoundError when using a non-existant transfer number', function () {
			return expect(this.sender.transfers.find(12345678901234))
				.to.eventually.be.rejectedWith("There is presently no transfer with the given URI.")
				.and.be.an.instanceOf(ResourceNotFoundError)
		})
	})

	describe('Camcel a transfer', function () {
		it('Should cancel the transfer', function () {
			return expect(testTransfer.cancel()).to.eventually.be.true
		})

		it('Should persist transfer cancellation', function () {
			return expect(this.sender.transfers.find(testTransfer.id))
				.to.eventually.include({status: "cancelled"})
		})

		it('Should throw a InvalidStateError if the transfer has already been cancelled', function () {
			return expect(testTransfer.cancel())
			  .to.eventually.be.rejectedWith("You cannot cancel a cancelled transfer.")
			  .and.be.an.instanceOf(InvalidStateError)
		})
	})

	describe('Accept a transfer', function () {
		it('Should accept the transfer', function () {
			return new Promise((resolve, reject) => {
				this.recipient.transfers.incoming().then(transfers => {
					transfers[0].accept().then(accepted => {
						expect(accepted).to.be.true

						resolve(true)
					}).catch(error=>{
						reject(error)
					})
				}).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should persist transfer acceptance', function () {
			return new Promise((resolve, reject) => {
				this.recipient.transfers.incoming().then(transfers => {
					expect(transfers[0]).to.include({status: "accepted"})

					resolve(true)
				}).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a InvalidStateError if the transfer has already been accepted', function () {
			return new Promise((resolve, reject) => {
				this.recipient.transfers.incoming().then(transfers => {
					expect(transfers[0].accept())
					  .to.eventually.be.rejectedWith("You cannot accept a accepted transfer.")
					  .and.be.an.instanceOf(InvalidStateError)

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})
	})

	describe('Reject a transfer', function () {
		it('Should reject the transfer', function () {
			return new Promise((resolve, reject) => {
				this.recipient.transfers.incoming().then(transfers => {
					transfers[1].reject().then(rejected => {
						expect(rejected).to.be.true

						resolve(true)
					}).catch(error=>{
						reject(error)
					})
				}).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should persist transfer rejection', function () {
			return new Promise((resolve, reject) => {
				this.recipient.transfers.incoming().then(transfers => {
					expect(transfers[1]).to.include({status: "rejected"})

					resolve(true)
				}).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a InvalidStateError if the transfer has already been rejected', function () {
			return new Promise((resolve, reject) => {
				this.recipient.transfers.incoming().then(transfers => {
					expect(transfers[0].reject())
					  .to.eventually.be.rejectedWith("You cannot reject a rejected transfer.")
					  .and.be.an.instanceOf(InvalidStateError)

					resolve(true)
				}).catch(error=>{
					reject(error)
				})
			})
		})
	})
})