//Control execution order
import './venues'

import { TickeTing, Host, BadDataError, PermissionError, ResourceExistsError, ResourceNotFoundError } from '../../src'
import { HostModel, EventRevisionModel, CategoryModel, RoleModel, VenueModel, PrivilegeModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, unauthorised_sdk } from '../setup'

//Global objects
let testHost = null
let testPrivilege = null

describe("Host Management", function(){

  //Set hook timeout
  this.timeout(60000)

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
      subcategories: ["Event Subcategory "+Math.floor(Math.random() * 999999)]
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
    this.testHostedEvent = await this.secondHost.events.create({
      title: "Hosted Event "+Math.floor(Math.random() * 999999),
      description: "Event Description",
      type: "Standard",
      public: true,
      category: this.category,
      subcategory: this.category.subcategories[0],
      venue: this.venue,
      start: "3034-06-07T20:00",
      end: "3034-06-07T23:00"
    })

    //Initialise test data for suite
    this.testHostData = {
      name: "Test Host "+Math.floor(Math.random() * 999999),
      contact: "Test Contact",
      email: "test@test.com",
      bio: "A host for hosting test events",
      phone: "+1 (268) 555 5555",
      website: "https://test.com",
      country: "Antigua and Barbuda",
      firstAddressLine: "Test Address",
      secondAddressLine: "Test Street",
      city: "Test City",
      district: "Test State",
      businessNo: "0000000000"
    }

    this.testPrivilegeData = {
      user: "billy.butcher@fbsa.gov",
      role: "Editor"
    }
  })

  after(async function(){
    await this.testHostedEvent.delete()
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
        .to.eventually.be.rejectedWith("Your request payload is invalid. Please ensure you have included all required fields and values are well-formed.")
        .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError when using an existing name', function () {
      return expect(ticketing.hosts.create(this.testHostData))
        .to.eventually.be.rejectedWith("Creating the requested Host would violate uniqueness constraints.")
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
      return expect(ticketing.hosts.find(12345678901234))
        .to.eventually.be.rejectedWith("There is presently no host with the given URI.")
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
        .to.eventually.be.rejectedWith("Your request payload is invalid. Please ensure you have included all required fields and values are well-formed.")
        .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a PermissionError when not a host administrator', function () {
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
        .to.eventually.be.rejectedWith("Creating the requested Host would violate uniqueness constraints.")
        .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('Grant a privilege', function () {
    it('Should return a valid Privilege object', function () {
      return new Promise((resolve, reject) => {
        testHost.privileges.create(this.testPrivilegeData).then((privilege => {
          testPrivilege = privilege

          expect(privilege).to.be.an.instanceof(PrivilegeModel)
          expect(privilege.user).to.equal(this.testPrivilegeData.user)
          expect(privilege.role).to.be.an.instanceOf(RoleModel).
            and.to.have.property("name", this.testPrivilegeData.role)
          expect(privilege.type).to.equal("host")
          expect(privilege.resource).to.equal(testHost.id)
          expect(privilege.pending).to.equal(true)

          resolve(true)
        })).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      return expect(testHost.privileges.create({
        user: "",
        role: ""
      }))
      .to.eventually.be.rejectedWith("Your request payload is invalid. Please ensure you have included all required fields and values are well-formed.")
      .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError if the requested privilege has already been granted.', function () {
      return expect(testHost.privileges.create(this.testPrivilegeData))
      .to.eventually.be.rejectedWith("Creating the requested Privilege would violate uniqueness constraints.")
      .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('List privileges', function () {
    it('Should return a collection of Privilege resources', function () {
      return expect(testHost.privileges.list()).eventually.to.all.be.instanceof(PrivilegeModel)
    })

    it('Should contain the newly granted privilege as its first resource', function () {
      return new Promise((resolve, reject) => {
        testHost.privileges.list(1).then(privileges => {
          expect(privileges[0]).to.be.an.instanceof(PrivilegeModel)
          expect(privileges[0].user).to.be.a.string
          expect(privileges[0].role).to.be.an.instanceOf(RoleModel).
            and.to.have.property("name", "Owner")
          expect(privileges[0].type).to.equal("host")
          expect(privileges[0].resource).to.equal(testHost.id)
          expect(privileges[0].pending).to.equal(false)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of privileges matching the role filter', function () {
      return new Promise((resolve, reject) => {
        testHost.privileges.list(5).filter({role: "Editor"}).then(privileges => {
          expect(privileges).to.have.a.lengthOf.at.least(1)
          for(const privilege of privileges){
            expect(privilege.role).to.be.an.instanceOf(RoleModel).
              and.to.have.property("name", this.testPrivilegeData.role)
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Fetch a privilege', function () {
    it('Should return the identified Privilege resource', function () {
      return new Promise((resolve, reject) => {
        testHost.privileges.find(testPrivilege.id).then(privilege => {
          expect(privilege).to.be.an.instanceof(PrivilegeModel)
          expect(privilege.user).to.equal(this.testPrivilegeData.user)
          expect(privilege.role).to.be.an.instanceOf(RoleModel).
            and.to.have.property("name", this.testPrivilegeData.role)
          expect(privilege.type).to.equal("host")
          expect(privilege.resource).to.equal(testHost.id)
          expect(privilege.pending).to.equal(true)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should throw a ResourceNotFoundError when using a non-existant ID', function () {
      return expect(testHost.privileges.find(12345678901234))
        .to.eventually.be.rejectedWith("There is presently no privilege with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })

  describe('Update a privilege', function () {
    it('Should save the changes made to the privilege', function () {
      //Make changes to the privilege
      testPrivilege.role = "Administrator"

      //Save changes
      return expect(testPrivilege.save()).eventually.be.true
    })

    it('Should persist privilege changes', function () {
      return new Promise((resolve, reject) => {
        testHost.privileges.find(testPrivilege.id).then(privilege => {
          expect(privilege.user).to.equal(this.testPrivilegeData.user)
          expect(privilege.role).to.be.an.instanceOf(RoleModel).
            and.to.have.property("name", "Administrator")

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should throw a BadDataError if required fields are invalid', function () {
      //Make invalid changes to the privilege
      testPrivilege.role = "Owner"

      return expect(testPrivilege.save())
        .to.eventually.be.rejectedWith("Your request payload is invalid. Please ensure you have included all required fields and values are well-formed.")
        .and.be.an.instanceOf(BadDataError)
    })
  })

  describe('Revoke a privilege', function () {
    it('Should revoke the privilege', function () {
      return expect(testPrivilege.delete()).to.eventually.be.true
    })

    it('Privilege should no longer be retrievable', function () {
      return expect(testHost.privileges.find(testPrivilege.id))
        .to.eventually.be.rejectedWith("There is presently no privilege with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })

  describe('Delete an event host', function () {
    it('Should throw a PermissionError when not a host administrator', function () {
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
        .to.eventually.be.rejectedWith("There is presently no host with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })
})