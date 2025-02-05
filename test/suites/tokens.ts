//Control execution order
import './regions'

import { TickeTing, BadDataError, ResourceImmutableError, ResourceIndelibleError } from '../../src'
import { SectionModel, TokenModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api } from '../setup'

//Global token objects
let globalToken = null
let testToken = null

describe("Tokens", function(){

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

  describe('Issue admissions token', function () {
	it('Should return a valid token object', function () {
	  return new Promise((resolve, reject) => {
		this.testEvent.issue_token([this.testSection]).then((token => {
		  testToken = token

		  expect(token).to.be.an.instanceof(TokenModel)
		  expect(token.code).to.match(/[0-9A-Z]{8}/)
		  expect(token.global).to.equal(false)
		  expect(token.sections[0]).to.deep.eq(this.testSection)

		  resolve(true)
		})).catch(error=>{
		  reject(error)
		})
	  })
	})

	it('Should throw a BadDataError if required fields are missing', function () {
	  return expect(this.testEvent.issue_token([]))
	  .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: sections.")
	  .and.be.an.instanceOf(BadDataError)
	})
  })

  describe('List admissions tokens', function () {
	it('Should return a collection of Token resources', function () {
	  return expect(this.testEvent.tokens).eventually.to.all.be.instanceof(TokenModel)
	})

	it('Should contain the global token as its first resource', function () {
	  return new Promise((resolve, reject) => {
		this.testEvent.tokens.first().then(tokens => {
		  globalToken = tokens[0]
		  expect(globalToken).to.be.an.instanceof(TokenModel)
		  expect(globalToken.code).to.match(/[0-9A-Z]{8}/)
		  expect(globalToken.global).to.equal(true)
		  expect(globalToken.sections).to.deep.eq(this.testEvent.sections)

		  resolve(true)
		}).catch(error => {
		  reject(error)
		})
	  })
	})

	it('Should return a collection of tokens matching the global filter', function () {
	  return new Promise((resolve, reject) => {
		 this.testEvent.tokens.filter({global: false}).then(tokens => {
		  expect(tokens.length).to.be.at.least(1)

		  for(let token of tokens){
			expect(token.global).to.equal(false)
		  }

		  resolve(true)
		}).catch(error => {
		  reject(error)
		})
	  })
	})
  })

  describe('Update admissions token sections', function () {
	it('Should save the changes made to a token', function () {
		testToken.allow(this.secondSection)

		//Save changes
		return expect(testToken.save()).eventually.be.true
	})

	it('Should persist token changes', function () {
	  return new Promise((resolve, reject) => {
		this.testEvent.tokens.then(tokens => {
			expect(tokens[1].sections).to.include(this.secondSection)
			resolve(true)
		})
	  })
	})

	it('Should throw a BadDataError if required fields are missing', function () {
	  //Make invalid changes to the token
	  testToken.deny(this.testSection)
	  testToken.deny(this.secondSection)

	  return expect(testToken.save())
		.to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: sections.")
		.and.be.an.instanceOf(BadDataError)
	})

	it('Should throw a ResourceImmutableError when modifying the global token', function () {
	  //Make changes to the global token
	  globalToken.deny(this.testSection)

	  return expect(globalToken.save())
		.to.eventually.be.rejectedWith("The global admission token cannot be modified or invalidated.")
		.and.be.an.instanceOf(ResourceImmutableError)
	})
  })

  describe('Invalidate an admissions token', function () {
	it('Should invalidate the specified token', function () {
		return expect(testToken.delete()).to.eventually.be.true
	})

	it('Token should no longer be attached to event', function () {
	  return new Promise((resolve, reject) => {
		this.testEvent.tokens.then(tokens => {
		  expect(tokens.length).to.eq(1)
		  resolve(true)
		})
	  })
	})

	it('Should throw a ResourceIndelibleError when invalidating the global token', function () {
	  //Make changes to the global token
	  return expect(globalToken.delete())
		.to.eventually.be.rejectedWith("The global admission token cannot be modified or invalidated.")
		.and.be.an.instanceOf(ResourceIndelibleError)
	})
  })
})