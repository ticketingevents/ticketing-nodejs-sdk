//Control execution order
import './venues'

import { TickeTing, Host, BadDataError, PermissionError, ResourceExistsError, ResourceNotFoundError } from '../../src'
import { HostModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect } from '../setup'

//Global host object
let testHost = null

describe("Hosts", function(){

  before(async function(){
    //Setup SDK for testing
    this.ticketing = new TickeTing({
      apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
      sandbox: true
    })

    //An event to test duplication
    this.secondHost = await this.ticketing.hosts.create({
      name: "Second Host "+Math.floor(Math.random() * 999999),
      contact: "Second Contact",
      email: "test@second.com"
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
    await this.secondHost.delete()
  })

  describe('Create an event host', function () {
    it('Should return a valid host object', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.hosts.create(this.testHostData).then((host => {
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
      return expect(this.ticketing.hosts.create({name: "", contact: "", email: ""}))
        .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: name, contact, email.")
        .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError when using an existing name', function () {
      return expect(this.ticketing.hosts.create(this.testHostData))
        .to.eventually.be.rejectedWith("The following arguments conflict with those of another host: name.")
        .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('List event hosts', function () {
    it('Should return a collection of Host resources', function () {
      return expect(this.ticketing.hosts.list()).eventually.to.all.be.instanceof(HostModel)
    })

    it('Should contain the newly created host as its last resource', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.hosts.list(1).last().then(hosts => {
          expect(hosts[0])
            .to.be.an.instanceof(HostModel)
            .and.to.deep.include(this.testHostData)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Fetch an event host', function () {
    it('Should return the identified Host resource', function () {
      return expect(this.ticketing.hosts.find(testHost.id))
        .to.eventually.be.an.instanceof(HostModel)
        .and.to.deep.include(this.testHostData)
    })

    it('Should throw a ResourceNotFoundError when using a non-existant ID', function () {
      return expect(this.ticketing.hosts.find(12345))
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
      return expect(this.ticketing.hosts.find(testHost.id))
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
      let unauthorised_sdk = new TickeTing({
        apiKey: "413c7e517b63822c3037ead7679c780e",
        sandbox: true
      })

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

  describe('Delete an event host', function () {
    it('Should throw a PermissionError when not a host administrator', function () {
      let unauthorised_sdk = new TickeTing({
        apiKey: "413c7e517b63822c3037ead7679c780e",
        sandbox: true
      })

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
      return expect(this.ticketing.hosts.find(testHost.id))
        .to.eventually.be.rejectedWith("The specified host could not be found.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })
})