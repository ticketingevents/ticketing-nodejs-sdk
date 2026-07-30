//Control execution order
import './event_listing'

import { 
	TickeTing, BadDataError, InvalidStateError, PermissionError,
	ResourceNotFoundError, UnsupportedOperationError, ResourceIndelibleError
} from '../../src'
import { CartModel, OrderModel, TierListingModel } from  '../../src/model'
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
  		price: 50,
      available_from: "2025-05-02T21:00:00",
      available_to: "2125-07-01T00:00:00",
  		capacity: 15,
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
		let cart = await this.customer.carts.create()
		cart.add(this.tier, 5)
		this.activeOrder = await cart.checkout()

		this.paymentDetails = {
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
		}
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
		await this.customer.delete()
	})

	describe('Create a shopping cart', function () {
		it('Should return a valid cart object', function () {
			return new Promise((resolve, reject) => {
				this.customer.carts.create().then((cart => {
					testCart = cart

					expect(cart).to.be.an.instanceof(CartModel)
					expect(cart.created).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
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
				testCart.add(this.tier, quantity).then(success => {
		      expect(success).to.be.true

					expect(testCart.total).to.equal(this.tier.price * quantity)
					
					expect(testCart.items.length).to.eq(1)
					if(testCart.items.length > 0){
						expect(testCart.items[0]).to.include({
							tier: this.tier,
							quantity: quantity,
							total: quantity * this.tier.price
						})
					}

					resolve(true)
				}).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a BadDataError if a non-positive integer quantity of tickets is added', function () {
			return expect(testCart.add(this.tier, -5))
			  .to.eventually.be.rejectedWith("The number of items to be added to the cart must be a positive integer.")
			  .and.be.an.instanceOf(BadDataError)
		})

		it('Should throw an UnsupportedOperationError if adding more tickets than the tier has available', function () {
			return expect(testCart.add(this.tier, 101))
			  .to.eventually.be.rejectedWith("Adding the specified quantity of this item would exceed the tier capacity.")
			  .and.be.an.instanceOf(UnsupportedOperationError)
		})
	})

	describe('Remove items from the shopping cart', function () {
		it('Should remove items from the shopping cart', function () {
			return new Promise((resolve, reject) => {
				let originalQuantity = testCart.items[0].quantity
				let quantity = 2

				testCart.remove(this.tier, quantity).then((success => {
		         expect(success).to.be.true

					expect(testCart.total).to.equal(this.tier.price * (originalQuantity - quantity))

					expect(testCart.items.length).to.eq(1)
					if(testCart.items.length > 0){
						expect(testCart.items[0]).to.include({
							tier: this.tier,
							quantity: (originalQuantity - quantity),
							total: (originalQuantity - quantity) * this.tier.price
						})
					}

					resolve(true)
				})).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a BadDataError if a non-positive integer quantity of tickets is removed', function () {
			return expect(testCart.remove(this.tier, 0))
			  .to.eventually.be.rejectedWith("The number of items to be removed from the cart must be a positive integer.")
			  .and.be.an.instanceOf(BadDataError)
		})

		it('Should throw an UnsupportedOperationError if removing more tickets than are present in the cart', function () {
			return expect(testCart.remove(this.tier, 51))
			  .to.eventually.be.rejectedWith("The cart contains fewer items than the quantity to be removed.")
			  .and.be.an.instanceOf(UnsupportedOperationError)
		})
	})

	describe('Set item quantity in shopping cart', function () {
		it('Should set item quantity in the shopping cart', function () {
			return new Promise((resolve, reject) => {
				let quantity = 7

				testCart.set(this.tier, quantity).then((success => {
		    	expect(success).to.be.true

					expect(testCart.total).to.equal(this.tier.price * quantity)
					
					expect(testCart.items.length).to.eq(1)
					if(testCart.items.length > 0){
						expect(testCart.items[0]).to.include({
							tier: this.tier,
							quantity: quantity,
							total: quantity * this.tier.price
						})
					}

					resolve(true)
				})).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a BadDataError if a non-positive integer quantity of tickets is set', function () {
			return expect(testCart.set(this.tier, -10))
			  .to.eventually.be.rejectedWith("The target item quantity must be a positive integer.")
			  .and.be.an.instanceOf(BadDataError)
		})

		it('Should throw an UnsupportedOperationError if the specified quantity would exceed tier capacity', function () {
			return expect(testCart.set(this.tier, 100))
			  .to.eventually.be.rejectedWith("Setting the item quantity to the specified value would exceed the tier capacity.")
			  .and.be.an.instanceOf(UnsupportedOperationError)
		})
	})

	describe('Checkout a shopping cart', function () {
		it('Should return a valid order object', function () {
			return new Promise((resolve, reject) => {
				testCart.checkout().then((order => {
					testOrder = order

					expect(order).to.be.an.instanceof(OrderModel)
					expect(order.number).to.match(/[0-9A-F]{12}/)
					expect(order.status).to.eq("pending")
					expect(order.placed).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(order.subtotal).to.equal(testCart.total)
					expect(order.customer).to.equal(this.customer)

					expect(order.items.length).to.eq(1)
          expect(order.items[0].quantity).to.eq(testCart.items[0].quantity)
          expect(order.items[0].tier).to.be.an.instanceof(TierListingModel)
          expect(order.items[0].tier.name).to.eq(testCart.items[0].tier.name)
          expect(order.items[0].tier.description).to.eq(testCart.items[0].tier.description)
          expect(order.items[0].tier.price).to.eq(testCart.items[0].tier.price)
          expect(order.items[0].tier.available_from).to.eq(testCart.items[0].tier.available_from)
          expect(order.items[0].tier.available_to).to.eq(testCart.items[0].tier.available_to)
          expect(order.items[0].tier.artwork).to.eq("")
          expect(order.items[0].tier.unit_size).to.eq(testCart.items[0].tier.unit_size)
          expect(order.items[0].tier.purchase_limit).to.eq(testCart.items[0].tier.purchase_limit)

          expect(order.items[0].tier.upgrades.length).to.eq(testCart.items[0].tier.upgrades.length)
          for(let i=0; i < order.items[0].tier.upgrades.length; i++){
              expect(order.items[0].tier.upgrades[i]).to.be.an.instanceOf(TierListingModel)
                  .and.to.have.property("uri", testCart.items[0].tier.upgrades[i].uri)
          }

          expect(order.payment.method.cardholder).to.eq("")
          expect(order.payment.method.card_type).to.eq("")
          expect(order.payment.method.card_digits).to.eq("")
          expect(order.payment.uri).to.eq("")
          expect(order.payment.status).to.eq("Pending")

					resolve(true)
				})).catch(error=>{
					reject(error)
				})
			})
		})

		it('Should throw a BadDataError if there is insufficient capacity to fulfil the order', function () {
			return expect(testCart.checkout(this.customer))
			  .to.eventually.be.rejectedWith("One or more of the specified items does not have sufficient capacity to fulfil the request.")
			  .and.be.an.instanceOf(BadDataError)
		})
	})

	describe('List customer orders', function () {
		it('Should return a collection of Order resources', function () {
			return expect(this.customer.orders.list(5)).to.eventually.all.be.instanceof(OrderModel)
		})

		it('Should contain the newly created order as its first resource', function () {
			return new Promise((resolve, reject) => {
				this.customer.orders.list().then(orders => {

					expect(orders[1]).to.be.an.instanceof(OrderModel)
					expect(orders[1].number).to.match(/[0-9A-F]{12}/)
					expect(orders[1].status).to.eq("pending")
					expect(orders[1].placed).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(orders[1].subtotal).to.equal(testCart.total)
					expect(orders[1].customer).to.equal(this.customer)

					expect(orders[1].items.length).to.eq(1)
          expect(orders[1].items[0].quantity).to.eq(testCart.items[0].quantity)
          expect(orders[1].items[0].tier).to.be.an.instanceof(TierListingModel)
          expect(orders[1].items[0].tier.name).to.eq(testCart.items[0].tier.name)
          expect(orders[1].items[0].tier.description).to.eq(testCart.items[0].tier.description)
          expect(orders[1].items[0].tier.price).to.eq(testCart.items[0].tier.price)
          expect(orders[1].items[0].tier.available_from).to.eq(testCart.items[0].tier.available_from)
          expect(orders[1].items[0].tier.available_to).to.eq(testCart.items[0].tier.available_to)
          expect(orders[1].items[0].tier.artwork).to.eq("")
          expect(orders[1].items[0].tier.unit_size).to.eq(testCart.items[0].tier.unit_size)
          expect(orders[1].items[0].tier.purchase_limit).to.eq(testCart.items[0].tier.purchase_limit)

          expect(orders[1].items[0].tier.upgrades.length).to.eq(testCart.items[0].tier.upgrades.length)
          for(let i=0; i < orders[1].items[0].tier.upgrades.length; i++){
              expect(orders[1].items[0].tier.upgrades[i]).to.be.an.instanceOf(TierListingModel)
                  .and.to.have.property("uri", testCart.items[0].tier.upgrades[i].uri)
          }

          expect(orders[1].payment.method.cardholder).to.eq("")
          expect(orders[1].payment.method.card_type).to.eq("")
          expect(orders[1].payment.method.card_digits).to.eq("")
          expect(orders[1].payment.uri).to.eq("")
          expect(orders[1].payment.status).to.eq("Pending")

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of orders matching the number filter', function () {
			return new Promise((resolve, reject) => {
				this.customer.orders.list(5).filter({number: testOrder.number}).then(orders => {
					expect(orders.length).to.be.least(1)

					for(let order of orders){
						expect(order.number).to.equal(testOrder.number)
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of orders matching the status filter', function () {
			return new Promise((resolve, reject) => {
				this.customer.orders.list(5).filter({status: "pending"}).then(orders => {
					expect(orders.length).to.be.least(1)

					for(let order of orders){
						expect(order.status).to.equal("pending")
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return orders sorted by creation date in ascending order', function () {
			return new Promise((resolve, reject) => {
				this.customer.orders.list(5).sort("date").then(orders => {
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
				this.customer.orders.find(testOrder.id).then(order => {
					expect(order).to.be.an.instanceof(OrderModel)
					expect(order.number).to.match(/[0-9A-F]{12}/)
					expect(order.status).to.eq("pending")
					expect(order.placed).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(order.subtotal).to.equal(testCart.total)
					expect(order.customer).to.equal(this.customer)

					expect(order.items.length).to.eq(1)
          expect(order.items[0].quantity).to.eq(testCart.items[0].quantity)
          expect(order.items[0].tier).to.be.an.instanceof(TierListingModel)
          expect(order.items[0].tier.name).to.eq(testCart.items[0].tier.name)
          expect(order.items[0].tier.description).to.eq(testCart.items[0].tier.description)
          expect(order.items[0].tier.price).to.eq(testCart.items[0].tier.price)
          expect(order.items[0].tier.available_from).to.eq(testCart.items[0].tier.available_from)
          expect(order.items[0].tier.available_to).to.eq(testCart.items[0].tier.available_to)
          expect(order.items[0].tier.artwork).to.eq("")
          expect(order.items[0].tier.unit_size).to.eq(testCart.items[0].tier.unit_size)
          expect(order.items[0].tier.purchase_limit).to.eq(testCart.items[0].tier.purchase_limit)

          expect(order.items[0].tier.upgrades.length).to.eq(testCart.items[0].tier.upgrades.length)
          for(let i=0; i < order.items[0].tier.upgrades.length; i++){
              expect(order.items[0].tier.upgrades[i]).to.be.an.instanceOf(TierListingModel)
                  .and.to.have.property("uri", testCart.items[0].tier.upgrades[i].uri)
          }

          expect(order.payment.method.cardholder).to.eq("")
          expect(order.payment.method.card_type).to.eq("")
          expect(order.payment.method.card_digits).to.eq("")
          expect(order.payment.uri).to.eq("")
          expect(order.payment.status).to.eq("Pending")

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should throw a ResourceNotFoundError when using a non-existant order number', function () {
			return expect(this.customer.orders.find(12345678901234))
				.to.eventually.be.rejectedWith("There is presently no order with the given URI.")
				.and.be.an.instanceOf(ResourceNotFoundError)
		})
	})

	describe('Camcel an order', function () {
		it('Should cancel the order', function () {
			return expect(testOrder.cancel()).to.eventually.be.true
		})

		it('Should persist order cancellation', function () {
			return expect(this.customer.orders.find(testOrder.id))
				.to.eventually.include({status: "cancelled"})
		})

		it('Should throw a ResourceIndelibleError if the order has already been cancelled', function () {
			return expect(testOrder.cancel())
			  .to.eventually.be.rejectedWith("A cancelled order cannot be cancelled.")
			  .and.be.an.instanceOf(ResourceIndelibleError)
		})
	})

	describe('Settle an order', function () {
		it('Should throw a BadDataError for missing or invalid payment details', function () {
			return expect(this.activeOrder.settle(this.paymentDetails))
				.to.eventually.be.rejectedWith("Your request payload is invalid. Please ensure you have included all required fields and values are well-formed.")
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
			return expect(this.customer.orders.find(this.activeOrder.id))
				.to.eventually.include({status: "fulfilled"})
		})

		it('Should throw an InvalidStateError if the order has already been settled', function () {
			return expect(this.activeOrder.settle(this.paymentDetails))
			  .to.eventually.be.rejectedWith( "You cannot settle a fulfilled order.")
			  .and.be.an.instanceOf(InvalidStateError)
		})
	})
})