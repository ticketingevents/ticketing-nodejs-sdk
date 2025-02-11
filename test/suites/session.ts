import { TickeTing, InvalidStateError, UnsupportedOperationError, UnauthorisedError, ResourceNotFoundError } from '../../src'
import { SessionModel, AccountModel } from  '../../src/model'
import { expect, ticketing } from '../setup'

// Global account object
let originalKey = ticketing.apiKey
let sessionKey = ""

describe("Session", function(){
  //Set hook timeout
  this.timeout(5000)

  before(async function(){
    //Initialise test data for suite
    this.sessionAccountData = {
      username: `user${Math.floor(Math.random() * 999999)}`,
      password: "password",
      email: `user${Math.floor(Math.random() * 999999)}@gmail.com`
    }

    this.sessionAccount = await ticketing.accounts.create(this.sessionAccountData)
  })

  after(async function(){
    await this.sessionAccount.delete()
  })

  describe('Start a new session', function () {
    it('Should throw an UnauthorisedError if username/password combination is invalid', function () {
      return expect(ticketing.session.start({
          identification: this.sessionAccountData.email,
          password: "wrong"
      }))
      .to.eventually.be.rejectedWith("A session cannot be started with the given password.")
      .and.be.an.instanceOf(UnauthorisedError)
    })

    it('Should throw a ResourceNotFoundError when using a non existant username', function () {
      return expect(ticketing.session.start({
          identification: `unknown${Math.floor(Math.random() * 999999)}`,
          password: this.sessionAccountData.password
      }))
        .to.eventually.be.rejectedWith("The requested account could not be located")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })

    it('Should return new session key on success', function () {
      return new Promise((resolve, reject) => {
        ticketing.session.start({
          identification: this.sessionAccountData.username,
          password: this.sessionAccountData.password,
        }).then((key => {
          expect(key).to.match(/[a-z0-9]{32}/)
          sessionKey = key

          resolve(true)
        })).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should have updated the SDK session key', function () {
      return expect(ticketing.apiKey).to.equal(sessionKey)
    })

    it('Should throw a UnsupportedOperationError when there is already an active session', function () {
      return expect(ticketing.session.start({
        identification: this.sessionAccountData.username,
        password: this.sessionAccountData.password,
      }))
        .to.eventually.be.rejectedWith("There is already an active session")
        .and.be.an.instanceOf(UnsupportedOperationError)
    })
  })

  describe('Resume an active session', function () {
    it('Should throw an UnsupportedOperationError if there is already an active session', function () {
      return new Promise((resolve, reject) => {
        expect(ticketing.session.resume(ticketing.apiKey))
        .to.eventually.be.rejectedWith("There is already an active session.")
        .and.be.an.instanceOf(UnsupportedOperationError)

        //End session (but not in API)
        ticketing.session.end(false).then(ended=>{
          resolve(true)
        }).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should throw a InvalidStateError when there is no session associated with the key', function () {
      return expect(ticketing.session.resume("notavalidkey"))
        .to.eventually.be.rejectedWith("The session has ended or does not exist.")
        .and.be.an.instanceOf(InvalidStateError)
    })

    it('Should return true on success', function () {
      return new Promise((resolve, reject) => {
        ticketing.session.resume(sessionKey).then((resumed => {
          expect(resumed).to.equal(true)

          resolve(true)
        })).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should have updated the SDK key', function () {
      return expect(ticketing.apiKey).to.equal(sessionKey)
    })

    it('Should have set active property to true', function () {
      return expect(ticketing.session.active).to.equal(true)
    })
  })

  describe('Retrieve session information', function (){
    it('Should return the active Session resource', function () {
      return new Promise((resolve, reject) => {
        ticketing.session.info().then(session => {
          expect(session).to.be.an.instanceof(SessionModel)
          expect(session.started).to.match(/20[0-9][0-9]\-[0-1][0-9]\-[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9]/)
          expect(session.key).to.equal(sessionKey)
          expect(session.account).to.be.an.instanceof(AccountModel)
          expect(session.account.username).to.equal(this.sessionAccountData.username)
          expect(session.account.email).to.equal(this.sessionAccountData.email)


          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('End a session', function (){
    it('Should return true on success', function () {
      return new Promise((resolve, reject) => {
        ticketing.session.end().then((ended => {
          expect(ended).to.equal(true)

          resolve(true)
        })).catch(error=>{
          reject(error)
        })
      })
    })

    it('Should have updated the SDK key', function () {
      return expect(ticketing.apiKey).to.equal(originalKey)
    })

    it('Should have set active property to false', function () {
      return expect(ticketing.session.active).to.equal(false)
    })

    it('Should throw an UnsupportedOperationError if there is no active session', function () {
      return expect(ticketing.session.end())
        .to.eventually.be.rejectedWith("There is currently no active session")
        .and.be.an.instanceOf(UnsupportedOperationError)
    })

    it('Should throw an InvalidStateError if the session is resumed', function () {
      return expect(ticketing.session.resume(sessionKey))
        .to.eventually.be.rejectedWith("The session has ended or does not exist.")
        .and.be.an.instanceOf(InvalidStateError)
    })

    it('Should throw an UnsupportedOperationError if session info is retrieved', function () {
      return expect(ticketing.session.info())
        .to.eventually.be.rejectedWith("There is currently no active session.")
        .and.be.an.instanceOf(UnsupportedOperationError)
    })
  })
})