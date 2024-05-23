//Control execution order
import './venues'

import { TickeTing } from '../../src'
import { expect } from '../setup'

describe("Presets", function(){

  //Set hook timeout
  this.timeout(20000)

  before(function(){
    //Setup SDK for testing
    this.ticketing = new TickeTing({
      apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
      sandbox: true
    })
  })

  beforeEach(async function(){
    //Set test timeouts
    this.timeout(5000)
  })

  describe('Retrieve a list of countries', function () {
    it('Should return a list of strings', function () {
      return new Promise((resolve, reject) => {
        this.ticketing.presets.countries().then(countries => {
          expect(countries).to.be.an("array")
          expect(countries[Math.floor(Math.random() * countries.length)]).to.be.a("string")
          resolve(true)
        }).catch(error=>{
          reject(error)
        })
      })
    })
  })
})