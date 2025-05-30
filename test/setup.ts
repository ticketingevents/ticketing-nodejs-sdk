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

if(process.env.npm_config_env == "production"){
  sdk = new TickeTing({
    apiKey: "1f573b7f728ba805604b9b1453d56105",
    sandbox: false
  })

  public_sdk = new TickeTing({
    apiKey: "a7f945f4f6766447b4ceb05912803875",
    sandbox: false
  })

  adapter = new APIAdapter("1f573b7f728ba805604b9b1453d56105", false)
  public_adapter = new APIAdapter("a7f945f4f6766447b4ceb05912803875", false)
}else{
  sdk = new TickeTing({
    apiKey: "07b2f3b08810a4296ee19fc59dff48b0",
    sandbox: true
  })

  public_sdk = new TickeTing({
    apiKey: "586af812feea6665969d807ab34f4a82",
    sandbox: true
  })

  adapter = new APIAdapter("07b2f3b08810a4296ee19fc59dff48b0", true)
  public_adapter = new APIAdapter("586af812feea6665969d807ab34f4a82", true)
}

export const ticketing = sdk
export const public_ticketing = public_sdk
export const api = adapter
export const public_api = public_adapter