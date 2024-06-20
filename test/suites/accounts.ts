import { TickeTing, Region, BadDataError,  ResourceExistsError, ResourceNotFoundError, ResourceIndelibleError } from '../../src'
import { AccountModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect } from '../setup'

// Global account object
let testAccount = null

describe("Accounts", function(){

  //Set timeout for tests in suite
  this.timeout(5000)

  before(function(){
    //Setup SDK for testing
    this.ticketing = new TickeTing({
      apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
      sandbox: true
    })

    //Initialise test data for suite
    this.testAccountData = {
      username: "mothers.milk",
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