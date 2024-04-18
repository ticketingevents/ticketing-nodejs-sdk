setup(function(){
  //Setup chai for assertions
  let chai = require("chai")
  let chaiAsPromised = require("chai-as-promised")

  chai.use(chaiAsPromised)
  assert = chai.assert

  //Load necessary class definitions from SDK for testing
  let ticketingSDK = require("../src")
  TickeTing = ticketingSDK.TickeTing
  UnsupportedCriteriaError = ticketingSDK.UnsupportedCriteriaError
  ResourceNotFoundError = ticketingSDK.ResourceNotFoundError
  PageAccessError = ticketingSDK.PageAccessError
  BadDataError = ticketingSDK.BadDataError
  ResourceExistsError = ticketingSDK.ResourceExistsError

  //Setup instance of the TickeTing SDK
  ticketing = new TickeTing({
    api_key: "07b2f3b08810a4296ee19fc59dff48b0",
    sandbox: true
  })
})