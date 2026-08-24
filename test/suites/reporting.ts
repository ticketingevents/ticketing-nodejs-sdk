//Control execution order
import './account_resources'

import { 
	TickeTing, BadDataError, InvalidStateError, ResourceImmutableError,
	ResourceIndelibleError, PageAccessError, UnauthorisedError
} from '../../src'
import {
	SaleModel, StatisticsModel, EventListingModel, TierModel, AccountModel
} from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api } from '../setup'

describe("Event Reporting", function(){
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

		//Place order and leave in pending state
		let cart = await this.customer.carts.create()
		cart.add(this.tier, 5)
		this.order = await cart.checkout()

		//Place order and fulfil
		cart = await this.customer.carts.create()
		cart.add(this.tier, 5)
		this.secondOrder = await cart.checkout()
		await this.secondOrder.settle({
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

	after(async function(){
		await this.order.cancel()
		await this.tier.delete()
		await this.event.delete()
		await this.category.delete()
		await this.venue.delete()
		await this.region.delete()
		await this.host.delete()
		await this.customer.delete()
	})

	describe('List host sales', function () {
		it('Should return a collection of Sale resources', function () {
			return expect(this.host.sales.list()).eventually.to.all.be.instanceof(SaleModel)
		})

		it('Should contain the newly created sale as its first resource', function () {
			return new Promise((resolve, reject) => {
				this.host.sales.list().then(sales => {
					expect(sales[0]).to.be.an.instanceof(SaleModel)
					expect(sales[0].recorded)
						.to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(sales[0].order).to.eq(this.order.number)
					expect(sales[0].event).to.have.property("uri", this.event.uri)
					expect(sales[0].tier).to.have.property("uri", this.tier.uri)
					expect(sales[0].customer).to.have.property("uri", this.customer.uri)
					expect(sales[0].quantity).to.eq(this.order.items[0].quantity)
					expect(sales[0].total).to.eq(this.order.subtotal)
					expect(sales[0].status).to.eq("pending")

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of sales matching the after filter', function () {
			return new Promise((resolve, reject) => {
				let cutoff = new Date("2026-08-03T00:00")

				this.host.sales.list().filter({after: cutoff}).then(sales => {
					expect(sales).to.have.lengthOf.at.least(1)

					for(let sale of sales){
						expect(new Date(sale.recorded)).to.be.above(cutoff)
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of sales matching the before filter', function () {
			let cutoff = new Date("2026-08-03T00:00")

			return expect(this.host.sales.list().filter({before: cutoff}))
				.to.eventually.be.rejectedWith("The specified page does not exist for the given records per page.")
				.and.be.an.instanceOf(PageAccessError)
		})

		it('Should return a collection of sales matching the event filter', function () {
			return new Promise((resolve, reject) => {
				this.host.sales.list().filter({event: this.event}).then(sales => {
					for(let sale of sales){
						expect(sale.event.uri).to.eq(this.event.uri)
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of sales matching the tier filter', function () {
			return new Promise((resolve, reject) => {
				this.host.sales.list().filter({tier: this.tier}).then(sales => {
					for(let sale of sales){
						expect(sale.tier.uri).to.eq(this.tier.uri)
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of sales matching the number filter', function () {
			return new Promise((resolve, reject) => {
				this.host.sales.list().filter({number: this.order.number}).then(sales => {
					for(let sale of sales){
						expect(sale.order).to.eq(this.order.number)
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of sales matching the customer filter', function () {
			return new Promise((resolve, reject) => {
				this.host.sales.list().filter({customer: this.customer}).then(sales => {
					for(let sale of sales){
						expect(sale.customer.uri).to.eq(this.customer.uri)
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of sales matching the status filter', function () {
			return new Promise((resolve, reject) => {
				this.host.sales.list().filter({status: "pending"}).then(sales => {
					for(let sale of sales){
						expect(sale.status).to.eq("pending")
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

	    it('Should return sales sorted by recorded in ascending order', function () {
	      return new Promise((resolve, reject) => {
	        this.host.sales.list().sort("recorded").then(sales => {
	          expect(sales).to.be.ascendingBy("recorded")

	          resolve(true)
	        }).catch(error => {
	          reject(error)
	        })
	      })
	    })

	    it('Should return sales sorted by sale total in descending order', function () {
	      return new Promise((resolve, reject) => {
	        this.host.sales.list().sort("total", false).then(sales => {
	          expect(sales).to.be.descendingBy("total")

	          resolve(true)
	        }).catch(error => {
	          reject(error)
	        })
	      })
	    })
	})

	describe('Fetch host statistics', function () {
		it('Should return the relevant Statistics resource', function () {
			return new Promise((resolve, reject) => {
				this.host.statistics({
					after: "2026-07-01T00:00:00",
					before: "2126-08-01T00:00:00",
					interval: "month" 
				}).then(statistics => {
					expect(statistics).to.be.an.instanceof(StatisticsModel)
					expect(statistics.start).to.deep.equal(new Date("2026-07-01T00:00:00"))
					expect(statistics.end).to.deep.equal(new Date("2126-08-01T00:00:00"))
					expect(statistics.gross_sales).to.eq(this.secondOrder.subtotal)
					expect(statistics.tickets_sold).to.eq(this.secondOrder.items[0].quantity)

					expect(statistics.breakdown[0]).to.be.an.instanceof(StatisticsModel)
					expect(statistics.breakdown[0].start).to.be.null
					expect(statistics.breakdown[0].end).to.be.null
					expect(statistics.breakdown[0].interval).to.eq((new Date()).toLocaleString('en-US', { month: 'long', year: 'numeric' }))
					expect(statistics.breakdown[0].gross_sales).to.eq(this.secondOrder.subtotal)
					expect(statistics.breakdown[0].tickets_sold).to.eq(this.secondOrder.items[0].quantity)

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})
	})

	describe('List event sales', function () {
		it('Should return a collection of Sale resources', function () {
			return expect(this.event.sales.list()).eventually.to.all.be.instanceof(SaleModel)
		})

		it('Should contain the newly created sale as its first resource', function () {
			return new Promise((resolve, reject) => {
				this.event.sales.list().then(sales => {
					expect(sales[0]).to.be.an.instanceof(SaleModel)
					expect(sales[0].recorded)
						.to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}/)
					expect(sales[0].order).to.eq(this.order.number)
					expect(sales[0].event).to.have.property("uri", this.event.uri)
					expect(sales[0].tier).to.have.property("uri", this.tier.uri)
					expect(sales[0].customer).to.have.property("uri", this.customer.uri)
					expect(sales[0].quantity).to.eq(this.order.items[0].quantity)
					expect(sales[0].total).to.eq(this.order.subtotal)
					expect(sales[0].status).to.eq("pending")

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of sales matching the after filter', function () {
			return new Promise((resolve, reject) => {
				let cutoff = new Date("2026-08-03T00:00")

				this.event.sales.list().filter({after: cutoff}).then(sales => {
					expect(sales).to.have.lengthOf.at.least(1)

					for(let sale of sales){
						expect(new Date(sale.recorded)).to.be.above(cutoff)
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of sales matching the before filter', function () {
			let cutoff = new Date("2026-08-03T00:00")

			return expect(this.event.sales.list().filter({before: cutoff}))
				.to.eventually.be.rejectedWith("The specified page does not exist for the given records per page.")
				.and.be.an.instanceOf(PageAccessError)
		})

		it('Should return a collection of sales matching the tier filter', function () {
			return new Promise((resolve, reject) => {
				this.event.sales.list().filter({tier: this.tier}).then(sales => {
					for(let sale of sales){
						expect(sale.tier.uri).to.eq(this.tier.uri)
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of sales matching the number filter', function () {
			return new Promise((resolve, reject) => {
				this.event.sales.list().filter({number: this.order.number}).then(sales => {
					for(let sale of sales){
						expect(sale.order).to.eq(this.order.number)
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of sales matching the customer filter', function () {
			return new Promise((resolve, reject) => {
				this.event.sales.list().filter({customer: this.customer}).then(sales => {
					for(let sale of sales){
						expect(sale.customer.uri).to.eq(this.customer.uri)
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

		it('Should return a collection of sales matching the status filter', function () {
			return new Promise((resolve, reject) => {
				this.event.sales.list().filter({status: "pending"}).then(sales => {
					for(let sale of sales){
						expect(sale.status).to.eq("pending")
					}

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})

	    it('Should return sales sorted by recorded in ascending order', function () {
	      return new Promise((resolve, reject) => {
	        this.event.sales.list().sort("recorded").then(sales => {
	          expect(sales).to.be.ascendingBy("recorded")

	          resolve(true)
	        }).catch(error => {
	          reject(error)
	        })
	      })
	    })

	    it('Should return sales sorted by sale total in descending order', function () {
	      return new Promise((resolve, reject) => {
	        this.event.sales.list().sort("total", false).then(sales => {
	          expect(sales).to.be.descendingBy("total")

	          resolve(true)
	        }).catch(error => {
	          reject(error)
	        })
	      })
		})
	})

	describe('Fetch event statistics', function () {
		it('Should return the relevant Statistics resource', function () {
			return new Promise((resolve, reject) => {
				this.event.statistics({
					after: "2026-07-01T00:00:00",
					before: "2126-08-01T00:00:00",
					interval: "month" 
				}).then(statistics => {
					expect(statistics).to.be.an.instanceof(StatisticsModel)
					expect(statistics.start).to.deep.equal(new Date("2026-07-01T00:00:00"))
					expect(statistics.end).to.deep.equal(new Date("2126-08-01T00:00:00"))
					expect(statistics.gross_sales).to.eq(this.secondOrder.subtotal)
					expect(statistics.tickets_sold).to.eq(this.secondOrder.items[0].quantity)

					expect(statistics.breakdown[0]).to.be.an.instanceof(StatisticsModel)
					expect(statistics.breakdown[0].start).to.be.null
					expect(statistics.breakdown[0].end).to.be.null
					expect(statistics.breakdown[0].interval).to.eq((new Date()).toLocaleString('en-US', { month: 'long', year: 'numeric' }))
					expect(statistics.breakdown[0].gross_sales).to.eq(this.secondOrder.subtotal)
					expect(statistics.breakdown[0].tickets_sold).to.eq(this.secondOrder.items[0].quantity)

					resolve(true)
				}).catch(error => {
					reject(error)
				})
			})
		})
	})
})