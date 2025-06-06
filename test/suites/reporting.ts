//Control execution order
import './events'

import { 
	TickeTing, BadDataError, InvalidStateError, ResourceImmutableError,
	ResourceIndelibleError, UnauthorisedError
} from '../../src'
import { EventStatisticsModel, HostStatisticsModel, SectionModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api } from '../setup'

describe("Reporting", function(){
	//Set hook timeout
	this.timeout(15000)

	before(async function(){
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

		//An event to test duplication
		this.testEvent = await ticketing.events.create({
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
		let sectionData = (await api.post(`${this.testEvent.uri}/sections`, {
			name: "Test Section "+Math.floor(Math.random() * 999999),
			description: "Test admissions with this.",
			basePrice: 0,
			salesStart: (new Date()).toISOString(),
			salesEnd: "9999-12-31T23:59:59.999Z",
			capacity: 100
		})).data

		sectionData.self = `${this.testEvent.uri}${sectionData.self}`
		this.testSection = new SectionModel(sectionData, api)
		this.testEvent.sections.push(this.testSection)

		sectionData = (await api.post(`${this.testEvent.uri}/sections`, {
			name: "Test Section "+Math.floor(Math.random() * 999999),
			description: "Test admissions with this.",
			basePrice: 0,
			salesStart: (new Date()).toISOString(),
			salesEnd: "9999-12-31T23:59:59.999Z",
			capacity: 100
		})).data

		sectionData.self = `${this.testEvent.uri}${sectionData.self}`
		this.secondSection = new SectionModel(sectionData, api)
		this.testEvent.sections.push(this.secondSection)

		//Place first ticket order
		await api.post("/orders", {
			items: {
				[this.testSection.uri]: 5
			}
		})

		//Place second ticket order
		await api.post("/orders", {
			items: {
				[this.secondSection.uri]: 5,
			}
		})
	})

	after(async function(){
		await this.testSection.delete()
		await this.secondSection.delete()
		await this.testEvent.delete()
		await this.category.delete()
		await this.host.delete()
		await this.venue.delete()
		await this.region.delete()
	})

	describe('View host statistics', function () {
		it('Should return a valid statistics object', function () {
	  		return new Promise((resolve, reject) => {
				this.host.statistics().then((statistics => {
		  			expect(statistics).to.be.an.instanceof(HostStatisticsModel)
		  			expect(statistics.events).to.be.a("number").and.to.eq(1)
					expect(statistics.orders).to.be.a("number").and.to.eq(2)
					expect(statistics.revenue).to.be.a("number").and.to.eq(0)
					expect(statistics.tickets).to.be.a("number").and.to.eq(10)

		  			resolve(true)
				})).catch(error=>{
		  			reject(error)
				})
	  		})
		})
	})

	describe('View event statistics', function () {
		it('Should return a valid statistics object', function () {
	  		return new Promise((resolve, reject) => {
				this.testEvent.statistics().then((statistics => {
		  			expect(statistics).to.be.an.instanceof(EventStatisticsModel)
		  			expect(statistics.capacity).to.be.a("number").and.to.eq(200)
					expect(statistics.orders).to.be.a("number").and.to.eq(2)
					expect(statistics.revenue).to.be.a("number").and.to.eq(0)
					expect(statistics.tickets).to.be.a("number").and.to.eq(10)

		  			resolve(true)
				})).catch(error=>{
		  			reject(error)
				})
	  		})
		})
	})
})