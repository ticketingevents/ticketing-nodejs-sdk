//Control execution order
import './session'

import { TickeTing, Region, BadDataError,  ResourceExistsError, ResourceNotFoundError, PermissionError } from '../../src'
import { AccountModel, AccountPreferencesModel, RegionModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect } from '../setup'

// Global account object
let testAccount = null

describe("Accounts", function(){

  //Set hook timeout
  this.timeout(10000)

  before(async function(){
    //Setup SDK for testing
    this.ticketing = new TickeTing({
      apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
      sandbox: true
    })

    //Initialise test data for suite
    this.testAccountData = {
      username: "zz.mothers.milk",
      password: "WuT4NGcl4n",
      email: "marvin.milk@usmc.gov",
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
    }

    //Create a region for use in account preference management
    this.preferredRegion = await this.ticketing.regions.create({
      "name": "Preferred Region "+Math.floor(Math.random() * 999999),
      "country": "Antigua and Barbuda"
    })
  })

  after(async function(){
    await this.preferredRegion.delete()
  })

  describe('Register an account', function () {
    it('Should return a valid account object', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.accounts.create(this.testAccountData).then((account => {
          testAccount = account

          expect(account).to.be.an.instanceof(AccountModel)
          expect(account.number).to.match(/[A-Z0-9]{2}\-[0-9A-Z]{8}/)
          expect(account.username).to.equal(this.testAccountData.username)
          expect(account.email).to.equal(this.testAccountData.email)
          expect(account.role).to.equal("customer")
          expect(account.verified).to.equal(false)
          expect(account.activated).to.equal(true)
          expect(account.firstName).to.equal(this.testAccountData.firstName)
          expect(account.lastName).to.equal(this.testAccountData.lastName)
          expect(account.title).to.equal(this.testAccountData.title)
          expect(account.dateOfBirth).to.equal(this.testAccountData.dateOfBirth)
          expect(account.phone).to.equal(this.testAccountData.phone)
          expect(account.country).to.equal(this.testAccountData.country)
          expect(account.firstAddressLine).to.equal(this.testAccountData.firstAddressLine)
          expect(account.secondAddressLine).to.equal(this.testAccountData.secondAddressLine)
          expect(account.city).to.equal(this.testAccountData.city)
          expect(account.state).to.equal(this.testAccountData.state)

          resolve(true)
        })).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      return expect(this.ticketing.accounts.create({
        username: "",
        password: "",
        email: ""
      }))
      .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: username, password.")
      .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError when using an existing username or email address', function () {
      return expect(this.ticketing.accounts.create(this.testAccountData))
        .to.eventually.be.rejectedWith("The following arguments conflict with those of another user: username.")
        .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('List all accounts', function () {
    it('Should return a collection of Account resources', function () {
      return expect(this.ticketing.accounts.list(5)).eventually.to.all.be.instanceof(AccountModel)
    })

    it('Should contain the newly created account as its last resource', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.accounts.list(1).last().then(accounts => {
          expect(accounts[0]).to.be.an.instanceof(AccountModel)
          expect(accounts[0].number).to.equal(testAccount.number)
          expect(accounts[0].username).to.equal(this.testAccountData.username)
          expect(accounts[0].email).to.equal(this.testAccountData.email)
          expect(accounts[0].role).to.equal("customer")
          expect(accounts[0].verified).to.equal(false)
          expect(accounts[0].activated).to.equal(true)
          expect(accounts[0].firstName).to.equal(this.testAccountData.firstName)
          expect(accounts[0].lastName).to.equal(this.testAccountData.lastName)
          expect(accounts[0].title).to.equal(this.testAccountData.title)
          expect(accounts[0].dateOfBirth).to.equal(this.testAccountData.dateOfBirth)
          expect(accounts[0].phone).to.equal(this.testAccountData.phone)
          expect(accounts[0].country).to.equal(this.testAccountData.country)
          expect(accounts[0].firstAddressLine).to.equal(this.testAccountData.firstAddressLine)
          expect(accounts[0].secondAddressLine).to.equal(this.testAccountData.secondAddressLine)
          expect(accounts[0].city).to.equal(this.testAccountData.city)
          expect(accounts[0].state).to.equal(this.testAccountData.state)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection containing the account matching the number filter', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.accounts.list().filter({number: testAccount.number}).then(accounts => {
          expect(accounts.length).to.eq(1)
          expect(accounts[0].number).to.equal(testAccount.number)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection containing the account matching the email filter', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.accounts.list().filter({email: this.testAccountData.email}).then(accounts => {
          expect(accounts.length).to.eq(1)
          expect(accounts[0].email).to.equal(this.testAccountData.email)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should return a collection containing the account matching the username filter', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.accounts.list().filter({username: this.testAccountData.username}).then(accounts => {
          expect(accounts.length).to.eq(1)
          expect(accounts[0].username).to.equal(this.testAccountData.username)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Fetch an account', function () {
    it('Should return the identified Account resource', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.accounts.find(testAccount.number).then(account => {
          expect(account).to.be.an.instanceof(AccountModel)
          expect(account.number).to.match(/[A-Z0-9]{2}\-[0-9A-Z]{8}/)
          expect(account.username).to.equal(this.testAccountData.username)
          expect(account.email).to.equal(this.testAccountData.email)
          expect(account.role).to.equal("customer")
          expect(account.verified).to.equal(false)
          expect(account.activated).to.equal(true)
          expect(account.firstName).to.equal(this.testAccountData.firstName)
          expect(account.lastName).to.equal(this.testAccountData.lastName)
          expect(account.title).to.equal(this.testAccountData.title)
          expect(account.dateOfBirth).to.equal(this.testAccountData.dateOfBirth)
          expect(account.phone).to.equal(this.testAccountData.phone)
          expect(account.country).to.equal(this.testAccountData.country)
          expect(account.firstAddressLine).to.equal(this.testAccountData.firstAddressLine)
          expect(account.secondAddressLine).to.equal(this.testAccountData.secondAddressLine)
          expect(account.city).to.equal(this.testAccountData.city)
          expect(account.state).to.equal(this.testAccountData.state)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should throw a ResourceNotFoundError when using a non-existant number', function () {
      return expect(this.ticketing.accounts.find("NO-12345678"))
        .to.eventually.be.rejectedWith("The requested account could not be located")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })

    it('Should throw a PermissionError when accessed with another user', function () {
      let unauthorised_sdk = new TickeTing({
        apiKey: "413c7e517b63822c3037ead7679c780e",
        sandbox: true
      })

      return expect(unauthorised_sdk.accounts.find(testAccount.number))
        .to.eventually.be.rejectedWith("You are not authorised to access or modify this account.")
        .and.be.an.instanceOf(PermissionError)
    })
  })

  describe('Update an account', function () {
    it('Should save the changes made to the account', function () {
      //Make changes to the account
      testAccount.firstName = "New First"
      testAccount.lastName = "New Last"

      //Save changes
      return expect(testAccount.save()).eventually.be.true
    })

    it('Should persist account changes', function () {
      return expect(this.ticketing.accounts.find(testAccount.number))
        .to.eventually.include({
          "firstName": "New First",
          "lastName": "New Last"
        })
    })

    it('Should throw a BadDataError if fields are invalid', function () {
      //Make invalid changes to the account
      testAccount.title = "Dr."

      return expect(testAccount.save())
        .to.eventually.be.rejectedWith("The following arguments have invalid values: title.")
        .and.be.an.instanceOf(BadDataError)
    })
  })

  describe('Fetch account preferences', function () {
    it('Should return the identified AccountPreferences resource', function () {
      return new Promise((resolve, reject) => {
        testAccount.preferences.then(preferences => {
          expect(preferences).to.be.an.instanceof(AccountPreferencesModel)
          expect(preferences.region).to.be.null

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Update account preferences', function () {
    it('Should save the updated account preferences', function () {
      return new Promise((resolve, reject) => {
        testAccount.preferences.then(preferences => {
          preferences.region = this.preferredRegion

          //Save changes
          preferences.save().then(saved => {
            expect(saved).to.be.true
            resolve(true)
          })
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should persist updated account preferences', function () {
      return new Promise((resolve, reject) => {
        testAccount.preferences.then(preferences => {
          expect(preferences.region).to.be.an.instanceof(RegionModel)
            .and.to.have.property("uri", this.preferredRegion.uri)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })

    it('Should throw a BadDataError if no region is provided', function () {
      return new Promise((resolve, reject) => {
        testAccount.preferences.then(preferences => {
          preferences.region = null

          expect(preferences.save())
            .to.eventually.be.rejectedWith("The following arguments are required, but have not been supplied: region.")
            .and.be.an.instanceOf(BadDataError)

          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Delete an account', function () {
    it('Should delete the account from the system', function () {
      return expect(testAccount.delete()).to.eventually.be.true
    })

    it('Account should no longer be retrievable', function () {
      return expect(this.ticketing.accounts.find(testAccount.number))
        .to.eventually.be.rejectedWith("The requested account could not be located")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })
})