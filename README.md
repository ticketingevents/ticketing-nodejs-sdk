<div align="center">
  <h1>
    <br/>
    <a href="https://www.ticketingevents.com"><img src="https://bucket.mlcdn.com/a/1192/1192308/images/2519b476a349247dcde9ad6978e7af81812878a0.png" alt="TickeTing logo" width="200px"/></a>
    <br />
  </h1>
  <sup>
    <br />
    TickeTing Javascript SDK
    <br />
    <br />

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)
![NPM Version](https://img.shields.io/npm/v/@ticketing/ticketing-nodejs-sdk)

  </sup>
  <br />
</div>


# Installation

The TickeTing Javscript SDK is available as a public package via npm.

```bash
npm install @ticketingevents/ticketing-sdk
```

# Quick Start

TickeTing SDK functionality is made available through the TickeTing class. To
begin using the SDK, instantiate the class with your provided <code>API_KEY</code>. If you
have not yet been assigned an <code>API_KEY</code>, you can
<a target='_blank' href='mailto:dev@ticketingeventsevents.com' subject='RE: API Key Request'>
  request one
</a>
now.

```javascript
import TickeTing from '@ticketingevents/ticketing-sdk';

const ticketing = new TickeTing({
  apiKey: "API_KEY"
});

//Retrieve a collection of published events
ticketing.events.published.list()
  .then(events => {
    //Do something with the of event resources
  })
  .catch(error => {
    //Handle an error if necessary
    console.log(error.message)
  })
```
# Sandbox Mode

If you need to test your application before releasing to production, the TickeTing SDK
supports a sandbox mode. When in sandbox mode, the SDK will interface with the QA API, and
any changes you make won't affect the live TickeTing Platform. Note that you will
<a target='_blank' href='mailto:dev@ticketingevents.com' subject='RE: API Key Request'>
  need to request
</a>
a seperate <code>SANDBOX_API_KEY</code> to work in sandbox mode. To enter sandbox mode, instantiate the
TickeTing class with the <code>sandbox</code> argument set to <code>true</code>.

```javascript
const ticketing = new TickeTing({
  apiKey: "SANDBOX_API_KEY",
  sandbox: true
});
```

# Integrating with Angular

The TickeTing SDK can be converted into an Angular Service for easy injection into your
components, without having to repeatedly reinitialise the TickeTing instance. To use the SDK
as an Angular service simply adapt the code snippet below as appropriate.

```javascript
import { Injectable } from '@angular/core';
import { TickeTing } from '@ticketing/ticketing-nodejs-sdk'

@Injectable({
  providedIn: 'root'
})
export class TickeTingService extends TickeTing{
  constructor() {
    super({
      apiKey: "API_KEY"
    })
  }
}
```

# Usage

- [Collections](#collections)
  * [Filters](#filters)
    * [The ID Filter](#the-id-filter)
  * [Sorting](#sorting)
  * [Pagination](#pagination)
  * [Chaining operations](#chaining-operations)
- [Error handling](#error-handling)
- [Accounts](#accounts)
  * [List all accounts](#list-all-accounts)
  * [Register an account](#register-an-account)
  * [Fetch an account](#fetch-an-account)
  * [Update an account](#update-an-account)
  * [Delete an account](#delete-an-account)
  * [Fetch account preferences](#fetch-account-preferences)
  * [Update account preferences](#update-account-preferences)
- [Events](#events)
  * [List published events](#list-published-events)
  * [List all events](#list-all-events)
  * [Register an event](#register-an-event)
  * [Fetch an event](#fetch-an-event)
  * [Update an event](#update-an-event)
  * [Delete an event](#delete-an-event)
  * [Submit an event for review](#submit-an-event-for-review)
- [Categories](#categories)
  * [List event categories](#list-event-categories)
  * [Add new category](#add-new-category)
  * [Fetch a category](#fetch-a-category)
  * [Update a category](#update-a-category)
  * [Delete a category](#delete-a-category)
- [Regions](#regions)
  * [List all regions](#list-all-regions)
  * [Add new region](#add-new-region)
  * [Fetch a region](#fetch-a-region)
  * [Update a region](#update-a-region)
  * [Delete a region](#delete-a-region)
- [Venues](#venues)
  * [List event venues](#list-event-venues)
  * [Create an event venue](#create-an-event-venue)
  * [Fetch a venue](#fetch-a-venue)
  * [Update a venue](#update-a-venue)
  * [Delete an event venue](#delete-an-event-venue)
- [Presets](#presets)
  * [Retrieve a list of countries](#retrieve-a-list-of-countries)

## Collections

When you request a list of resources, the TickeTing SDK returns a collection.

```javascript
//Retrieve a collection of supported regions
let regionCollection = ticketing.regions.list()

//Access the resources in the collection
regionCollection.then(regions => {
  //Do something with the region resource(s)
})
```

Collections are Promises that allow you to filter, sort and page through the potentially thousands of 
resources the API can return in response to a request, while reducing bandwidth and
response times. In this section you will learn how to manipulate collections to
get at the resources you are interested in.

### Filters

A list query can potentially return thousands of results, and working with such a large
array can be cumbersome and time consuming. To help make working with lists more tractable,
you can filter collections based on selected criteria to narrow down the resources returned.

The criteria you can filter by will be dependent on the collection you are working with. If
you filter a collection based on unsupported criteria, an <code>UnsupportedCriteriaError</code>
will be thrown when you attempt to resolve the collection. Read the documentation for the
collection you are working with to see its supported criteria.

To filter a collection, call its <code>filter</code> method with an object containing your
desired criteria.

```javascript
//Filter event collection based on given criteria
let criteria = {
  region: 19290238432215,
  title: "Dawn of the Seven Premier"
}

ticketing.events.published.list()
  .filter(criteria)
  .then(events => {
    //Do something with the matching event resource(s)
  })
  .catch(error => {
    if(error instanceof UnsupportedCriteriaError){
      //Handle unsupported criteria error
    }else{
      //Handle other errors
    }
  })
```

### Sorting

For very large collections, sorting client-side can incur significant overhead and make
pagination challenging. To aid in this, collections can be pre-sorted so that results are
returned in a preferred order based on one of the resource's fields. 

The fields you can sort by will be dependent on the collection you are working with. If
you sort a collection based on an unsupported field, an <code>UnsupportedSortError</code>
will be thrown when you attempt to resolve the collection. Read the documentation for the
collection you are working with to see its supported sort fields.

To sort a collection, call its <code>sort</code> method. This function accepts two arguments,
a string representing the resource field by which to sort the collection, and a boolean specifying
whether to return the results in ascending or descending order (this parameter is optional, and
results are sorted in ascending order by default).

```javascript
//Sort event collection in descending order of popularity
ticketing.events.published.list()
  .sort("popularity", false)
  .then(events => {
    //Do something with the matching event resource(s)
  })
  .catch(error => {
    if(error instanceof UnsupportedSortError){
      //Handle unsupported sort field error
    }else{
      //Handle other errors
    }
  })
```

### Pagination

Even after filtering a collection, there may still be a large number of matching resources
returned. Returning a large number of resources in a single request, particularly for complex
resources, can lead to large response payloads and long response times, which can slow down your application.

To help mitigate against these performance issues, collections do not return return all matching resources when
resolved, instead returning a subset, or page, at a time. Collections are paginated based on the 
<code>pageLength</code> specified when they are created. Collections default to a <code>pageLength</code> of
25 if a custom value is not specified.

```javascript
  let collection = ticketing.venues.list(10) //Will return 10 resources at a time when resolved
```
You can use a collection's pagination access methods to page back and forth through its resources as desired.

```javascript
  //Retrieve the first page of the collection
  collection.first()
    .then(resources => {
      //Do something with the page of resources
    })

  //Retrieve the last page of the collection
  collection.last()
    .then(resources => {
      //Do something with the page of resources
    })

  //Retrieve the next page of the collection
  collection.next()
    .then(resources => {
      //Do something with the page of resources
    })

  //Retrieve the previous page of the collection
  collection.previous()
    .then(resources => {
      //Do something with the page of resources
    })

  //Retrieve a specific page from the collection
  collection.goto(3)
    .then(resources => {
      //Do something with the page of resources
    })
```

Depending on the specified <code>pageLength</code> and number of resources in the collection,
a call to one of the above methods may cause the collection to reference a non-existant page.
If a collection ends up internally referencing a non-existant page, a <code>PageAccessError</code>
will be thrown when the collection is resolved.

```javascript
  let collection = ticketing.venues.list(10)
    .last()
    .next() // This call to next() will cause the collection to reference a non-existant page
    .then(venues => {
      //Do something with the matching venue resource(s)
    })
    .catch(error => {
      if(error instanceof PageAccessError){ //A PageAccessError is thrown when we attempt to resolve the collection
        //Handle non-existant page error
      }else{
        //Handle other errors
      }
    })
```

Collections also offer several test properties and methods to determine the current page reference. This can help you
avoid page access errors.

```javascript
  //Return the current page number
  console.log(await collection.current)

  //Return the number of available pages in the collection
  console.log(await collection.pages)

  //Test whether there are any more pages after the current one
  console.log(await collection.hasNext())

  //Test whether there are any more pages before the current one
  console.log(await collection.hasPrevious())
```

### Chaining operations

When working with collections you are likely to want to perform filter, sort and pagination operations in a
single statement. Collections support operation chaining to achieve this.

```javascript
//Filter collection based on criteria
let criteria = {
  region: 19290238432215
}

ticketing.venues.list(10)
  .filter(criteria)
  .first()
  .next()
  .then(venues => {
    //Do something with the page of matching venue resource(s)
  })
  .catch(error => {
    if(error instanceof UnsupportedCriteriaError){
      //Handle unsupported criteria error
    }else if(error instanceof PageAccessError){
      //Handle non-existant page error
    }else{
      //Handle other errors
    }
  })
```

## Error handling

All TickeTing SDK methods return a Promise-like object with support for the Promise <code>then</code>,
<code>catch</code>, <code>finally</code> syntax. If anything goes wrong during the execution of a request,
the method will pass an instance of a TickeTing Error class to the registered <code>catch</code>
callback.

Each TickeTing Error instance has a unique type, and provides an error message, and an HTTP Error Code
(where applicable). This allows your application to respond to different errors as required.

```javascript
  import TickeTing, PageAccessError from '@ticketingevents/ticketing-sdk';

  ticketing.regions.list()
    .last()
    .next()
    .then(regions => {
      //Do something with the page of matching region resource(s)
    })
    .catch(error => {
      if(error instanceof PageAccessError){
        console.log(error.message)
      }else if(error.code == 404){
        console.log("Page not found")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

## Accounts

Operations for registering and managing TickeTing user accounts and their
preferences.

### List all accounts

[API Reference](https://ticketing.redoc.ly/tag/Account-Management#operation/list_accounts)

```javascript
  ticketing.accounts.list()
    // Supported filters with examples
    .filter({
      number: "MO-6A39EE8D",
      email: "marvin.milk@usmc.gov",
      username: "mothers.milk"
    })
    .then(accounts => {
      //Do something with the collection of accounts
    })
    .catch(error => {
      //Handle errors
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    })
```

### Register an account

[API Reference](https://ticketing.redoc.ly/tag/Account-Management#operation/create_account)

```javascript
  let accountData = {
    "username": "mothers.milk", //Required
    "password": "WuT4NGcl4n", //Required
    "email": "marvin.milk@usmc.gov", //Required
    "firstName": "Marvin",
    "lastName": "Milk",
    "title": "Mr",
    "dateOfBirth": "1974-09-14",
    "phone": "+1 (268) 555 0123",
    "country": "Antigua and Barbuda",
    "firstAddressLine": "Jennings New Extension",
    "secondAddressLine": "",
    "city": "Jennings",
    "state": "Saint Mary's"
  }

  ticketing.accounts.create(accountData)
    .then(account => {
      //Do something with the new account resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log(error.message)
      }else if(error instanceof ResourceExistsError){
        console.log("A user identified by the given username or email address already exists.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Fetch an account

[API Reference](https://ticketing.redoc.ly/tag/Account-Management#operation/retrieve_account)

```javascript
  //Retrieve a specific account using its account number
  ticketing.accounts.find("MO-6A39EE8D")
    .then(account => {
      //Do something with the account resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundError){
        console.log("There is no account with the given number")
      }else if(error instanceof PermissionError){
        console.log("You are not authorised to access or modify this account.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Update an account

[API Reference](https://ticketing.redoc.ly/tag/Account-Management#operation/update_account)

```javascript
  //Retrieve a specific account using its account number
  account = await ticketing.accounts.find("MO-6A39EE8D")

  //Make changes to the resource
  account.title = "Dr."
  account.firstAddressLine = "New Name"

  //Save changes
  account.save().then(saved => {
    if(saved){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log(error.message)
    }else if(error instanceof PermissionError){
      console.log("You are not authorised to access or modify this account.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Delete an account

[API Reference](https://ticketing.redoc.ly/tag/Account-Management#operation/delete_account)

```javascript
  //Retrieve a specific account using its account number
  account = await ticketing.accounts.find("MO-6A39EE8D")

  //Delete the account
  account.delete().then(deleted => {
    if(deleted){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof ResourceIndelibleError){
      //The account cannot be deleted as it holds active tickets
      console.log(error.message)
    }else if(error instanceof PermissionError){
      console.log("You are not authorised to access or modify this account.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Fetch account preferences

[API Reference](https://ticketing.redoc.ly/tag/Account-Management#operation/retrieve_account_preferences)

```javascript
  //Retrieve a specific account using its account number
  account = await ticketing.accounts.find("MO-6A39EE8D")

  //Retrieve a specific account using its account number
  ticketing.accounts.preferences
    .then(preferences => {
      //Do something with the account preferences resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundError){
        console.log("There is no account with the given number")
      }else if(error instanceof PermissionError){
        console.log("You are not authorised to access this account.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Update account preferences

[API Reference](https://ticketing.redoc.ly/tag/Account-Management#operation/update_account_preferences)

```javascript
  //Retrieve a specific account using its account number
  account = await ticketing.accounts.find("MO-6A39EE8D")

  //Retrieve the account preferences
  preferences = await account.preferences

  //Make changes to the preferences
  let preferredRegion = await ticketing.regions.find(19290238432215)
  preferences.region = preferredRegion //Required

  //Save changes
  preferences.save().then(saved => {
    if(saved){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log(error.message)
    }else if(error instanceof PermissionError){
      console.log("You are not authorised to access or modify this account.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```


## Events

Operations for working with events in the TickeTing system.

### List published events

[API Reference](https://ticketing.redoc.ly/tag/Working-with-Events#operation/list_published_events)

```javascript
  ticketing.events.published.list()
    // Supported filters with examples
    .filter({
      region: 19290238432215,
      title: "Dawn of the Seven Premier"
    })
    // Supported sort fields
    .sort(
      "alphabetical", //One of "alphabetical" "published" "popularity" "start"
      true //Set true for ascending sort (default), or false for descending order
    )
    .then(events => {
      //Do something with the collection of events
    })
    .catch(error => {
      //Handle errors
      if(error instanceof UnsupportedCriteriaError){
        //Handle unsupported criteria error
      }else if(error instanceof UnsupportedSortError){
        //Handle unsupported sort field error
      }else if(error instanceof PageAccessError){
        //Handle non-existant page error
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })

    // List upcoming events (earliest event first)
    ticketing.events.published.list().sort("start").then(upcoming=>{})

    // List popular events (most popular first)
    ticketing.events.published.list().sort("popularity", false).then(popular=>{})

    // List new events (newest first)
    ticketing.events.published.list().sort("published", false).then(newest=>{})
```

### List all events (Admin Only)

[API Reference](https://ticketing.redoc.ly/tag/Working-with-Events#operation/list_events)

```javascript
  ticketing.events.list()
    // Supported filters with examples
    .filter({
      region: 19290238432215,
      host: 16951985851389,
      title: "Dawn of the Seven Premier",
      status: "Scheduled",
      active: true,
      public: false,
      section: 16993964783416
    })
    // Supported sort fields
    .sort(
      "published", //One of "alphabetical" "published" "popularity" "start"
      false //Set true for ascending sort (default), or false for descending order
    )
    .then(events => {
      //Do something with the collection of events
    })
    .catch(error => {
      //Handle errors
      if(error instanceof UnsupportedCriteriaError){
        //Handle unsupported criteria error
      }else if(error instanceof UnsupportedSortError){
        //Handle unsupported sort field error
      }else if(error instanceof PageAccessError){
        //Handle non-existant page error
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Register an event

[API Reference](https://ticketing.redoc.ly/tag/Working-with-Events#operation/register_event)

```javascript
  let venue = await ticketing.venues.find(16878146473429)

  let eventData = {
    "host": "16951985851389", //Required
    "title": "Dawn of the Seven Premier", //Required
    "description": "World Premier of the long ....", //Required
    "type": "Standard", //Required
    "public": true, //Required
    "category": "/categories/16878141745207", //Required
    "subcategory": "Premier", //Required
    "venue": venue, //Required
    "start": "2024-06-07T20:00",
    "end": "2024-06-07T23:00",
    "disclaimer": "Attend at your own risk",
    "tags": ["homelander", "queen maeve", "the deep", "A-Train"],
    "banner": "data:image/png;base64,iVBORw0KGgoAAAA...",
    "thumbnail": "data:image/png;base64,iVBORw0KGgoA..."
  }

  ticketing.events.create(eventData)
    .then(event => {
      //Do something with the created event resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log(error.message)
      }else if(error instanceof ResourceNotFoundError){
        console.log("The specified event host does not exist.")
      }else if(error instanceof PermissionError){
        console.log("You are not authorised to manage events on behalf of this host.")
      }else if(error instanceof ResourceExistsError){
        console.log("An event with the given name already exists.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Fetch an event

[API Reference](https://ticketing.redoc.ly/tag/Working-with-Events#operation/retrieve_event)

```javascript
  //Retrieve a specific event using its ID
  ticketing.events.find(16993717817996)
    .then(event => {
      //Do something with the event resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundError){
        console.log("There is no event with the given ID")
      }else if(error instanceof PermissionError){
        console.log("You are not authorised to access this unlisted event.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Update an event

[API Reference](https://ticketing.redoc.ly/tag/Working-with-Events#operation/update_event)

```javascript
  //Retrieve a specific event using its ID
  event = await ticketing.events.find(16993717817996)

  //Make changes to the resource
  event.public = false
  event.end = "2025-09-07T23:00"

  //Save changes
  event.save().then(saved => {
    if(saved){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log(error.message)
    }else if(error instanceof PermissionError){
        console.log("You are not authorised to manage events on behalf of this host.")
    }else if(error instanceof ResourceExistsError){
      console.log("An event with the given name already exists.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Delete an event

[API Reference](https://ticketing.redoc.ly/tag/Working-with-Events#operation/delete_event)

```javascript
  //Retrieve a specific event using its ID
  event = await ticketing.events.find(16993717817996)

  //Delete the event
  event.delete().then(deleted => {
    if(deleted){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof PermissionError){
      console.log("You are not authorised to manage events on behalf of this host.")
    }else if(error instanceof ResourceIndelibleError){
      console.log("The event has active sections which must be deleted first.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Submit an event for review

[API Reference](https://ticketing.redoc.ly/tag/Working-with-Events#operation/submit_event)

```javascript
  //Retrieve a specific event using its ID
  event = await ticketing.events.find(16993717817996)

  //Delete the event
  event.submit().then(submitted => {
    if(submitted){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof PermissionError){
      console.log("You are not authorised to manage events on behalf of this host.")
    }else if(error instanceof InvalidStateError){
      console.log("The event has already been submitted or cancelled.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```


## Categories

Operations for managing the categories under which events can be classified
(requires administrative access).

### List event categories

[API Reference](https://ticketing.redoc.ly/tag/Category-Management#operation/list_categories)

```javascript
  ticketing.categories.list()
    .then(categories => {
      //Do something with the collection of categories
    })
    .catch(error => {
      //Handle errors
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    })
```

### Add new category

[API Reference](https://ticketing.redoc.ly/tag/Category-Management#operation/create_category)

```javascript
  let categoryData = {
    "name": "Fete", //Required
    "subcategories": ["All Inclusive", "Drinks Inclusive", "Cooler"] //Optional
  }

  ticketing.categories.create(categoryData)
    .then(category => {
      //Do something with the created category resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log(error.message)
      }else if(error instanceof ResourceExistsError){
        console.log("A category with the given name already exists.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Fetch a category

[API Reference](https://ticketing.redoc.ly/tag/Category-Management#operation/retrieve_category)

```javascript
  //Retrieve a specific category using its ID
  ticketing.categories.find(17325458293736)
    .then(category => {
      //Do something with the category resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundError){
        console.log("There is no category with the given ID")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Update a category

[API Reference](https://ticketing.redoc.ly/tag/Category-Management#operation/update_category)

```javascript
  //Retrieve a specific category using its ID
  category = await ticketing.categories.find(17325458293736)

  //Make changes to the resource
  category.name = "Inclusive Fete"
  category.subcategories = ["All Inclusive", "Drinks Inclusive"]

  //Save changes
  category.save().then(saved => {
    if(saved){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log(error.message)
    }else if(error instanceof ResourceExistsError){
      console.log("A category with the given name already exists.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Delete a category

[API Reference](https://ticketing.redoc.ly/tag/Category-Management#operation/delete_category)

```javascript
  //Retrieve a specific category using its ID
  category = await ticketing.categories.find(19290238432215)

  //Delete the category
  category.delete().then(deleted => {
    if(deleted){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof ResourceIndelibleError){
      //The category cannot be deleted as it is in use
      console.log(error.message)
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```


## Regions

Operations for managing regions supported by the TickeTing platform
(requires administrative access).

### List all regions

[API Reference](https://ticketing.redoc.ly/tag/Region-Management#operation/list_regions)

```javascript
  ticketing.regions.list()
    .then(regions => {
      //Do something with the collection of regions
    })
    .catch(error => {
      //Handle errors
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    })
```

### Add new region

[API Reference](https://ticketing.redoc.ly/tag/Region-Management#operation/add_region)

```javascript
  let regionData = {
    "name": "Antigua and Barbuda", //Required
    "country": "Antigua and Barbuda", //Required
    "district": "Saint Paul", //Optional
    "city": "English Harbour" //Optional
  }

  ticketing.regions.create(regionData)
    .then(region => {
      //Do something with the created region resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log(error.message)
      }else if(error instanceof ResourceExistsError){
        console.log("A region with the given name already exists.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Fetch a region

[API Reference](https://ticketing.redoc.ly/tag/Region-Management#operation/retrieve_region)

```javascript
  //Retrieve a specific region using its ID
  ticketing.regions.find(19290238432215)
    .then(region => {
      //Do something with the region resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundError){
        console.log("There is no region with the given ID")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Update a region

[API Reference](https://ticketing.redoc.ly/tag/Region-Management#operation/update_region)

```javascript
  //Retrieve a specific region using its ID
  region = await ticketing.regions.find(19290238432215)

  //Make changes to the resource
  region.name = "New Name"
  region.district = "New District"

  //Save changes
  region.save().then(saved => {
    if(saved){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log(error.message)
    }else if(error instanceof ResourceExistsError){
      console.log("A region with the given name already exists.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Delete a region

[API Reference](https://ticketing.redoc.ly/tag/Region-Management#operation/remove_region)

```javascript
  //Retrieve a specific region using its ID
  region = await ticketing.regions.find(19290238432215)

  //Delete the region
  region.delete().then(deleted => {
    if(deleted){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof ResourceIndelibleError){
      //The region cannot be deleted as it is in use
      console.log(error.message)
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

## Venues

Operations for managing the venues at which event can be staged 
(requires administrative access).

### List event venues

[API Reference](https://ticketing.redoc.ly/tag/Venue-Management#operation/list_venues)

```javascript
  ticketing.venues.list()
    // Supported filters with examples
    .filter({region: 19290238432215})
    .then(venues => {
      //Do something with the collection of venues
    })
    .catch(error => {
      //Handle errors
      if(error instanceof UnsupportedCriteriaError){
        //Handle unsupported criteria error
      }else if(error instanceof PageAccessError){
        //Handle non-existant page error
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Create an event venue

[API Reference](https://ticketing.redoc.ly/tag/Venue-Management#operation/create_venue)

```javascript
  let region = await ticketing.regions.find(19290238432215)

  let venueData = {
    "name": "Vought Tower", //Required
    "region": region, //Required
    "longitude": -73.99214, //Required
    "latitude": 40.75518, //Required
    "address": "7th Ave, Manhattan, New York" //Required
  }

  ticketing.venues.create(venueData)
    .then(venue => {
      //Do something with the created venue resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log(error.message)
      }else if(error instanceof ResourceExistsError){
        console.log("A region with the given name already exists.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Fetch a venue

[API Reference](https://ticketing.redoc.ly/tag/Venue-Management#operation/retrieve_venue)

```javascript
  //Retrieve a specific venue using its ID
  ticketing.venues.find(16878146473429)
    .then(venue => {
      //Do something with the venue resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundError){
        console.log("There is no venue with the given ID")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Update a venue

[API Reference](https://ticketing.redoc.ly/tag/Venue-Management#operation/update_venue)

```javascript
  //Retrieve a specific venue using its ID
  venue = await ticketing.venues.find(16878146473429)

  //Make changes to the resource
  venue.name = "New Name"
  venue.address = "#1 High St., St. John's"

  //Save changes
  venue.save().then(saved => {
    if(saved){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log(error.message)
    }else if(error instanceof ResourceExistsError){
      console.log("A region with the given name already exists.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Delete an event venue

[API Reference](https://ticketing.redoc.ly/tag/Venue-Management#operation/delete_venue)

```javascript
  //Retrieve a specific venue using its ID
  venue = await ticketing.venues.find(16878146473429)

  //Delete the venue
  venue.delete().then(deleted => {
    if(deleted){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof ResourceIndelibleError){
      console.log("The venue is currently hosting, or has staged, one or more events.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```



## Presets

Retrieve lists of pre-defined values for use in creating events, hosts, venues and
other TickeTing resources. NB: Unlike collections returned by the list() function,
preset collections cannot be filtered, sorted or paginated.

### Retrieve a list of countries

[API Reference](https://ticketing.redoc.ly/tag/Default-Values#operation/retrieve_countries)

```javascript
  ticketing.presets.countries()
    .then(countries => {
      //Do something with the list of countries
    })
    .catch(error => {
      //Handle errors
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    })
```