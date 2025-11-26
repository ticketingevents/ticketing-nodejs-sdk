//Control execution order
import './events'

import { 
	TickeTing, BadDataError, InvalidStateError, PermissionError,
	ResourceNotFoundError, UnsupportedOperationError, ResourceIndelibleError
} from '../../src'
import { CartModel, OrderModel, SectionModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api, unauthorised_sdk } from '../setup'

//Global token objects
let testCart = null
let testOrder = null

describe("Orders", function(){
  //Set hook timeout
  this.timeout(60000)

	before(async function(){
		//Create a customer
		this.customer = await ticketing.accounts.create({
			  username: "mothers.milk",
			  password: "WuT4NGcl4n",
			  email: "marvin.milk@usmc.gov",
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
		  basePrice: 50,
		  salesStart: (new Date()).toISOString(),
		  salesEnd: "9999-12-31T23:59:59.999Z",
		  capacity: 15
		})).data

		sectionData.self = `${this.event.uri}${sectionData.self}`
		this.section = new SectionModel(sectionData, api)
		this.event.sections.push(this.section)

		//Place order for fulfillment tests
		let cart = await ticketing.orders.start()
		cart.add(this.section, 5)
		this.activeOrder = await cart.checkout(this.customer)

		this.paymentDetails = {
			cvv: 123,
			expiryDate: "12/30",
			name: "Marvin M. Milk",
			email: "marvin.milk@usmc.gov",
			phone: "+1 (268) 555 0123",
			address1: "Hermitage Rd.",
			address2: "Jennings New Extension",
			city: "Jennings",
			district: "Saint Mary'\''s",
			country: "Antigua and Barbuda"
		}
	})

	after(async function(){
		if(this.activeOrder.status != "Refunded"){
			await this.activeOrder.cancel()
		}

		await this.section.delete()
		await this.event.delete()
		await this.category.delete()
		await this.venue.delete()
		await this.region.delete()
		await this.host.delete()
		await this.customer.delete()
	})

	describe('Create a shopping cart', function () {
		it('Should return a valid cart object', function () {
			return new Promise((resolve, reject) => {
				ticketing.orders.start().then((cart => {
					testCart = cart

					expect(cart).to.be.an.instanceof(CartModel)
					expect(cart.created).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(cart.subtotal).to.equal(0)
					expect(cart.fees).to.equal(0)
					expect(cart.total).to.equal(0)
					expect(cart.items).to.be.empty

					resolve(true)
				})).catch(error=>{
					reject(error)
				})
			})
		})
	})

	describe('Add items to cart', function () {
		it('Should add items to the shopping cart', function () {
			return new Promise((resolve, reject) => {
				let quantity = 5
				testCart.add(this.section, quantity).then(success => {
		      expect(success).to.be.true

					expect(testCart.subtotal).to.equal(this.section.price.base * quantity)
					expect(testCart.fees).to.equal(this.section.fees * quantity)
					expect(testCart.total).to.equal(testCart.subtotal + testCart.fees)
					
					expect(testCart.items.length).to.eq(1)
					if(testCart.items.length > 0){
						expect(testCart.items[0]).to.include({
							section: this.section,
							quantity: quantity,
							total: quantity * this.section.price.base
						})
					}

					resolve(true)
				}).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a BadDataError if a non-positive integer quantity of tickets is added', function () {
			return expect(testCart.add(this.section, -5))
			  .to.eventually.be.rejectedWith("The number of items to be added to the cart must be a positive integer.")
			  .and.be.an.instanceOf(BadDataError)
		})

		it('Should throw an UnsupportedOperationError if adding more tickets than the section has available', function () {
			return expect(testCart.add(this.section, 101))
			  .to.eventually.be.rejectedWith("Adding the specified quantity of this item would exceed the section capacity.")
			  .and.be.an.instanceOf(UnsupportedOperationError)
		})
	})

	describe('Remove items from the shopping cart', function () {
		it('Should remove items from the shopping cart', function () {
			return new Promise((resolve, reject) => {
				let originalQuantity = testCart.items[0].quantity
				let quantity = 2

				testCart.remove(this.section, quantity).then((success => {
		         expect(success).to.be.true

					expect(testCart.subtotal).to.equal(this.section.price.base * (originalQuantity - quantity))
					expect(testCart.fees).to.equal(this.section.fees * (originalQuantity - quantity))
					expect(testCart.total).to.equal(testCart.subtotal + testCart.fees)

					expect(testCart.items.length).to.eq(1)
					if(testCart.items.length > 0){
						expect(testCart.items[0]).to.include({
							section: this.section,
							quantity: (originalQuantity - quantity),
							total: (originalQuantity - quantity) * this.section.price.base
						})
					}

					resolve(true)
				})).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a BadDataError if a non-positive integer quantity of tickets is removed', function () {
			return expect(testCart.remove(this.section, 0))
			  .to.eventually.be.rejectedWith("The number of items to be removed from the cart must be a positive integer.")
			  .and.be.an.instanceOf(BadDataError)
		})

		it('Should throw an UnsupportedOperationError if removing more tickets than are present in the cart', function () {
			return expect(testCart.remove(this.section, 51))
			  .to.eventually.be.rejectedWith("The cart contains fewer items than the quantity to be removed.")
			  .and.be.an.instanceOf(UnsupportedOperationError)
		})
	})

	describe('Set item quantity in shopping cart', function () {
		it('Should set item quantity in the shopping cart', function () {
			return new Promise((resolve, reject) => {
				let quantity = 7

				testCart.set(this.section, quantity).then((success => {
		    	expect(success).to.be.true

					expect(testCart.subtotal).to.equal(this.section.price.base * quantity)
					expect(testCart.fees).to.equal(0.99 * quantity)
					expect(testCart.total).to.equal(testCart.subtotal + testCart.fees)
					
					expect(testCart.items.length).to.eq(1)
					if(testCart.items.length > 0){
						expect(testCart.items[0]).to.include({
							section: this.section,
							quantity: quantity,
							total: quantity * this.section.price.base
						})
					}

					resolve(true)
				})).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a BadDataError if a non-positive integer quantity of tickets is set', function () {
			return expect(testCart.set(this.section, -10))
			  .to.eventually.be.rejectedWith("The target item quantity must be a positive integer.")
			  .and.be.an.instanceOf(BadDataError)
		})

		it('Should throw an UnsupportedOperationError if the specified quantity would exceed section capacity', function () {
			return expect(testCart.set(this.section, 100))
			  .to.eventually.be.rejectedWith("Setting the item quantity to the specified value would exceed the section capacity.")
			  .and.be.an.instanceOf(UnsupportedOperationError)
		})
	})

	describe('Checkout a shopping cart', function () {
		it('Should return a valid order object', function () {
			return new Promise((resolve, reject) => {
				testCart.checkout(this.customer).then((order => {
					testOrder = order

					expect(order).to.be.an.instanceof(OrderModel)
					expect(order.number).to.match(/[0-9A-F]{12}/)
					expect(order.status).to.eq("Placed")
					expect(order.placed).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(order.subtotal).to.equal(testCart.subtotal)
					expect(order.fees).to.equal(testCart.fees)
					expect(order.total).to.equal(testCart.total)
					expect(order.customer).to.equal(this.customer)

					expect(order.items.length).to.eq(1)
					expect(order.items[0].number).to.match(/[a-z0-9]{32}/)
					expect(order.items[0].name).to.equal(`${this.event.title}: ${this.section.name}`)
					expect(order.items[0].quantity).to.eq(testCart.items[0].quantity)
					expect(order.items[0].price).to.eq(this.section.price.base)

					resolve(true)
				})).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a PermissionError if the authenticated user is unauthorised to manage orders for this customer', function () {
			return new Promise((resolve, reject) => {
				unauthorised_sdk.orders.start().then(unauthorised_cart => {
					unauthorised_cart.add(this.section, 5)
					expect(unauthorised_cart.checkout(this.customer))
					  .to.eventually.be.rejectedWith("The authenticated user is not permtited to manage orders for this account.")
					  .and.be.an.instanceOf(PermissionError)

					resolve(true)
				})
			})
		})

		it('Should throw a BadDataError if there is insufficient capacity to fulfil the order', function () {
			return expect(testCart.checkout(this.customer))
			  .to.eventually.be.rejectedWith("An order for the requested tickets could not be placed at this time. Please try again.")
			  .and.be.an.instanceOf(BadDataError)
		})
	})

	describe('List all orders', function () {
		it('Should return a collection of Order resources', function () {
			return expect(ticketing.orders.list(5)).to.eventually.all.be.instanceof(OrderModel)
		})

		it('Should contain the newly created order as its first resource', function () {
			return new Promise((resolve, reject) => {
				ticketing.orders.list(1).sort("date", false).first().then(orders => {
					expect(orders[0]).to.be.an.instanceof(OrderModel)
					expect(orders[0].number).to.match(/[0-9A-F]{12}/)
					expect(orders[0].status).to.eq("Placed")
					expect(orders[0].placed).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(orders[0].subtotal).to.equal(testCart.subtotal)
					expect(orders[0].fees).to.equal(testCart.fees)
					expect(orders[0].total).to.equal(testCart.total)
					expect(orders[0].customer.number).to.equal(this.customer.number)

					expect(orders[0].items.length).to.eq(1)
					expect(orders[0].items[0].number).to.match(/[a-z0-9]{32}/)
					expect(orders[0].items[0].name).to.equal(`${this.event.title}: ${this.section.name}`)
					expect(orders[0].items[0].quantity).to.eq(testCart.items[0].quantity)
					expect(orders[0].items[0].price).to.eq(this.section.price.base)

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of orders matching the customer filter', function () {
			return new Promise((resolve, reject) => {
				ticketing.orders.list(5).filter({customer: this.customer}).then(orders => {
					expect(orders.length).to.be.least(1)

					for(let order of orders){
						expect(order.customer.uri).to.equal(this.customer.uri)
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of orders matching the status filter', function () {
			return new Promise((resolve, reject) => {
				ticketing.orders.list(5).filter({status: "Placed"}).then(orders => {
					expect(orders.length).to.be.least(1)

					for(let order of orders){
						expect(order.status).to.equal("Placed")
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return orders sorted by creation date in ascending order', function () {
			return new Promise((resolve, reject) => {
				ticketing.orders.list(5).sort("date").then(orders => {
					expect(orders).to.have.lengthOf.at.least(1)
						.and.to.be.ascendingBy("placed")

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})
	})

	describe('Fetch an order', function () {
		it('Should return the identified Order resource', function () {
			return new Promise((resolve, reject) => {
				ticketing.orders.find(testOrder.number).then(order => {
					expect(order).to.be.an.instanceof(OrderModel)
					expect(order.number).to.eq(testOrder.number)
					expect(order.status).to.eq(testOrder.status)
					expect(order.placed).to.eq(testOrder.placed)
					expect(order.subtotal).to.equal(testOrder.subtotal)
					expect(order.fees).to.equal(testOrder.fees)
					expect(order.total).to.equal(testOrder.total)
					expect(order.customer.number).to.equal(testOrder.customer.number)

					expect(order.items.length).to.eq(testOrder.items.length)
					for(let i = 0; i < order.items.length; i++){
						expect(order.items[i]).to.include(testOrder.items[i])	
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should throw a ResourceNotFoundError when using a non-existant order number', function () {
			return expect(ticketing.orders.find("AB12345"))
				.to.eventually.be.rejectedWith("There is presently no resource with the given URI.")
				.and.be.an.instanceOf(ResourceNotFoundError)
		})

		it('Should throw a PermissionError if the authenticated user is unauthorised to manage orders for this customer', function () {
			return expect(unauthorised_sdk.orders.find(testOrder.number))
			  .to.eventually.be.rejectedWith("This account is not permitted to manage orders on behalf of the ordering customer.")
			  .and.be.an.instanceOf(PermissionError)
		})
	})

	describe('Camcel an order', function () {
		it('Should cancel the order', function () {
			return expect(testOrder.cancel()).to.eventually.be.true
		})

		it('Should persist order cancellation', function () {
			return expect(ticketing.orders.find(testOrder.number))
				.to.eventually.include({status: "Cancelled"})
		})

		it('Should throw a ResourceIndelibleError if the order has already been cancelled', function () {
			return expect(testOrder.cancel())
			  .to.eventually.be.rejectedWith( "A cancelled order cannot be cancelled.")
			  .and.be.an.instanceOf(ResourceIndelibleError)
		})
	})

	describe('Settle an order', function () {
		it('Should throw a BadDataError for missing or invalid payment details', function () {
			return expect(this.activeOrder.settle(this.paymentDetails))
				.to.eventually.be.rejectedWith( "The following arguments are required, but have not been supplied: number.")
				.and.be.an.instanceOf(BadDataError)
		})

		it('Should return false if payment cannot be processed', function () {
			this.paymentDetails.number = "5555555555555555"
			return expect(this.activeOrder.settle(this.paymentDetails)).to.eventually.be.false
		})

		it('Should settle the order if payment cam be processed', function () {
			this.paymentDetails.number = "4111111111111111"
			return expect(this.activeOrder.settle(this.paymentDetails)).to.eventually.be.true
		})

		it('Should persist order fulfillment', function () {
			return expect(ticketing.orders.find(this.activeOrder.number))
				.to.eventually.include({status: "Fulfilled"})
		})

		it('Should throw an InvalidStateError if the order has already been settled', function () {
			return expect(this.activeOrder.settle(this.paymentDetails))
			  .to.eventually.be.rejectedWith( "You cannot pay for a Fulfilled order.")
			  .and.be.an.instanceOf(InvalidStateError)
		})
	})

	describe('Refund an order', function () {
		it('Should throw a BadDataError for missing or invalid refund reason', function () {
			return expect(this.activeOrder.refund(""))
				.to.eventually.be.rejectedWith( "The following arguments are required, but have not been supplied: reason.")
				.and.be.an.instanceOf(BadDataError)
		})

		it('Should refund the order', function () {
			return expect(this.activeOrder.refund("Host requested customer refund.")).to.eventually.be.true
		})

		it('Should persist order refund', function () {
			return expect(ticketing.orders.find(this.activeOrder.number))
				.to.eventually.include({status: "Refunded"})
		})

		it('Should throw an InvalidStateError if the order has already been refunded', function () {
			return expect(this.activeOrder.refund("Host requested customer refund."))
			  .to.eventually.be.rejectedWith( "You cannot refund a refunded order.")
			  .and.be.an.instanceOf(InvalidStateError)
		})
	})
})