//Control execution order
import './events'

import { 
	TickeTing, BadDataError, InvalidStateError, ResourceImmutableError,
	ResourceIndelibleError, UnauthorisedError
} from '../../src'
import { AdmissionModel, SectionModel, TicketModel, TokenModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api } from '../setup'

//Global token objects
let globalToken = null
let testToken = null
let testSession = null
let testTicket = null
let testSerials = []
let testTimestamp = ""

describe("Admissions", function(){

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
    setTimeout(async () => {
    	testTimestamp = (new Date()).toISOString()
	    await api.post("/orders", {
	        items: {
	        	[this.secondSection.uri]: 5,
	        }
	    })
    }, 5000)
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

  describe('Start admission session', function () {
		it('Should return a valid admission session object', function () {
		  return new Promise((resolve, reject) => {
				ticketing.session.admission(testToken.code, "Name", "Device").then((session => {
					testSession = session

          expect(session.started).to.match(/2[0-9][0-9][0-9]\-[0-1][0-9]\-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]\.[0-9]{3}Z/)
				  expect(session.name).to.eq("Name")
				  expect(session.device).to.eq("Device")
				  expect(session.code).to.eq(testToken.code)
				  expect(session.event.uri).to.deep.eq(this.testEvent.uri)

				  //Create section list
				  let sections = []
				  for(let section of testToken.sections){
				  	sections.push(section.uri)
				  }

				  for(let section of session.sections){
				  	expect(sections).to.deep.include(section.uri)
				  }

				  resolve(true)
				})).catch(error=>{
				  reject(error)
				})
		  })
		})

		it('Should throw a UnauthorisedError if an invalid code is provided', function () {
		  return expect(ticketing.session.admission("INVALID", "Name", "Device"))
			  .to.eventually.be.rejectedWith("The provided code does not belong to any event token")
			  .and.be.an.instanceOf(UnauthorisedError)
		})
  })

  describe('List valid tickets', function () {
		it('Should return a collection of Ticket resources', function () {
		  return expect(testSession.tickets()).eventually.to.all.be.instanceof(TicketModel)
		})

		it('Should contain valid Ticket resources', function () {
		  return new Promise((resolve, reject) => {
				testSession.tickets().then(tickets => {
				  let sample = tickets[Math.floor(Math.random()*tickets.length)]

				  let sections = []
				  for(let section of testSession.sections){
				  	sections.push(section.uri)
				  }

				  testTicket = tickets[0]
				  for(let ticket of tickets){
				  	testSerials.push(ticket.serial)
				  }

				  expect(sample).to.be.an.instanceof(TicketModel)
				  expect(sample.serial).to.match(/[0-9A-Z]{6}\-[0-9A-Z]{12}/)
				  expect(sample.status).to.eq("Issued")
				  expect(sections).to.include(sample.section.uri)
				  expect(sample.owner.uri).to.match(/\/accounts\/[A-Z]{2}\-[A-Z0-9]{8}/)
				  expect(sample.issued).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\+00:00/)
				  expect(sample.redeemed).to.eq("N/A")

				  resolve(true)
				}).catch(error => {
				  reject(error)
				})
		  })
		})

		it('Should return a number of records equal to the page size', function () {
		  return new Promise((resolve, reject) => {
				testSession.tickets(3).then(tickets => {
				  expect(tickets.length).to.be.equal(3)

				  resolve(true)
				}).catch(error => {
				  reject(error)
				})
		  })
		})

		it('Should return an empty collection usign the modified_since filter', function () {
		  return new Promise((resolve, reject) => {
				testSession.tickets().filter({modified_since: testTimestamp}).then(tickets => {
				  expect(tickets.length).to.be.at.least(1)

				  for(let ticket of tickets){
				  	expect(ticket.section.uri).to.eq(this.secondSection.uri)
				  }

				  resolve(true)
				}).catch(error => {
				  reject(error)
				})
		  })
		})
  })

  describe('Grant admission to event', function () {
		it('Should return a collection of Admission resources', function () {
		  return new Promise((resolve, reject) => {
				testSession.admit(testSerials).then((admissions => {
					expect(admissions).to.all.be.instanceof(AdmissionModel)

				  let sample = admissions[Math.floor(Math.random()*admissions.length)]

				  let sections = []
				  for(let section of testSession.sections){
				  	sections.push(section.uri)
				  }

				  expect(sample.redeemer).to.eq(testSession.name)
				  expect(sample.device).to.eq(testSession.device)
				  expect(sample.ticket).to.match(/[0-9A-Z]{6}\-[0-9A-Z]{12}/)
				  expect(sample.patron.uri).to.match(/\/accounts\/[A-Z]{2}\-[A-Z0-9]{8}/)
				  expect(sections).to.include(sample.section.uri)
				  expect(sample.admitted).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\+00:00/)

				  resolve(true)
				})).catch(error=>{
				  reject(error)
				})
		  })
		})

		it('Should throw a BadDataError if no valid serials are provided', function () {
		  return expect(testSession.admit(testSerials))
			  .to.eventually.be.rejectedWith("None of the provided ticket serials grants admission to this event")
			  .and.be.an.instanceOf(BadDataError)
		})
  })

  describe('List event admissions', function () {
		it('Should return a collection of Admission resources', function () {
		  return expect(testSession.admissions()).eventually.to.all.be.instanceof(AdmissionModel)
		})

		it('Should contain valid Admission resources', function () {
		  return new Promise((resolve, reject) => {
				testSession.admissions().then(admissions => {
				  let sample = admissions[Math.floor(Math.random()*admissions.length)]

				  let sections = []
				  for(let section of testSession.sections){
				  	sections.push(section.uri)
				  }

				  expect(sample.redeemer).to.eq(testSession.name)
				  expect(sample.device).to.eq(testSession.device)
				  expect(sample.ticket).to.match(/[0-9A-Z]{6}\-[0-9A-Z]{12}/)
				  expect(sample.patron.uri).to.match(/\/accounts\/[A-Z]{2}\-[A-Z0-9]{8}/)
				  expect(sections).to.include(sample.section.uri)
				  expect(sample.admitted).to.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\+00:00/)

				  resolve(true)
				}).catch(error => {
				  reject(error)
				})
		  })
		})

		it('Should return a number of records equal to the page size', function () {
		  return new Promise((resolve, reject) => {
				testSession.admissions(3).then(admissions => {
				  expect(admissions.length).to.be.equal(3)

				  resolve(true)
				}).catch(error => {
				  reject(error)
				})
		  })
		})

		it('Should return a collection of admissions matching the redeemer filter', function () {
		  return new Promise((resolve, reject) => {
				testSession.admissions().filter({redeemer: testSession.name}).then(admissions => {
				  expect(admissions.length).to.be.at.least(1)

				  for(let admission of admissions){
						expect(admission.redeemer).to.equal(testSession.name)
				  }

				  resolve(true)
				}).catch(error => {
				  reject(error)
				})
		  })
		})

		it('Should return a collection of admissions matching the device filter', function () {
		  return new Promise((resolve, reject) => {
				testSession.admissions().filter({device: testSession.device}).then(admissions => {
				  expect(admissions.length).to.be.at.least(1)

				  for(let admission of admissions){
						expect(admission.device).to.equal(testSession.device)
				  }

				  resolve(true)
				}).catch(error => {
				  reject(error)
				})
		  })
		})

		it('Should return a collection of admissions matching the ticket filter', function () {
		  return new Promise((resolve, reject) => {
				testSession.admissions().filter({ticket: testTicket.serial}).then(admissions => {
				  expect(admissions.length).to.be.at.least(1)

				  for(let admission of admissions){
						expect(admission.ticket).to.equal(testTicket.serial)
				  }

				  resolve(true)
				}).catch(error => {
				  reject(error)
				})
		  })
		})

		it('Should return a collection of admissions matching the patron filter', function () {
		  return new Promise((resolve, reject) => {
				testSession.admissions().filter({patron: testTicket.owner.uri}).then(admissions => {
				  expect(admissions.length).to.be.at.least(1)

				  for(let admission of admissions){
						expect(admission.patron.username).to.equal(testTicket.owner.username)
				  }

				  resolve(true)
				}).catch(error => {
				  reject(error)
				})
		  })
		})

		it('Should return a collection of admissions matching the section filter', function () {
		  return new Promise((resolve, reject) => {
				testSession.admissions().filter({section: this.testSection.id}).then(admissions => {
				  expect(admissions.length).to.be.at.least(1)

				  for(let admission of admissions){
						expect(admission.section.uri).to.equal(this.testSection.uri)
				  }

				  resolve(true)
				}).catch(error => {
				  reject(error)
				})
		  })
		})
  })

  describe('End admission session', function () {
    it('Should return true on success', function () {
      return new Promise((resolve, reject) => {
        testSession.end().then((ended => {
          expect(ended).to.equal(true)

          resolve(true)
        })).catch(error=>{
          reject(error)
        })
      })
    })

		it('Should throw an InvalidStateError when already ended', function () {
		  //Make changes to the global token
		  return expect(testSession.end())
				.to.eventually.be.rejectedWith("The admission session has ended, you must start a new one.")
				.and.be.an.instanceOf(InvalidStateError)
		})

		it('Should throw an InvalidStateError when calling tickets() method after end()', function () {
		  //Make changes to the global token
		  return expect(testSession.tickets())
				.to.eventually.be.rejectedWith("The admission session has ended, you must start a new one.")
				.and.be.an.instanceOf(InvalidStateError)
		})

		it('Should throw an InvalidStateError when calling admit() method after end()', function () {
		  //Make changes to the global token
		  return expect(testSession.admit())
				.to.eventually.be.rejectedWith("The admission session has ended, you must start a new one.")
				.and.be.an.instanceOf(InvalidStateError)
		})

		it('Should throw an InvalidStateError when calling admissions() method after end()', function () {
		  //Make changes to the global token
		  return expect(testSession.admissions())
				.to.eventually.be.rejectedWith("The admission session has ended, you must start a new one.")
				.and.be.an.instanceOf(InvalidStateError)
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