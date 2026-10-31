//Control execution order
import './event_management'

import { TickeTing, EventRevision, BadDataError, PermissionError, ResourceExistsError, ResourceNotFoundError } from '../../src'
import { FormModel } from  '../../src/model'
import { Collection } from  '../../src/util'
import { expect, ticketing, api, unauthorised_sdk } from '../setup'

//Global resource objects
let testForm = null

describe("Form Management", function(){

  //Set hook timeout
  this.timeout(60000)

  before(async function(){
    //Create an event host
    this.host = await ticketing.hosts.create({
      name: "Host "+Math.floor(Math.random() * 999999),
      contact: "Jane Doe",
      email: "jane@eventhost.com"
    })

    //Initialise form data for suite
    this.testFormData = {
	    "name": "Meal Preferences "+Math.floor(Math.random() * 999999),
	    "description": "Provide information on any dietary requirements or allergens.",
	    "fields": [{
	      "name": "Allergies",
	      "type": "short_text",
	      "required": true
	    }]
    }

    //Create second form to test duplicate name handling
    this.secondForm = await this.host.forms.create({
  		"name": "Meal Preferences "+Math.floor(Math.random() * 999999),
  		"description": "Provide information on any dietary requirements or allergens.",
  		"fields": [{
    		"name": "Allergies",
    		"type": "short_text",
    		"required": true
  		}]
  	})
  })

  after(async function(){
  	await this.secondForm.delete()
    await this.host.delete()
  })

  describe('Create a form', function () {
    it('Should return a valid Form object', function () {
      return new Promise((resolve, reject) => {
        this.host.forms.create(this.testFormData).then((form => {
	        testForm = form

	        expect(form).to.be.an.instanceof(FormModel)
	        expect(form.name).to.eq(this.testFormData.name)
	        expect(form.description).to.eq(this.testFormData.description)

	        expect(form.fields.length).to.eq(this.testFormData.fields.length)
	        for(let i=0; i < form.fields.length; i++){
	            expect(form.fields[i]).to.eql(this.testFormData.fields[i])
	        }

	        resolve(true)
        })).catch(error=>{
			reject(error)
        })
      })
    })

    it('Should throw a BadDataError if invalid field data is passed in', function () {
		return expect(this.host.forms.create({
			"name": "Meal Preferences",
			"description": "Provide information on any dietary requirements or allergens.",
			"fields": [{
				"name": "Allergies",
				"type": "single_select",
				"required": true
			}]
		}))
		.to.eventually.be.rejectedWith("One or more fields in your request payload is invalid.")
		.and.be.an.instanceOf(BadDataError)
	})

    it('Should throw a ResourceExistsError if a duplicate name is submitted', function () {
      return expect(this.host.forms.create(this.testFormData))
      .to.eventually.be.rejectedWith("Creating the requested Form would violate uniqueness constraints.")
      .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('List forms', function () {
    it('Should return a collection of Form resources', function () {
      return expect(this.host.forms.list()).eventually.to.all.be.instanceof(FormModel)
    })

    it('Should contain the newly created form as its first resource', function () {
      return new Promise((resolve, reject) => {
        this.host.forms.list(1).next().then(forms => {
          expect(forms[0]).to.be.an.instanceof(FormModel)
          expect(forms[0].name).to.eq(this.testFormData.name)
          expect(forms[0].description).to.eq(this.testFormData.description)

	        expect(forms[0].fields.length).to.eq(this.testFormData.fields.length)
	        for(let i=0; i < forms[0].fields.length; i++){
	            expect(forms[0].fields[i]).to.eql(this.testFormData.fields[i])
	        }

	        resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    })
  })

  describe('Fetch a form', function () {
    it('Should return the identified Form resource', function () {
      return new Promise((resolve, reject) => {
        this.host.forms.find(testForm.id).then(form => {
			expect(form).to.be.an.instanceof(FormModel)
			expect(form.name).to.eq(this.testFormData.name)
			expect(form.description).to.eq(this.testFormData.description)

			expect(form.fields.length).to.eq(this.testFormData.fields.length)
			for(let i=0; i < form.fields.length; i++){
				expect(form.fields[i]).to.eql(this.testFormData.fields[i])
			}

	        resolve(true)
        }).catch(error => {
			reject(error)
        })
      })
    })

    it('Should throw a ResourceNotFoundError when using a non-existant ID', function () {
      return expect(this.host.forms.find(12345678901234))
        .to.eventually.be.rejectedWith("There is presently no form with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })

  describe('Update a form', function () {
    it('Should save the changes made to the form', function () {
		return new Promise((resolve, reject) => {
		//Make changes to the form
		testForm.name = "Dietary Requirements"

		let fields = testForm.fields
		fields[0].name = "Allergens"
		fields.push({
		    name: "Milk Preference",
		    type: "short_text",
		    required: false
		})

		//Save changes
		testForm.save().then(saved => {
			expect(saved).to.be.true
			resolve(true)
		}).catch(error => {
			reject(error)
		})
      })
    })

    it('Should persist form changes', function () {
      return new Promise((resolve, reject) => {
        this.host.forms.find(testForm.id).then(form => {
			expect(form.name).to.equal("Dietary Requirements")

			let fields = form.fields			          
			expect(fields).to.have.a.lengthOf(2)
			expect(fields[0]).to.have.property("name", "Allergens")
			expect(fields[1]).to.have.property("name", "Milk Preference")

			resolve(true)
        }).catch(error => {
			reject(error)
        })
      })
    })

    it('Should throw a BadDataError if required fields are missing', function () {
      //Make invalid changes to the event
      testForm.name = ""

      return expect(testForm.save())
        .to.eventually.be.rejectedWith("Your request payload is invalid. Please ensure you have included all required fields and values are well-formed.")
        .and.be.an.instanceOf(BadDataError)
    })

    it('Should throw a ResourceExistsError if a duplicate name is submitted', function () {
      //Make invalid changes to the event
      testForm.name = this.secondForm.name

      return expect(testForm.save())
        .to.eventually.be.rejectedWith("Creating the requested form would violate uniqueness constraints.")
        .and.be.an.instanceOf(ResourceExistsError)
    })
  })

  describe('Delete a form', function () {
    it('Should delete the form from the system', function () {
      return expect(testForm.delete()).to.eventually.be.true
    })

    it('Form should no longer be retrievable', function () {
      return expect(this.host.forms.find(testForm.id))
        .to.eventually.be.rejectedWith("There is presently no form with the given URI.")
        .and.be.an.instanceOf(ResourceNotFoundError)
    })
  })
})