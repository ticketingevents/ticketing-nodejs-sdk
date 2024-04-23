//Setup chai for assertions
let chai = require("chai")
let chaiAsPromised = require("chai-as-promised")

chai.use(chaiAsPromised)

export const assert = chai.assert
