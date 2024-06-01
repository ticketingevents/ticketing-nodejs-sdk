//Setup chai for assertions
let chai = require("chai")
chai.use(require('chai-things'))
chai.use(require("chai-as-promised"))
chai.use(require("chai-sorted"))

export const expect = chai.expect
