import { TickeTing } from '../src'
import { APIAdapter } from  '../src/util'

const administratorKey = process.env.ADMINISTRATOR_KEY || '07b2f3b08810a4296ee19fc59dff48b0'
const publicKey = process.env.PUBLIC_KEY || '586af812feea6665969d807ab34f4a82'
const unauthorisedKey = process.env.UNAUTHORISED_KEY || '413c7e517b63822c3037ead7679c780e'

//Setup chai for assertions
let chai = require("chai")
chai.use(require('chai-string'))
chai.use(require('chai-things'))
chai.use(require("chai-as-promised"))
chai.use(require("chai-sorted"))
chai.use(require("chai-interface"))

export const expect = chai.expect

let sdk = null
let public_sdk = null
let adapter = null
let public_adapter = null
let unauthorised = null

sdk = new TickeTing({
  apiKey: administratorKey
})

public_sdk = new TickeTing({
  apiKey: publicKey
})

adapter = new APIAdapter(administratorKey)
public_adapter = new APIAdapter(publicKey)
unauthorised = new TickeTing({
  apiKey: unauthorisedKey
})

export const ticketing = sdk
export const public_ticketing = public_sdk
export const api = adapter
export const public_api = public_adapter
export const unauthorised_sdk = unauthorised