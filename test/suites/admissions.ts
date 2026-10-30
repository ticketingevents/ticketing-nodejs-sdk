//Control execution order
import './reporting'

import { 
	TickeTing, BadDataError, InvalidStateError, ResourceImmutableError,
	ResourceIndelibleError, UnauthorisedError, ResourceNotFoundError
} from '../../src'
import { AdmissionModel, TicketModel, EventListingModel, TierListingModel, AdmissionTokenModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api } from '../setup'

//Global token objects
let globalToken = null
let testToken = null
let testSession = null
let testTicket = null
let testSerials = []
let testTimestamp = ""

describe("Event Admissions", function(){
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

		//Create test form
    this.form = await this.host.forms.create({
      "name": "Meal Preferences "+Math.floor(Math.random() * 999999),
      "description": "Provide information on any dietary requirements or allergens.",
      "fields": [
      	{"name": "Allergies", "type": "short_text", "required": true},
      	{"name": "Milk Type", "type": "short_text", "required": true}
      ]
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
  		capacity: 15,
      events: [{
        "event": this.event,
        "share": 100
      }]
  	})

  	this.second_tier = await this.host.tiers.create({
  		name: "Test tier "+Math.floor(Math.random() * 999999),
  		description: "Test admissions with this.",
  		price: 50,
      available_from: "2025-05-02T21:00:00",
      available_to: "2125-07-01T00:00:00",
  		capacity: 15,
      events: [{
        "event": this.event,
        "share": 100
      }],
      form: this.form
  	})

  	//Publish event
    let submission = await this.event.submissions.create()
    await submission.approve("Event approved")
    await this.event.publish()

		//Place order for ticket retrieval tests
		let cart = await this.customer.carts.create()
		cart.add(this.tier, 5)
		await cart.checkout()

    //Initialise token data for suite
    this.testTokenData = {
			"label": "East Gate Entry",
			"tiers": [this.tier]
		}

	})

	after(async function(){
		await this.second_tier.delete()
		await this.tier.delete()
		await this.event.delete()
		await this.category.delete()
		await this.host.delete()
		await this.venue.delete()
		await this.region.delete()
		await this.customer.delete()
  })

  describe('Issue an admission token', function () {
		it('Should return a valid token object', function () {
		  return new Promise((resolve, reject) => {
				this.event.tokens.create(this.testTokenData).then((token => {
	        testToken = token

	        expect(token).to.be.an.instanceof(AdmissionTokenModel)
	        expect(token.label).to.eq(this.testTokenData.label)
	        expect(token.code).to.match(/[0-9A-Z]{8}/)
          expect(token.event).to.have.property("uri", this.event.uri)
	        expect(token.api_key).to.match(/[a-z0-9]{32}/)

	        expect(token.tiers.length).to.eq(this.testTokenData.tiers.length)
	        for(let i=0; i < token.tiers.length; i++){
	            expect(token.tiers[i]).to.be.an.instanceof(TierListingModel)
	            	.and.to.have.property("uri", this.testTokenData.tiers[i].uri)
	        }

	        resolve(true)
				})).catch(error=>{
				  reject(error)
				})
		  })
		})

		it('Should throw a BadDataError if required fields are missing', function () {
		  return expect(this.event.tokens.create({}))
				.to.eventually.be.rejectedWith("Your request payload is invalid. Please ensure you have included all required fields and values are well-formed.")
				.and.be.an.instanceOf(BadDataError)
		})
  })

  describe('List admission tokens', function () {
		it('Should return a collection of Token resources', function () {
		  return expect(this.event.tokens.list()).eventually.to.all.be.instanceof(AdmissionTokenModel)
		})

    it('Should contain the newly created token as its first resource', function () {
      return new Promise((resolve, reject) => {
        this.event.tokens.list(1).then(tokens => {
          expect(tokens[0]).to.be.an.instanceof(AdmissionTokenModel)
	        expect(tokens[0].label).to.eq(this.testTokenData.label)
	        expect(tokens[0].code).to.match(/[0-9A-Z]{8}/)
          expect(tokens[0].event).to.have.property("uri", this.event.uri)
	        expect(tokens[0].api_key).to.match(/[a-z0-9]{32}/)

	        expect(tokens[0].tiers.length).to.eq(this.testTokenData.tiers.length)
	        for(let i=0; i < tokens[0].tiers.length; i++){
	            expect(tokens[0].tiers[i]).to.be.an.instanceof(TierListingModel)
	            	.and.to.have.property("uri", this.testTokenData.tiers[i].uri)
	        }

	        resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Fetch an admission token', function () {
    it('Should return the identified token resource', function () {
      return new Promise((resolve, reject) => {
        this.event.tokens.find(testToken.id).then(token => {
	        expect(token).to.be.an.instanceof(AdmissionTokenModel)
	        expect(token.label).to.eq(this.testTokenData.label)
	        expect(token.code).to.match(/[0-9A-Z]{8}/)
          expect(token.event).to.be.an("object")
            .and.to.have.property("uri", this.event.uri)
	        expect(token.api_key).to.match(/[a-z0-9]{32}/)

	        expect(token.tiers.length).to.eq(this.testTokenData.tiers.length)
	        for(let i=0; i < token.tiers.length; i++){
	            expect(token.tiers[i]).to.be.an.instanceof(TierListingModel)
	            	.and.to.have.property("uri", this.testTokenData.tiers[i].uri)
	        }

	        resolve(true)
        }).catch(error => {
					reject(error)
        })
      })
    })

    it('Should throw a ResourceNotFoundError when using a non-existant ID', function () {
      return expect(this.event.tokens.find(12345678901234))
        .to.eventually.be.rejectedWith("There is presently no admission-token with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })

  describe('Update an admission token', function () {
    it('Should save the changes made to the token', function () {
			return new Promise((resolve, reject) => {
				//Make changes to the token
				testToken.label = "West Gate Entry"

				let tiers = testToken.tiers
				testToken.tiers.push(this.second_tier)

				//Save changes
				testToken.save().then(saved => {
					expect(saved).to.be.true
					resolve(true)
				}).catch(error => {
					reject(error)
				})
	    })
    })

    it('Should persist token changes', function () {
      return new Promise((resolve, reject) => {
        this.event.tokens.find(testToken.id).then(token => {
					expect(token.label).to.equal("West Gate Entry")

					let tiers = token.tiers			          
					expect(tiers).to.have.a.lengthOf(2)
					expect(tiers[1]).to.have.property("uri", this.second_tier.uri)

					resolve(true)
        }).catch(error => {
					reject(error)
        })
      })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      //Make invalid changes to the event
      testToken.label = ""

      return expect(testToken.save())
        .to.eventually.be.rejectedWith("Your request payload is invalid. Please ensure you have included all required fields and values are well-formed.")
        .and.be.an.instanceOf(BadDataError)
    })
  })

  describe.skip('Start admission session', function () {
		it('Should return a valid admission session object', function () {
		  return new Promise((resolve, reject) => {
				ticketing.session.admission(testToken.code, "Name", "Device").then((session => {
					testSession = session

          expect(session.started).to.match(/2[0-9][0-9][0-9]\-[0-1][0-9]\-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9]\.[0-9]{3}Z/)
				  expect(session.name).to.eq("Name")
				  expect(session.device).to.eq("Device")
				  expect(session.code).to.eq(testToken.code)
				  expect(session.event.uri).to.deep.eq(this.event.uri)

				  //Create tier list
				  let tiers = []
				  for(let tier of testToken.tiers){
				  	tiers.push(tier.uri)
				  }

				  for(let tier of session.tiers){
				  	expect(tiers).to.deep.include(tier.uri)
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

  describe.skip('List valid tickets', function () {
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

		it('Should return an empty collection using the modified_since filter', function () {
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

  describe.skip('Grant admission to event', function () {
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

  describe.skip('List event admissions', function () {
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
				testSession.admissions().filter({ticket: testTicket}).then(admissions => {
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
				testSession.admissions().filter({patron: testTicket.owner}).then(admissions => {
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
				testSession.admissions().filter({section: this.testSection}).then(admissions => {
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

  describe.skip('End admission session', function () {
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

  describe('Invalidate an admission token', function () {
		it('Should invalidate the specified token', function () {
			return expect(testToken.delete()).to.eventually.be.true
		})

		it('Token should no longer be attached to event', function () {
      return expect(this.event.tokens.find(testToken.id))
        .to.eventually.be.rejectedWith("There is presently no admission-token with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
		})
  })
})