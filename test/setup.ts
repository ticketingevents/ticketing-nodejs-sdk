import { TickeTing } from '../src'
import { APIAdapter } from  '../src/util'

//Setup chai for assertions
let chai = require("chai")
chai.use(require('chai-things'))
chai.use(require("chai-as-promised"))
chai.use(require("chai-sorted"))

export const expect = chai.expect

let sdk = null
let public_sdk = null
let adapter = null
let public_adapter = null

sdk = new TickeTing({
  apiKey: "07b2f3b08810a4296ee19fc59dff48b0"
})

public_sdk = new TickeTing({
  apiKey: "586af812feea6665969d807ab34f4a82"
})

adapter = new APIAdapter("07b2f3b08810a4296ee19fc59dff48b0")
public_adapter = new APIAdapter("586af812feea6665969d807ab34f4a82")

export const ticketing = sdk
export const public_ticketing = public_sdk
export const api = adapter
export const public_api = public_adapter