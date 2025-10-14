//Control execution order
import './venues'

import { TickeTing, Host, BadDataError, PermissionError, ResourceExistsError, ResourceNotFoundError } from '../../src'
import { HostModel, BaseEventModel, CategoryModel, VenueModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, unauthorised_sdk } from '../setup'

//Global host object
let testHost = null

describe("Hosts", function(){

  //Set hook timeout
  this.timeout(30000)

  before(async function(){
    //A host to test duplication
    this.secondHost = await ticketing.hosts.create({
      name: "Host "+Math.floor(Math.random() * 999999),
      contact: "Second Contact",
      email: "test@second.com",
      country: "Vietnam"
    })

    //Add an event to test hosted events collection
    this.category = await ticketing.categories.create({
      name: "Event Category "+Math.floor(Math.random() * 999999),
      subcategories: ["Event Subcategory"]
    })

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
    this.hostedEvent = await ticketing.events.create({
      host: this.secondHost,
      title: "Hosted Event "+Math.floor(Math.random() * 999999),
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category,
      subcategory: "Event Subcategory",
      venue: this.venue
    })

    //Initialise test data for suite
    this.testHostData = {
      name: "Test Host "+Math.floor(Math.random() * 999999),
      contact: "Test Contact",
      email: "test@test.com",
      description: "A host for hosting test events",
      phone: "+1 (268) 555 5555",
      website: "https://test.com",
      country: "Antigua and Barbuda",
      firstAddressLine: "Test Address",
      secondAddressLine: "Test Street",
      city: "Test City",
      state: "Test State",
      businessNo: "0000000000"
    }
  })

  after(async function(){
    await this.hostedEvent.delete()
    await this.venue.delete()
    await this.region.delete()
    await this.category.delete()
    await this.secondHost.delete()
  })

  describe('Create an event host', function () {
    it('Should return a valid host object', function () {
      return new Promise((resolve, reject) => {
        ticketing.hosts.create(this.testHostData).then((host => {
          testHost = host

          expect(host)
            .to.be.an.instanceof(HostModel)
            .and.to.deep.include(this.testHostData)

          resolve(true)
        })).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      return expect(ticketing.hosts.create({name: "", contact: "", email: ""}))
        .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: name, contact, email.")
        .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError when using an existing name', function () {
      return expect(ticketing.hosts.create(this.testHostData))
        .to.eventually.be.rejectedWith("The following arguments conflict with those of another host: name.")
        .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('List event hosts', function () {
    it('Should return a collection of Host resources', function () {
      return new Promise((resolve, reject) => {
        ticketing.hosts.list(5).then(hosts => {
          expect(hosts.length).to.be.at.least(1)
          expect(hosts).to.all.be.instanceof(HostModel)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of hosts matching the name filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.hosts.list(5).filter({name: this.testHostData.name}).then(hosts => {
          expect(hosts.length).to.be.at.least(1)
          
          for(let host of hosts){
            expect(host.name).to.equal(this.testHostData.name)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of hosts matching the country filter', function () {
      return new Promise((resolve, reject) => {
        ticketing.hosts.list(5).filter({country: this.secondHost.country}).then(hosts => {
          expect(hosts.length).to.be.at.least(1)
          
          for(let host of hosts){
            expect(host.country).to.equal(this.secondHost.country)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return hosts sorted by name in ascending order', function () {
      return new Promise((resolve, reject) => {
        ticketing.hosts.list(5).sort("alphabetical").then(hosts => {
          expect(hosts).to.have.lengthOf.at.least(1)
          expect(hosts.map(host => host.name.toLowerCase())).to.be.ascending

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Fetch an event host', function () {
    it('Should return the identified Host resource', function () {
      return expect(ticketing.hosts.find(testHost.id))
        .to.eventually.be.an.instanceof(HostModel)
        .and.to.deep.include(this.testHostData)
    })

    it('Should throw a ResourceNotFoundError when using a non-existant ID', function () {
      return expect(ticketing.hosts.find(12345))
        .to.eventually.be.rejectedWith("The specified host could not be found.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })

  describe('Update an event host', function () {
    it('Should save the changes made to the host', function () {
      //Make changes to the host
      testHost.name = "New Host"
      testHost.contact = "New Host Contact"

      //Save changes
      return expect(testHost.save()).eventually.be.true
    })

    it('Should persist host changes', function () {
      return expect(ticketing.hosts.find(testHost.id))
        .to.eventually.deep.include({
          "name": "New Host",
          "contact":"New Host Contact"
        })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      //Make invalid changes to the host
      testHost.name = ""

      return expect(testHost.save())
        .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: name.")
        .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a PermissionError when not a host administrator', function () {
      let unauthorised_sdk = null
      if(process.env.npm_config_env == "production"){
        unauthorised_sdk = new TickeTing({
          apiKey: "0acb10082a313f517954a34d2a7aedb7"
        })
      }else{
        unauthorised_sdk = new TickeTing({
          apiKey: "413c7e517b63822c3037ead7679c780e"
        })
      }

      return new Promise((resolve, reject) => {
        unauthorised_sdk.hosts.find(testHost.id).then(unauthorised_host => {
          expect(unauthorised_host.save())
            .to.eventually.be.rejectedWith("This account is not an administrator for the relevant event host.")
            .and.be.an.instanceOf(PermissionError)

          resolve(true)
        })
      })
    })

    it('Should throw a ResourceExistsError when using an existing name', function () {
      //Attempt to change the name of the existing host to that of the second one
      testHost.name = this.secondHost.name

      return expect(testHost.save())
        .to.eventually.be.rejectedWith("The following arguments conflict with those of another host: name.")
        .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('List hosted events', function () {
    it('Should return a collection of Event resources', function () {
      return expect(this.secondHost.events).eventually.to.all.be.instanceof(BaseEventModel)
    })

    it('Should contain a single hosted event', function () {
      return new Promise((resolve, reject) => {
        this.secondHost.events.then(events => {
          expect(events.length).to.equal(1)

          expect(events[0]).to.be.an.instanceof(BaseEventModel)
          expect(events[0].description).to.equal(this.hostedEvent.description)
          expect(events[0].type).to.equal(this.hostedEvent.type)
          expect(events[0].public).to.equal(this.hostedEvent.public)
          expect(events[0].category).to.be.an.instanceOf(CategoryModel).
            and.to.have.property("uri", this.hostedEvent.category.uri)
          expect(events[0].subcategory).to.equal(this.hostedEvent.subcategory)
          expect(events[0].start).to.equal(this.hostedEvent.start)
          expect(events[0].venue).to.be.an.instanceof(VenueModel)
            .and.to.have.property("uri", this.hostedEvent.venue.uri)
          expect(events[0].disclaimer).to.equal(this.hostedEvent.disclaimer)
          expect(events[0].banner).to.equal(`${ticketing.mediaURL}/banner/${events[0].id}`)
          expect(events[0].thumbnail).to.equal(`${ticketing.mediaURL}/thumbnail/${events[0].id}`)
          expect(events[0].status).to.equal("Draft")
          expect(events[0].published).to.be.a.string
          expect(events[0].popularity).to.equal(0)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Delete an event host', function () {
    it('Should throw a PermissionError when not a host administrator', function () {
      let unauthorised_sdk = null
      if(process.env.npm_config_env == "production"){
        unauthorised_sdk = new TickeTing({
          apiKey: "0acb10082a313f517954a34d2a7aedb7"
        })
      }else{
        unauthorised_sdk = new TickeTing({
          apiKey: "413c7e517b63822c3037ead7679c780e"
        })
      }

      return new Promise((resolve, reject) => {
        unauthorised_sdk.hosts.find(testHost.id).then(unauthorised_host => {
          expect(unauthorised_host.delete())
            .to.eventually.be.rejectedWith("This account is not an administrator for the relevant event host.")
            .and.be.an.instanceOf(PermissionError)

          resolve(true)
        })
      })
    })

    it('Should delete the host from the system', function () {
      return expect(testHost.delete()).to.eventually.be.true
    })

    it('Host should no longer be retrievable', function () {
      return expect(ticketing.hosts.find(testHost.id))
        .to.eventually.be.rejectedWith("The specified host could not be found.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })
})