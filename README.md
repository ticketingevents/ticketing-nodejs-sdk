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
![NPM Version](https://img.shields.io/npm/v/@ticketingevents/ticketing-sdk)

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
  api_key: "API_KEY"
});

//Retrieve a collection of supported regions
ticketing.regions.list()
  .then(regions => {
    //Do something with the of region resources
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
  api_key: "SANDBOX_API_KEY",
  sandbox: true
});
```

# Usage

- [Collections](#collections)
  * [Filters](#filters)
    * [The ID Filter](#the-id-filter)
  * [Pagination](#pagination)
  * [Stacking operations](#stacking-operations)
- [Error handling](#error-handling)
- [Regions](#regions)
  * [List all regions](#list-all-regions)
  * [Add new region](#add-new-region)
  * [Fetch a region](#fetch-a-region)
  * [Update a region](#update-a-region)
  * [Delete a region](#delete-a-region)

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
will be thrown. Read the documentation for the collection you are working with to see its
supported criteria.

To filter a collection, call its <code>filter</code> method with an object containing your
desired criteria.

```javascript
//Filter region collection based on given criteria
let criteria = {
  //Some criteria
}

ticketing.regions.list()
  .filter(criteria)
  .then(regions => {
    //Do something with the matching region resource(s)
  })
  .catch(error => {
    if(error instanceof UnsupportedCriteriaError){
      //Handle unsupported criteria error
    }else{
      //Handle other errors
    }
  })
```
#### The ID Filter

Every collection supports a special <code>id</code> filter that allows a specific resource to be retrieved
from the collection. If the <code>id</code> filter is specified, all other filters are disregarded. If a
resource with the given <code>id</code> exists, it is returned. Otherwise a <code>ResourceNotFoundError</code>
is thrown.

```javascript
//Search for a specific region based on its ID
ticketing.regions.list()
  .filter({id: "19290238432215"})
  .then(region => {
    //Do something with the region resource
  })
  .catch(error => {
    if(error instanceof ResourceNotFoundError){
      //Handle resource not found error
    }else{
      //Handle other errors
    }
  })
```

### Pagination

Even after filtering a collection, there may still be a large number of matching resources
returned. Returning a large number of resources in a single request, particularly for complex
resources, can lead to large response payloads and long response times, which can slow down your application.

To help mitigate against these performance issues, collections support pagination, granting access
to a subset of the resources in the collection at a time. To paginate a collection, call its
<code>paginate</code> method, specifying your desired <code>pageLength</code>.

```javascript
  let paginatedCollection = ticketing.regions.list()
    .paginate(10) //pageLength of 10 resources. Defaults to 25 if no pageLength is specified.
```
Once you have paginated a collection you can use its access methods to page through its
resources as desired.

```javascript
  //Retrieve the first page of the collection
  paginatedCollection.first()
    .then(page => {
      //Do something with the page of resources
    })

  //Retrieve the last page of the collection
  paginatedCollection.last()
    .then(page => {
      //Do something with the page of resources
    })

  //Retrieve the next page of the collection
  paginatedCollection.next()
    .then(page => {
      //Do something with the page of resources
    })

  //Retrieve the previous page of the collection
  paginatedCollection.previous()
    .then(page => {
      //Do something with the page of resources
    })

  //Retrieve a specific page from the collection
  paginatedCollection.goto(3)
    .then(page => {
      //Do something with the page of resources
    })
```

Depending on the specified <code>pageLength</code> and number of resources in the collection,
a call to one of the above methods may reference a non-existant page. If a pagination method call
references a non-existant page a <code>PageAccessError</code> will be thrown.

```javascript
  let paginatedCollection = ticketing.regions.list()
    .paginate(10)
    .last()
    .next() // This call to next() will throw an error as we are already on the last page
    .then(regions => {
      //Do something with the matching region resource(s)
    })
    .catch(error => {
      if(error instanceof PageAccessError){
        //Handle non-existant page error
      }else{
        //Handle other errors
      }
    })
```

Paginated collections also offer several test properties and methods to determine the current pointer
location. This can help you avoid page access errors.

```javascript
  //Return the current page number
  console.log(paginatedCollection.current)

  //Return the number of available pages in the collection
  console.log(paginatedCollection.pages)

  //Test whether there are any more pages after the current one
  console.log(paginatedCollection.hasNext())

  //Test whether there are any more pages before the current one
  console.log(paginatedCollection.hasPrevious())
```

### Stacking operations

When working with collections you are likely to want to perform filter, sort and paginate operations in a
single statement. Collections support operation stacking to achieve this.

```javascript
//Filter collection based on criteria
let criteria = {
  //Filter criteria
}

ticketing.regions.list()
  .filter(criteria)
  .paginate(10)
  .first()
  .next()
  .then(regions => {
    //Do something with the page of matching region resource(s)
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

## Regions

This section documents the operations for managing regions supported by
the TickeTing platform (requires administrative access).

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
  //Search for a specific region using the special 'id' filter
  ticketing.regions.list()
    .filter({id: "19290238432215"})
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
  //Search for a specific region using the special 'id' filter
  region = await ticketing.regions.list().filter({id: "19290238432215"})

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
  //Search for a specific region using the special 'id' filter
  region = await ticketing.regions.list().filter({id: "19290238432215"})

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