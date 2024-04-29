//Control execution order
import './regions'

import { TickeTing } from '../../src'
import { expect } from '../setup'

describe("Presets", function(){
  before(function(){
    //Setup SDK for testing
    this.ticketing = new TickeTing({
      apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
      sandbox: true
    })
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