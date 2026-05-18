//Control execution order
import './tier_management'

import { TickeTing } from '../../src'
import { HostModel, CategoryModel, VenueModel, PrivilegeModel, RoleModel } from  '../../src/model'
import { expect, ticketing, api, public_ticketing } from '../setup'

// Global account object
let testAccount = null

describe("Account Privileges", function(){

  //Set hook timeout
  this.timeout(60000)

  before(async function(){
  	//Create a customer
  	this.customer = await ticketing.accounts.create({
  		username: "mothers.milk"+Math.floor(Math.random() * 999999),
  		password: "WuT4NGcl4n",
  		email: "marvin.milk"+Math.floor(Math.random() * 999999)+"@usmc.gov",
  		firstName: "Marvin",
  		lastName: "Milk",
  		title: "Mr",
  		dateOfBirth: "1974-09-14",
  		phone: "+1 (268) 555 0123",
  		country: "Antigua and Barbuda",
  		firstAddressLine: "Jennings New Extension",
  		secondAddressLine: "",
  		city: "Jennings",
  		state: "Saint Mary's"
  	})

  	//Create an event host
  	this.host = await ticketing.hosts.create({
  		name: "Host "+Math.floor(Math.random() * 999999),
  		contact: "Jane Doe",
  		email: "jane@eventhost.com"
  	})

    //Grant host privilege to customer
    await this.host.privileges.create({
      "user": this.customer.email,
      "role": "Administrator" 
    })
  })

  after(async function(){
    await this.host.delete()
    await this.customer.delete()
  })

  describe('List account privileges', function () {
    it('Should return a collection of Privilege resources', function () {
      return expect(this.customer.privileges.list())
        .eventually.to.all.be.instanceof(PrivilegeModel)
    })

    it('Should contain the newly granted privilege as its first resource', function () {
      return new Promise((resolve, reject) => {
        this.customer.privileges.list().then(privileges => {
          expect(privileges[0].user).to.equal(this.customer.email)
          expect(privileges[0].role).to.be.an.instanceOf(RoleModel).
            and.to.have.property("name", "Administrator")
          expect(privileges[0].type).to.equal("host")
          expect(privileges[0].resource).to.equal(this.host.id)
          expect(privileges[0].pending).to.equal(false)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of privileges matching the role filter', function () {
      return new Promise((resolve, reject) => {
        this.customer.privileges.list().filter({role: "Administrator"}).then(privileges => {
          expect(privileges).to.have.lengthOf.at.least(1)
          for(const privilege of privileges){
            expect(privilege.role).to.be.an.instanceof(RoleModel)
              .and.to.have.property("name", "Administrator")
          }

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection of privileges matching the type filter', function () {
      return expect(this.customer.privileges.list().filter({type: "host"}))
        .to.eventually.have.lengthOf.at.least(1)
        .and.to.all.have.property("type", "host")
    })
  })

  describe('List privileged hosts', function () {
    it('Should return a collection of Host resources', function () {
      return expect(this.customer.hosts.list()).eventually.to.all.be.instanceof(HostModel)
    })

    it('Should contain the test host', function () {
      return new Promise((resolve, reject) => {
        this.customer.hosts.list().then(hosts => {
          expect(hosts[0])
            .to.be.an.instanceof(HostModel)
            .and.to.deep.include(this.host.serialise())

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })
})