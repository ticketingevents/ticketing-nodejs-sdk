import { TickeTing } from '../src'
import { APIAdapter } from  '../src/util'

//Setup chai for assertions
let chai = require("chai")
chai.use(require('chai-things'))
chai.use(require("chai-as-promised"))
chai.use(require("chai-sorted"))

export const expect = chai.expect

let sdk = null
let adapter = null

if(process.env.npm_config_env == "production"){
  sdk = new TickeTing({
    apiKey: "1f573b7f728ba805604b9b1453d56105",
    sandbox: false
  })

  adapter = new APIAdapter("1f573b7f728ba805604b9b1453d56105", false)
}else{
  sdk = new TickeTing({
    apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
    sandbox: true
  })

  adapter = new APIAdapter("07b2f3b08810a4296ee19fc59dff48b0", true)
}

export const ticketing = sdk
export const api = adapter