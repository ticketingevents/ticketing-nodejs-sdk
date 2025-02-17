//Control execution order
import './sorting'

import { Region, PageAccessError } from '../../src'
import { Collection } from  '../../src/util'
import { expect, ticketing } from '../setup'

describe("Pagination", function(){

  //Set hook timeout
  this.timeout(10000)

  before(async function(){
    //Initialise test data for suite
    let regionData = {
      name: "Test Region ",
      country: "Antigua and Barbuda"
    }

    this.testRegions = []
    for(let i=1; i <= 5; i++){
      this.testRegions.push(
        await ticketing.regions.create({
          name: regionData.name+Math.floor(Math.random() * 999999),
          country: regionData.country
        }
      ))
    }

    // Initialise collection handle for testing
    this.collection = ticketing.regions.list(1)
  })

  after(async function(){
    //Remove test resources
    let deletions = []
    for(let region of this.testRegions){
      deletions.push(region.delete())
    }

    await Promise.all(deletions)
  })

  describe('#first()', function () {
    it("Should return the first page of resources", function(){
      return expect(this.collection.first().current)
        .to.eventually.equal(1)
    })
  })

  describe('#next()', function () {
    it("Should navigate to the next page of resources", function(){
      return expect(this.collection.first().next().current)
        .to.eventually.equal(2)
    })

    it("Should throw a PageAccessError if no subsequent page exists", function(){
      return new Promise((resolve, reject) => {
        this.collection.pages.then(pages => {
          expect(this.collection.goto(pages).next())
            .to.eventually.be.rejectedWith("The specified page does not exist for the given records per page")
            .and.be.an.instanceof(PageAccessError)

          resolve(true)
        })
      })
    })
  })

  describe('#previous()', function () {
    it("Should navigate to the previous page of resources", function(){
      return new Promise((resolve, reject) => {
        this.collection.pages.then(pages => {
          expect(this.collection.goto(pages).previous().current)
            .to.eventually.equal(pages - 1)

          resolve(true)
        })
      })
    })

    it("Should throw a PageAccessError if no previous page exists", function(){
      return expect(this.collection.first().previous())
        .to.eventually.be.rejectedWith("Please specify a positive integer page number")
        .and.be.an.instanceof(PageAccessError)
    })
  })

  describe('#goto()', function () {
    it("Should navigate to the specified page of resources", function(){
      return expect(this.collection.goto(3).current)
        .to.eventually.equal(3)
    })
  })

  describe('#hasNext()', function () {
    it("Should return true if a subsequent page of resources exists", function(){
      return expect(this.collection.first().hasNext())
        .to.eventually.be.true
    })

    it("Should return false if no subsequent page of resources exists", function(){
      return new Promise((resolve, reject) => {
        this.collection.pages.then(pages => {
          expect(this.collection.goto(pages).hasNext())
            .to.eventually.be.false

          resolve(true)
        })
      })
    })
  })

  describe('#hasPrevious()', function () {
    it("Should return true if a previous page of resources exists", function(){
      return new Promise((resolve, reject) => {
        this.collection.pages.then(pages => {
          expect(this.collection.goto(pages).hasPrevious())
            .to.eventually.be.true

          resolve(true)
        })
      })
    })

    it("Should return false if no previous page of resources exists", function(){
      return expect(this.collection.first().hasPrevious())
        .to.eventually.be.false
    })
  })
})