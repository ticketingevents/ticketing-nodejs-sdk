//Control execution order
import './admissions'

import { expect, ticketing } from '../setup'

describe("Presets", function(){
  describe('Retrieve a list of countries', function () {
    it('Should return a list of strings', function () {
      return new Promise((resolve, reject) => {
        ticketing.presets.countries().then(countries => {
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