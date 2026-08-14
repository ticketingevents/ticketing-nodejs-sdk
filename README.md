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
npm install @ticketing/ticketing-nodejs-sdk
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
# UAT Environment

If you need to test your application before releasing to production, there is a published
version of the TickeTing SDK built against its UAT environment. This version of the SDK
does not interface with the Production API, and any changes you make won't affect the live
TickeTing Platform. Note that you will
<a target='_blank' href='mailto:dev@ticketingevents.com' subject='RE: API Key Request'>
  need to request
</a>
a seperate <code>UAT_API_KEY</code> to work with this version of the SDK. The UAT version
of the SDK can be installed as follows:

```bash
npm install @ticketing/ticketing-nodejs-sdk@uat
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
- [Request Caching](#request-caching)
    * [Enable caching](#enable-caching)
    * [How caching behaves](#how-caching-behaves)
    * [Cache options](#cache-options)
    * [Force cache or bypass per call](#force-cache-or-bypass-per-call)
    * [Persistence](#cache-persistence)
    * [Custom persistence adapters](#custom-persistence-adapters)
    * [Manual cache control](#manual-cache-control)
- [Session Management](#sessions)
    * [Start a new session](#start-a-new-session)
    * [Resume an active session](#resume-an-active-session)
    * [End a session](#end-a-session)
    * [Retrieve session information](#retrieve-session-information)
- [Accounts](#accounts)
    * [List all accounts](#list-all-accounts)
    * [Register an account](#register-an-account)
    * [Fetch an account](#fetch-an-account)
    * [Update an account](#update-an-account)
    * [Delete an account](#delete-an-account)
    * [Verify an account](#verify-an-account)
    * [Deactivate an account](#deactivate-an-account)
    * [Fetch account preferences](#fetch-account-preferences)
    * [Update account preferences](#update-account-preferences)
    * [Reset account password](#reset-account-password)
    * [Lookup an account](#lookup-an-account)
- [Account Privileges](#account-privileges)
    * [List account privileges](#list-account-privileges)
    * [Retrieve privileged hosts](#retrieve-managed-hosts)
- [Account Resources](#account-resources)
    * [Retrieve event itinerary](#retrieve-event-itinerary)
    * [Retrieve ticket wallet](#retrieve-ticket-wallet)
    * [Retrieve transfer history](#retrieve-transfer-history)
- [Hosts](#hosts)
    * [List event hosts](#list-event-hosts)
    * [Create an event host](#create-an-event-host)
    * [Fetch an event host](#fetch-an-event-host)
    * [Update an event host](#update-an-event-host)
    * [Delete an event host](#delete-an-event-host)
    * [List privileges](#list-privileges)
    * [Grant a privilege](#grant-a-privilege)
    * [Fetch a privilege](#fetch-a-privilege)
    * [Update a privilege](#update-a-privilege)
    * [Revoke a privilege](#revoke-a-privilege)
- [Event Management](#event-management)
    * [List events](#list-events)
    * [Register an event](#register-an-event)
    * [Fetch an event](#fetch-an-event)
    * [Update an event](#update-an-event)
    * [Delete an event](#delete-an-event)
    * [List event submissions](#list-event-submissions)
    * [Submit event for review](#submit-event-for-review)
    * [List event publications](#list-event-publications)
    * [Publish event changes](#publish-event-changes)
- [Tier Management](#tier-management)
    * [List tiers](#list-tiers)
    * [Create a tier](#create-a-tier)
    * [Fetch a tier](#fetch-a-tier)
    * [Update a tier](#update-a-tier)
    * [Delete a tier](#delete-a-tier)
- [Event Listings](#event-listings)
    * [Search event listings](#search-event-listings)
    * [Fetch an event listing](#fetch-an-event-listing)
    * [List event tiers](#list-event-tiers)
- [Purchasing Tickets](#purchasing-tickets)
    * [Create a shopping cart](#create-a-shopping-cart)
    * [Add items to cart](#add-items-to-cart)
    * [Remove items from cart](#remove-items-from-cart)
    * [Set item quantity in cart](#set-item-quantity-in-cart)
    * [Checkout cart](#checkout-cart)
- [Order Settlement](#order-settlement)
    * [List orders](#list-orders)
    * [Fetch an order](#retrieve-an-order)
    * [Cancel an order](#cancel-an-order)
    * [Settle an order](#settle-an-order)
- [Reporting](#reporting)
    * [List host sales](#list-host-sales)
    * [Fetch host statistics](#fetch-host-statistics)
    * [List event sales](#list-event-sales)
    * [Fetch event statistics](#fetch-event-statistics)
- [Transferring Tickets](#transferring-tickets)
    * [Initiate a transfer](#initiate-a-transfer)
    * [Add tickets to a transfer](#add-tickets-to-a-transfer)
    * [Remove tickets from a transfer](#remove-tickets-from-a-transfer)
    * [Set tickets to be transferred](#set-tickets-to-be-transferred)
    * [Send a transfer](#send-a-transfer)
    * [Fetch a transfer](#fetch-a-transfer)
    * [Cancel a transfer](#cancel-a-transfer)
    * [Claim a transfer](#claim-a-transfer)
- [Admissions](#admissions)
    * [Admissions tokens](#admissions-tokens)
        * [List admissions tokens](#list-admissions-tokens)
        * [Issue admissions token](#issue-admissions-token)
        * [Update admissions token sections](#update-admissions-token-sections)
        * [Invalidate an admissions token](#invalidate-an-admissions-token)
    * [Admitting patrons](#admitting-patrons)
        * [Start admission session](#start-admission-session)
        * [List valid tickets](#list-valid-tickets)
        * [Grant admission to event](#grant-admission-to-event)
        * [List event admissions](#list-admissions-to-event)
        * [End admission session](#end-admission-session)
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
- [Content Review](#reviewing-content)
    * [List submissions](#list-submissions)
    * [Fetch a submission](#fetch-a-submission)
    * [Decide on a submission](#decide-on-a-submission)
    * [Fetch submission decision](#fetch-a-submission-decision)

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
    .first()
    .previous() // This call to next() will cause the collection to reference a non-existant page
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

  //Return the number of total elements in the collection
  console.log(await collection.total)

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
    .first()
    .previous()
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

## Request Caching

The SDK can cache GET responses so your app stays fast on repeat reads and can fall back to
previously fetched data when the network is slow or unavailable. Caching is **off by default**.

### Enable caching

Pass `cache: true` (or a configuration object) when constructing `TickeTing`:

```javascript
import { TickeTing } from '@ticketing/ticketing-nodejs-sdk'

const ticketing = new TickeTing({
  apiKey: "API_KEY",
  cache: true
})

// Or with options:
const ticketing = new TickeTing({
  apiKey: "API_KEY",
  cache: {
    enabled: true,
    defaultTtl: 60_000,       // serve as fresh for 1 minute
    revalidateTimeout: 3_000, // wait up to 3s for newer data before returning stale
    staleTtl: null,           // keep stale entries for offline fallback (default)
    persistence: true         // persist to localStorage when available (default when caching is on)
  }
})
```

### How caching behaves

Cached GET responses follow a **prefer-fresh** strategy:

1. **Fresh** — If a cached response is still within its TTL, it is returned immediately (no network call).
2. **Stale** — After the TTL expires, the SDK still keeps the entry and tries the network again.
   - If a fresh response arrives within `revalidateTimeout`, that new data is returned.
   - If the network is slow, the stale cache is returned right away and the refresh continues in the background so the next call can use updated data.
3. **Offline / network error** — If the request fails and a stale entry exists, the cached data is returned instead of failing the call.

Only `GET` (and `HEAD`) responses are cached. Successful mutations (`POST`, `PUT`, `PATCH`, `DELETE`)
invalidate related cached GETs by default so lists and detail views do not stay out of date.

### Cache options

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` when a cache object/`true` is passed | Turns caching on or off |
| `defaultTtl` | `300000` (5 minutes) | Soft TTL in milliseconds. After this, data is considered stale and revalidated |
| `revalidateTimeout` | `3000` | How long to wait for a fresh network response before returning stale data |
| `staleTtl` | `null` (unlimited) | How long after soft expiry an entry may still be used as fallback. `null` keeps entries until LRU eviction (best for offline). Set `0` to discard entries as soon as the soft TTL ends |
| `maxEntries` | `100` | Maximum number of cached responses retained in memory |
| `invalidateOnMutation` | `true` | Clear related GET cache entries after mutations |
| `persistence` | `true` when caching is enabled | Persist the cache (see [Persistence](#cache-persistence)) |

### Force cache or bypass per call

Use chainable helpers to override the global setting for a scoped call:

```javascript
// Force caching for this call even when global caching is off
ticketing.cache().events.find(1)

// Bypass the cache for this call even when global caching is on
ticketing.nocache().events.list()

// Per-call options
ticketing.cache({ ttl: 10_000, revalidateTimeout: 1_500 }).events.find(1)
```

The same `cache()` / `nocache()` chaining is available on services (for example
`ticketing.events.cache().find(1)`) and nested services (e.g. `host.tiers.nocache().list()`).

### Cache persistence

When persistence is enabled, cache entries are written to `localStorage` in browser-like
environments (or `sessionStorage` if configured). This lets an app restart and still have
fallback data while offline.

```javascript
const ticketing = new TickeTing({
  apiKey: "API_KEY",
  cache: {
    enabled: true,
    persistence: {
      namespace: '@my-app/ticketing-cache',
      storage: 'local' // or 'session', or a custom adapter
    }
  }
})

// Disable persistence (in-memory only)
const ticketing = new TickeTing({
  apiKey: "API_KEY",
  cache: {
    enabled: true,
    persistence: false
  }
})
```

### Custom persistence adapters

If `localStorage` / `sessionStorage` are not available (or you want to store the cache
elsewhere — for example React Native, Capacitor, Electron, or a secure keystore), pass your
own adapter as `persistence.storage`.

An adapter must implement this synchronous interface:

```typescript
interface CachePersistenceAdapter {
  read(): string | null   // return the full serialized cache blob, or null if empty
  write(data: string): void  // replace the stored blob
  remove(): void          // delete the stored blob (used by clear())
}
```

The SDK owns the serialization format. Your adapter should treat `data` as an opaque string
and round-trip it unchanged. Do not parse or reshape it unless you are building tooling on
top of the cache.

**In-memory adapter** (useful in tests, or as a base you hydrate from disk):

```javascript
import { TickeTing, MemoryCachePersistence } from '@ticketing/ticketing-nodejs-sdk'

const persistence = new MemoryCachePersistence()

const ticketing = new TickeTing({
  apiKey: "API_KEY",
  cache: {
    enabled: true,
    persistence: { storage: persistence }
  }
})
```

**Custom adapter example** (sync key/value store):

```javascript
import { TickeTing } from '@ticketing/ticketing-nodejs-sdk'

const CACHE_KEY = '@my-app/ticketing-cache'

const filePersistence = {
  read() {
    try {
      return mySyncStore.getItem(CACHE_KEY)
    } catch {
      return null
    }
  },
  write(data) {
    try {
      mySyncStore.setItem(CACHE_KEY, data)
    } catch {
      // Ignore quota / write failures; the in-memory cache still works
    }
  },
  remove() {
    try {
      mySyncStore.removeItem(CACHE_KEY)
    } catch {
      // Ignore remove failures
    }
  }
}

const ticketing = new TickeTing({
  apiKey: "API_KEY",
  cache: {
    enabled: true,
    persistence: { storage: filePersistence }
  }
})
```

**Async backends** (AsyncStorage, IndexedDB, etc.): the adapter API is synchronous, so
hydrate into memory before creating `TickeTing`, then write through on each change:

```javascript
import { TickeTing, MemoryCachePersistence } from '@ticketing/ticketing-nodejs-sdk'
import AsyncStorage from '@react-native-async-storage/async-storage'

const CACHE_KEY = '@my-app/ticketing-cache'

async function createTicketing(apiKey) {
  const persistence = new MemoryCachePersistence()
  const existing = await AsyncStorage.getItem(CACHE_KEY)
  if (existing) {
    persistence.write(existing)
  }

  const originalWrite = persistence.write.bind(persistence)
  persistence.write = (data) => {
    originalWrite(data)
    AsyncStorage.setItem(CACHE_KEY, data).catch(() => {})
  }

  const originalRemove = persistence.remove.bind(persistence)
  persistence.remove = () => {
    originalRemove()
    AsyncStorage.removeItem(CACHE_KEY).catch(() => {})
  }

  return new TickeTing({
    apiKey,
    cache: {
      enabled: true,
      persistence: { storage: persistence }
    }
  })
}
```

Notes:

- `read()` is called once when the cache store is constructed; later updates go through `write()`.
- `remove()` is called when you invoke `ticketing.cacheControls.clear()`.
- Failed `write` / `remove` calls should not throw if you can avoid it — the in-memory cache continues to serve requests even when persistence fails.

### Manual cache control

Use `cacheControls` to clear or invalidate entries when your app knows data has changed
outside of a normal mutation through the SDK:

```javascript
// Remove every cached response
ticketing.cacheControls.clear()

// Invalidate entries whose key matches a predicate
ticketing.cacheControls.invalidate(key => key.includes('/events/'))

// Invalidate cached GETs related to a URL path
ticketing.cacheControls.invalidateUrl('/events/42')
```

## Session Management

The API Key passed to the TickeTing SDK constructor grants primarily read-only access to
API resources (with the exception of an administrative key). Resource management is generally
restricted to specific users and you will need to authenticate against the API to unlock
these features.

The SDK offers user authentication in the form of sessions. This section details how to
work with user sessions.

### Start a new session

[API Reference](https://ticketing.redocly.app/docs/api_reference/api_reference/session-authentication/start_session)

To authenticate a user, you will need to start a new session. This requires you to provide
the user's unique identifier (username or email) and password. Once a session has been started,
the SDK will make all subsequent calls to the API on behalf of the authenticated user, until
the session is ended. The SDK supports only one active session at a time.

**N.B.** The default API Key passed to the constructor may have a more permissive role than that of
the authenticated user. In this case some access may be restricted during the course of the session.

```javascript
  ticketing.session.start({
    "identification": "mothers.milk", //Account username or email
    "password": "WuT4NGcl4n"
  }).then(key => {
    if(key){
      //Do something with session key (for example save to local storage)
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof UnauthorisedError){
      console.log("The provided username/password combination is invalid.")
    }else if(error instanceof ResourceNotFoundError){
      console.log("No account was found matching the provided identification string.")
    }else if(error instanceof UnsupportedOperationError){
      console.log("There is already an active session.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Resume an active session

[API Reference](https://ticketing.redocly.app/docs/api_reference/api_reference/session-authentication/continue_session)

While the TickeTing API persists sessions, the SDK does not. This allows developers the freedom to
choose the local storage solution most suitable for their use case. If you wish to resume a previously started
session, you can do so by providing a previously stored session key to the SDK. Once resumed, the SDK will
authenticate subsequent requests on behalf of the session's attached user.

**N.B.** A session cannot be resumed if another one has already been started.

```javascript
  ticketing.session.resume("24496b8f8a513737c26276d04397908c").then(resumed => {
    if(resumed){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof InvalidStateError){
      console.log("The session has ended or does not exist.")
    }else if(error instanceof UnsupportedOperationError){
      console.log("There is already an active session.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### End a session

[API Reference](https://ticketing.redocly.app/docs/api_reference/api_reference/session-authentication/end_session)

When you end an active session, the SDK will stop authenticating requests as the specified user, and revet to
the API key provided during initialisation. Ending a session allows you to start a new session, or resume an
existing one.

```javascript
  ticketing.session.end().then(ended => {
    if(ended){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof InvalidStateError){
      console.log("The session has already ended.")
    }else if(error instanceof UnsupportedOperationError){
      console.log("There is currently no active session.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Retrieve session information

After successfully starting or resuming a session, you may want to retrieve information about it. You can query
information about the ongoing session at any time.

```javascript
  ticketing.session.info().then(session => {
    let started = session.started //Date and time that the session was started
    let key = session.key //The active session's API Key
    let account = session.account //The user account associated with the session
  }).catch(error => {
    //Handle errors
    if(error instanceof UnsupportedOperationError){
      console.log("There is currently no active session.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

You can also check if the SDK currently has an active session before taking other actions
```javascript
  if(ticketing.session.active){
    //Do something if active session
  }else{
    //Do something otherwise
  }
```


## Accounts

Operations for registering and managing TickeTing user accounts and their
preferences.

### List all accounts

[API Reference](https://docs.ticketingevents.com/openapi/account-management/list_accounts)

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

[API Reference](https://docs.ticketingevents.com/openapi/account-management/create_account)

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

[API Reference](https://docs.ticketingevents.com/openapi/account-management/retrieve_account)

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

[API Reference](https://docs.ticketingevents.com/openapi/account-management/update_account)

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

[API Reference](https://docs.ticketingevents.com/openapi/account-management/delete_account)

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

### Verify an account

[API Reference](https://docs.ticketingevents.com/openapi/account-verification)

```javascript
  ticketing.accounts.verify("billy.butcher@fbsa.gov")
  .then(verification => {
    //Verify the account using the OTP code sent to the email address
    verification.confirm({
      "code": "123456"
    }).then(success => {
      //Do something with success status
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log(error.message) //Missing or invalid OTP
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
  })
  .catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log(error.message) //Missing or invalid email address
    }else if(error instanceof ResourceNotFoundError){
      console.log("The email address provided is not registered to a TickeTing user.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Deactivate an account

[API Reference](https://docs.ticketingevents.com/openapi/account-activation/request_deletion)

```javascript
  //Retrieve a specific account using its account number
  account = await ticketing.accounts.find("MO-6A39EE8D")

  //Save changes
  account.deactivate("The user asked to delete their account.").then(deactivated => {
    if(deactivated){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof PermissionError){
      console.log("You are not authorised to access or modify this account.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Fetch account preferences

[API Reference](https://docs.ticketingevents.com/openapi/account-management/retrieve_account_preferences)

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

[API Reference](https://docs.ticketingevents.com/openapi/account-management/update_account_preferences)

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

### Reset account password

[API Reference](https://docs.ticketingevents.com/openapi/password-reset)

```javascript
  ticketing.accounts.reset("billy.butcher@fbsa.gov")
  .then(reset => {
    //Reset the password using the OTP code sent to the email address
    reset.confirm({
      "code": "123456",
      "password": "mYn3Wp4$$word!"
    }).then(success => {
      //Do something with success status
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log(error.message) //Missing or invalid OTP or password
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
  })
  .catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log(error.message) //Missing or invalid email address
    }else if(error instanceof ResourceNotFoundError){
      console.log("The email address provided is not registered with TickeTing.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Lookup an account

[API Reference](https://docs.ticketingevents.com/openapi/account-management/lookup_account)

```javascript
  ticketing.accounts.lookup({
    identification: "mothers.milk", //Required
    role: "customer" //Optional
  })
  .then(lookup => {
    //Do something with the lookup result resource
    if(lookup.found){
      let identification = lookup.identification //Identification used in the lookup
      let role = lookup.role //Role used in the lookup if one was specified
      let name = lookup.name //Name registered to the matched account, if one was found
    }
  })
  .catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log(error.message)
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

## Account Privileges

Retrieval of account privileges for determining system access levels

### List account privileges

[API Reference](https://docs.ticketingevents.com/openapi/account-management/list_account_privileges)

```javascript
  //Retrieve a specific account using its account number
  account = await ticketing.accounts.find("MO-6A39EE8D")

  account.privileges.list()
    // Supported filters with examples
    .filter({
      role: "Editor",
      type: "host"
    })
    .then(privileges => {
      //Do something with the collection of privileges
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

### List privileged hosts

[API Reference](https://docs.ticketingevents.com/openapi/account-management/list_privileged_hosts)

```javascript
  //Retrieve a specific account using its account number
  account = await ticketing.accounts.find("MO-6A39EE8D")

  account.hosts.list()
    .then(hosts => {
      //Do something with the collection of hosts
    })
    .catch(error => {
      //Handle errors
      if(error instanceof PageAccessError){
        //Handle non-existant page error
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

## Account Resources

Operations for accessing collections of resources linked to a user's account

### Retrieve event itinerary

[API Reference](https://docs.ticketingevents.com/openapi/account-activity/view_event_itinerary)

```javascript
  //Retrieve a specific account using its account number
  account = await ticketing.accounts.find("MO-6A39EE8D")

  account.itinerary(20) //Page length to use with the collection
    // Supported filters with examples
    .filter({
      active: true //Return only future events
    })
    // Supported sort fields
    .sort(
      "start", //One of "alphabetical" "published" "popularity" "start"
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
```

### Retrieve ticket wallet

[API Reference](https://docs.ticketingevents.com/openapi/account-activity/list_ticket_wallet)

```javascript
  //Retrieve a specific account using its account number
  let account = await ticketing.accounts.find("MO-6A39EE8D")

  //Load event by ID
  let event = await ticketing.events.find(16993717817996)

  //Load section by ID
  let section = (await ticketing.events.find(16993717817996)).sections[0]

  account.wallet(25) //Page length to use with collection
    // Supported filters with examples
    .filter({
      event: event, //Return tickets for the given event
      section: section, //Return tickets for the given section
      serial: "DAWIER", //Return tickets with a serial number matching the pattern
      status: "Held" //Return tickets with a matching status
    })
    .then(tickets => {
      //Do something with the collection of tickets
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

### Retrieve transfer history

[API Reference](https://docs.ticketingevents.com/openapi/account-activity/view_transfer_history)

```javascript
  //Retrieve a specific account using its account number
  let account = await ticketing.accounts.find("MO-6A39EE8D")

  //Load event by ID
  let event = await ticketing.events.find(16993717817996)

  //Load section by ID
  let section = (await ticketing.events.find(16993717817996)).sections[0]

  //Retrieve transfers received by the customer
  account.inbox
    // Supported filters with examples
    .filter({
      status: "Pending" //Return transfers with the given status
    })
    .then(transfers => {
      //Do something with the collection of transfers
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

    //Retrieve transfers sent by the customer
    account.outbox
      // Supported filters with examples
      .filter({
        status: "Pending" //Return transfers with the given status
      })
      .then(transfers => {
        //Do something with the collection of transfers
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

## Hosts

Operations for managing hosts who can list events, sell tickets, book advertising, or request 
add-on services through TickeTing

### List event hosts

[API Reference](https://docs.ticketingevents.com/openapi/managing-host-accounts/list_hosts)

```javascript
  ticketing.hosts.list()
    // Supported filters with examples
    .filter({
      name: "Vought Entertainment",
      country: "Antigua and Barbuda"
    })
    // Supported sort fields
    .sort(
      "alphabetical", //Only "alphabetical" supported
      true //Set true for ascending sort (default), or false for descending order
    )
    .then(hosts => {
      //Do something with the collection of hosts
    })
    .catch(error => {
      //Handle errors
      if(error instanceof PageAccessError){
        //Handle non-existant page error
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Create an event host

[API Reference](https://docs.ticketingevents.com/openapi/managing-host-accounts/create_host)

```javascript
  let hostData = {
    "name": "Vought Entertainment",
    "contact": "Billy Butcher",
    "email": "billy.butcher@fbsa.gov",
    "bio": "Premier events for supes of all ages",
    "phone": "+1 (268) 555 8075",
    "website": "https://theboys.net",
    "country": "Antigua and Barbuda",
    "firstAddressLine": "Wireless Road",
    "secondAddressLine": "Clare Hall",
    "city": "St. John's",
    "district": "Saint John",
    "businessNo": "A5585291"
  }

  ticketing.hosts.create(hostData)
    .then(host => {
      //Do something with the created host resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log(error.message)
      }else if(error instanceof ResourceExistsError){
        console.log("A host with the given name already exists.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Fetch an event host

[API Reference](https://docs.ticketingevents.com/openapi/managing-host-accounts/retrieve_host)

```javascript
  //Retrieve a specific host using its ID
  ticketing.hosts.find(17327135633743)
    .then(host => {
      //Do something with the host resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundError){
        console.log("There is no host with the given ID")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Update an event host

[API Reference](https://docs.ticketingevents.com/openapi/managing-host-accounts/update_host)

```javascript
  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  //Make changes to the resource
  host.name = "Boys Entertainment"
  host.contact = "Marvin Milk"

  //Save changes
  host.save().then(saved => {
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
      console.log("This account is not an administrator of this event host.")
    }else if(error instanceof ResourceExistsError){
      console.log("A host with the given name already exists.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Delete an event host

[API Reference](https://docs.ticketingevents.com/openapi/managing-host-accounts/delete_host)

```javascript
  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  //Delete the event
  host.delete().then(deleted => {
    if(deleted){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof PermissionError){
      console.log("This account is not an administrator of this event host.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### List privileges

[API Reference](https://docs.ticketingevents.com/openapi/managing-host-accounts/list_host_privileges)

```javascript
  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  host.privileges.list()
    // Supported filters with examples
    .filter({
      role: "Editor"
    })
    .then(privileges => {
      //Do something with the collection of privileges
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

### Grant a privilege

[API Reference](https://docs.ticketingevents.com/openapi/managing-host-accounts/grant_a_host_privilege)

```javascript
  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  let privilegeData = {
    "user": "billy.butcher@fbsa.gov", //Required
    "role": "Editor" //Required
  }

  host.privileges.create(privilegeData)
    .then(privilege => {
      //Do something with the created privilege resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log("You must specify a valid role for this privilege.")
      }else if(error instanceof PermissionError){
        console.log("You are restricted from perfoming this operation on the specified host.")
      }else if(error instanceof ResourceExistsError){
        console.log("The requested privilege has already been granted to the specified user.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Fetch a privilege

[API Reference](https://docs.ticketingevents.com/openapi/managing-host-accounts/retrieve_host_privilege)

```javascript
  //Retrieve a specific host by its ID
  let host = await ticketing.hosts.find(16951985851389)

  //Retrieve a specific privilege using its ID
  host.privilege.find(18537291857173)
    .then(privilege => {
      //Do something with the privilege resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundError){
        console.log("There is no privilege with the given ID")
      }else if(error instanceof PermissionError){
        console.log("You are restricted from perfoming this operation on the specified host.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Update a privilege

[API Reference](https://docs.ticketingevents.com/openapi/managing-host-accounts/update_host_privilege)

```javascript
  //Retrieve a specific privilege by its ID
  let host = await ticketing.hosts.find(16951985851389)
  let privilege = await host.privilege.find(18537291857173)

  //Make changes to the resource
  privilege.role = "Administrator"

  //Save changes
  privilege.save().then(saved => {
    if(saved){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof ResourceNotFoundError){
      console.log("There is no privilege with the given ID")
    }else if(error instanceof BadDataError){
      console.log("You must specify a valid role for this privilege.")
    }else if(error instanceof PermissionError){
      console.log("You are restricted from perfoming this operation on the specified host.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Revoke a privilege

[API Reference](https://docs.ticketingevents.com/openapi/managing-host-accounts/revoke_a_host_privilege)

```javascript
  //Retrieve a specific privilege by its ID
  let host = await ticketing.hosts.find(16951985851389)
  let privilege = await host.privilege.find(18537291857173)

  //Delete the privilege
  privilege.delete().then(deleted => {
    if(deleted){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof ResourceNotFoundError){
      console.log("There is no privilege with the given ID")
    }else if(error instanceof PermissionError){
      console.log("You are restricted from perfoming this operation on the specified host.")
    }else if(error instanceof ResourceIndelibleError){
      console.log("A host's owner privilege cannot be deleted.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

## Event Management

Operations for managing events in the TickeTing system.

### List events

[API Reference](https://docs.ticketingevents.com/openapi/managing-host-accounts/list_host_events)

```javascript
  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  //Retrieve a specific region using its ID
  let region = await ticketing.regions.find(19290238432215)

  host.events.list()
    // Supported filters with examples
    .filter({
      region: region,
      title: "Dawn of the Seven Premier",
      status: "Scheduled",
      active: true,
      public: false
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

[API Reference](https://docs.ticketingevents.com/openapi/working-with-events/register_event)

```javascript
  let host = ticketing.hosts.find(16951985851389)
  let category = await ticketing.categories.find(16878141745207)
  let venue = await ticketing.venues.find(16878146473429)

  let eventData = {
    "title": "Dawn of the Seven Premier", //Required
    "description": "World Premier of the long ....", //Required
    "type": "Standard", //Required
    "public": true, //Required
    "category": category, //Required
    "subcategory": category.subcategories[0], //Required
    "venue": venue, //Required
    "start": "2024-06-07T20:00", //Required
    "end": "2024-06-07T23:00", //Required
    "disclaimer": "Attend at your own risk",
    "tags": ["homelander", "queen maeve", "the deep", "A-Train"],
    "banner": "data:image/png;base64,iVBORw0KGgoAAAA...",
    "thumbnail": "data:image/png;base64,iVBORw0KGgoA..."
  }

  host.events.create(eventData)
    .then(event => {
      //Do something with the created event resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log(error.message)
      }else if(error instanceof PermissionError){
        console.log("You are not authorised to manage events on behalf of this host.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Fetch an event

[API Reference](https://docs.ticketingevents.com/openapi/working-with-events/retrieve_event)

```javascript
  let host = await ticketing.hosts.find(16951985851389)

  //Retrieve a specific event using its ID
  host.events.find(16993717817996)
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

[API Reference](https://docs.ticketingevents.com/openapi/working-with-events/update_event)

```javascript
  //Retrieve a specific event using its ID
  let host = await ticketing.hosts.find(16951985851389)
  let event = await host.events.find(16993717817996)

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
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Delete an event

[API Reference](https://docs.ticketingevents.com/openapi/working-with-events/delete_event)

```javascript
  //Retrieve a specific event using its ID
  let host = await ticketing.hosts.find(16951985851389)
  let event = await host.events.find(16993717817996)

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
      console.log("The event is associated with one or more tiers which must be deleted first.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### List event submissions

[API Reference](https://docs.ticketingevents.com/openapi/managing-events/list_event_submissions)

```javascript
  //Retrieve a specific event using its ID
  let host = await ticketing.hosts.find(16951985851389)
  let event = await host.events.find(16993717817996)

  event.submissions.list()
    .then(submissions => {
      //Do something with the collection of submissions
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

### Submit event for review

[API Reference](https://docs.ticketingevents.com/openapi/managing-events/submit_event)

```javascript
  //Retrieve a specific event using its ID
  let host = await ticketing.hosts.find(16951985851389)
  let event = await host.events.find(16993717817996)

  event.submissions.create()
    .then(submission => {
      //Do something with the created submission resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof PermissionError){
        console.log("You are restricted from perfoming this operation on the specified event or its resources.")
      }else if(error instanceof InvalidStateError){
        console.log("You must upload banner and thumbnail images for an event prior to submission.")
      }else if(error instanceof ResourceExistsError){
        console.log("Pending changes have already been submitted for review, and are awaiting approval.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### List event publications

[API Reference](https://docs.ticketingevents.com/openapi/managing-events/list_event_publications)

```javascript
  //Retrieve a specific event using its ID
  let host = await ticketing.hosts.find(16951985851389)
  let event = await host.events.find(16993717817996)

  event.publications.list()
    .then(publications => {
      //Do something with the collection of publications
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

### Publish event changes

[API Reference](https://docs.ticketingevents.com/openapi/managing-events/publish_event)

```javascript
  //Retrieve a specific event using its ID
  let host = await ticketing.hosts.find(16951985851389)
  let event = await host.events.find(16993717817996)

  event.publish("2030-01-01T00:00" //Optional publication date. Published immediately if not specified)
    .then(publication => {
      //Do something with the created publication resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof PermissionError){
        console.log("You are restricted from perfoming this operation on the specified event or its resources.")
      }else if(error instanceof InvalidStateError){
        console.log("Pending changes must be submitted and approved before publication.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

## Tier Management

Operations for managing tiers in the TickeTing system.

### List tiers

[API Reference](https://docs.ticketingevents.com/openapi/managing-tiers/list_host_tiers)

```javascript
  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  //Retrieve a specific event using its ID
  let event = await host.events.find(16993717817996)

  host.tiers.list()
    // Supported filters with examples
    .filter({
      event: event,
    })
    .then(tiers => {
      //Do something with the collection of tiers
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

### Create a tier

[API Reference](https://docs.ticketingevents.com/openapi/managing-tiers/create_tier)

```javascript
  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  //Retrieve a specific event using its ID
  let event = await host.events.find(16993717817996)

  //Retrieve a specific tier using its ID
  let upgrade_tier = await host.tiers.find(19240249258262)

  let tierData = {
    "name": "Backstage Pass", //Required
    "description": "Gain exclusive access to meet the Supes and hang out after the show.", //Required
    "price": 299.9, //Required
    "capacity": 20, //Required
    "available_from": "2025-05-02T21:00:00", //Required
    "available_to": "2025-07-01T00:00:00", //Required
    "events": [{ //Required
      "event": event,
      "share": 100
    }],
    "artwork": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "unit_size": 1,
    "purchase_limit": 2,
    "purchase_note": "Your all set. Remember to give the codeword HOMELANDER when coming backstage.",
    "complimentary": false,
    "transferrable": false,
    "upgrades": [upgrade_tier]
  }

  host.tiers.create(tierData)
    .then(tier => {
      //Do something with the created tier resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log(error.message)
      }else if(error instanceof PermissionError){
        console.log("You are not authorised to manage tiers on behalf of this host.")
      }else if(error instanceof ResourceExistsError){
        console.log("One or more of the specified events already has a tier with the given name.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Fetch a tier

[API Reference](https://docs.ticketingevents.com/openapi/managing-tiers/retrieve_tier)

```javascript
  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  //Retrieve a specific tier using its ID
  host.tiers.find(19240249258262)
    .then(tier => {
      //Do something with the tier resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundError){
        console.log("There is no tier with the given ID")
      }else if(error instanceof PermissionError){
        console.log("You are not authorised to manage tiers on behalf of this host.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Update a tier

[API Reference](https://docs.ticketingevents.com/openapi/managing-tiers/update_tier)

```javascript
  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  //Retrieve a specific tier using its ID
  let tier = await host.tiers.find(19240249258262)

  //Retrieve a specific event using its ID
  let event = await host.events.find(16993717948145)

  //Make changes to the resource
  tier.name = "Season Pass"
  
  let tierEvents = await tier.events
  tierEvents[0].share = 50
  tierEvents.push({
    event: event,
    share: 50
  })

  //Save changes
  tier.save().then(saved => {
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
      console.log("You are not authorised to manage tiers on behalf of this host.")
    }else if(error instanceof ResourceExistsError){
      console.log("One or more of the specified events already has a tier with the given name.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Delete a tier

[API Reference](https://docs.ticketingevents.com/openapi/managing-tiers/delete_tier)

```javascript
  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  //Retrieve a specific tier using its ID
  let tier = await host.tiers.find(19240249258262)

  //Delete the event
  tier.delete().then(deleted => {
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
      console.log("Tickets have already been issued under this tier and changes or deletion are no longer possible.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

## Event Listings

Operations for searching and retrieving TickeTing event listings.

### Search event listings

[API Reference](https://docs.ticketingevents.com/openapi/event-listings/list_published_events)

```javascript
  //Retrieve a specific region using its ID
  let region = await ticketing.regions.find(19290238432215)

  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  //Retrieve a specific category using its ID
  let category = await ticketing.categories.find(16878141745207)

  //Retrieve a specific subcategory using its ID
  let subcategory = await ticketing.categories.find(19271181725646)

  ticketing.events.list()
    // Supported filters with examples
    .filter({
      region: region,
      host: host,
      title: "Dawn of the Seven Premier",
      active: true,
      category: category,
      subcategory: subcategory,
      after: "2025-01-01T00:00",
      before: "2025-12-31T23:59",
      featured: true,
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
    ticketing.events.list().sort("start").then(upcoming=>{})

    // List popular events (most popular first)
    ticketing.events.list().sort("popularity", false).then(popular=>{})

    // List new events (newest first)
    ticketing.events.list().sort("published", false).then(newest=>{})
```

### Fetch an event listing

[API Reference](https://docs.ticketingevents.com/openapi/event-listings/retrieve_published_event)

```javascript
  //Retrieve a specific event listing using its ID
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

### List event tiers

[API Reference](https://docs.ticketingevents.com/openapi/event-listings/list_event_tiers)

```javascript
  //Retrieve a specific event using its ID
  let event = await ticketing.events.find(16993717817996)

  event.tiers.list()
    // Supported filters with examples
    .filter({
      active: true, //Whether or not the tier is currently available for sale
    })
    .then(tiers => {
      //Do something with the collection of event tiers
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

## Purchasing tickets

SDK functionality related to shopping cart management and checkout.

### Create a shopping cart

```javascript
  //An account is required to manage shopping carts
  let account = (await ticketing.session.info()).account
  
  account.carts.create().then(cart => {
    //Retrieve cart information
    let created = cart.created //Date and time that the cart was created
    let subtotal = cart.subtotal //The total cost of all items in the cart before fees
    let fees = cart.fees //The total fees applicable on the items in the cart
    let total = cart.total //The total cost of all items in the cart inclusive of fees
    let items = cart.items //Array of items in cart including the section, quantity and subtotal of each.
  }).catch(error => {
    console.log(`${typeof error} (${error.code}): ${error.message}`)
  })
```

### Add items to cart

```javascript
  //An account is required to manage shopping carts
  let account = (await ticketing.session.info()).account
  
  //Create a new shopping cart
  let cart = await account.carts.create()

  //Retrieve a specific event using its ID
  let event = await ticketing.events.find(16993717817996)

  //Add items to the shopping cart
  cart.add(
    event.sections[0], //Add tickets for this section to the cart
    2 //Default to 1 if omitted
  ).then(success => {
    if(success){
      //Do something on success
    }else{
      //Do something on failure
    }
  })
  .catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log("The number of items to be added to the cart must be a positive integer.")
    }else if(error instanceof UnsupportedOperationError){
      console.log("Adding the specified quantity of this item would exceed the section capacity.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Remove items from cart

```javascript
  //An account is required to manage shopping carts
  let account = (await ticketing.session.info()).account
  
  //Create a new shopping cart
  let cart = await ticketing.carts.create()

  //Retrieve a specific event using its ID
  let event = await ticketing.events.find(16993717817996)

  //Remove items from the shopping cart
  cart.remove(
    event.sections[0], //Remove tickets for this section from the cart
    3 //Default to 1 if omitted
  ).then(success => {
    if(success){
      //Do something on success
    }else{
      //Do something on failure
    }
  })
  .catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log("The number of items to be removed from the cart must be a positive integer.")
    }else if(error instanceof UnsupportedOperationError){
      console.log("The cart contains fewer items than the quantity to be removed.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Set item quantity in cart

```javascript
  //An account is required to manage shopping carts
  let account = (await ticketing.session.info()).account

  //Create a new shopping cart
  let cart =  account.carts.create()

  //Retrieve a specific event using its ID
  let event = await ticketing.events.find(16993717817996)

  //Set the number of items in the shopping cart to a particular quantity
  cart.set(
    event.sections[2], //Set the number of tickets for this section in the cart
    5
  ).then(success => {
    if(success){
      //Do something on success
    }else{
      //Do something on failure
    }
  })
  .catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log("The item quantity must be a positive integer.")
    }else if(error instanceof UnsupportedOperationError){
      console.log("Setting the item quantity to the specified value would exceed the section capacity.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Checkout cart

[API Reference](https://docs.ticketingevents.com/openapi/placing-an-order/place_order)

```javascript
  //An account is required to manage shopping carts
  let account = (await ticketing.session.info()).account

  //Create a new shopping cart
  let cart = await account.carts.create()

  //Add items to cart
  let event = await ticketing.events.find(16993717817996)
  await cart.add(event.sections[0], 2)
  
  cart.checkout().then(order => {
    //See order settlement for details on settling or cancelling the order
  }).catch(error => {
    if(error instanceof PermissionError){
      console.log("The authenticated user is not permtited to manage orders for this account.")
    }else if(error instanceof BadDataError){
      console.log("One or more of the requested sections does not have sufficient capacity to fulfil the order.")
    }else{
      //Handle errors
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

## Order Settlement

SDK functionality allowing for manipulating and settling ticket orders.

### List customer orders

[API Reference](https://docs.ticketingevents.com/openapi/ordering-tickets/list_customer_orders)

```javascript
  //Retrieve a specific account using its account number
  let account = await ticketing.accounts.find("MO-6A39EE8D")

  account.orders.list()
    // Supported filters with examples
    .filter({
      number: "E8D946240203",
      status: "Cancelled" //One of "Placed", "Cancelled", "Timed Out", "Fulfilled", "Voided", "Returned"
    })
    // Supported sort fields
    .sort(
      "date", //One of "date"
      false //Set true for ascending sort (default), or false for descending order
    )
    .then(orders => {
      //Do something with the collection of orders
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

### Fetch an order

[API Reference](https://docs.ticketingevents.com/openapi/ordering-tickets/retrieve_order)

```javascript
  //Retrieve a specific account using its account number
  let account = await ticketing.accounts.find(17189259825853)

  //Retrieve a specific order using its number
  account.orders.find(17189259825853)
    .then(order => {
      //Do something with the order resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundError){
        console.log("There is no order identified by the given number")
      }else if(error instanceof PermissionError){
        console.log("The authenticating user is not authorised to manage orders on behalf of the ordering customer.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Cancel an order

[API Reference](https://docs.ticketingevents.com/openapi/ordering-tickets/cancel_order)

```javascript
  //Retrieve a specific account using its account number
  let account = await ticketing.accounts.find("MO-6A39EE8D")

  //Retrieve a specific order using its number
  let order = await account.orders.find(17189259825853)

  //Cancel the order
  order.cancel().then(cancelled => {
    if(cancelled){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
     if(error instanceof PermissionError){
      console.log("The authenticating user is not authorised to manage orders on behalf of the ordering customer.")
    }else if(error instanceof ResourceIndelibleError){
      console.log("The order has already timed out, been settled or was cancelled previously.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Settle an order

[API Reference](https://docs.ticketingevents.com/openapi/ordering-tickets/settle_order)

```javascript
  //Retrieve a specific account using its account number
  let account = await ticketing.accounts.find("MO-6A39EE8D")

  //Retrieve a specific order using its number
  let order = await account.orders.find(17189259825853)

  let paymentDetails = {
    "number": "5555555555555555",
    "cvv": 123,
    "expiryDate": "12/30",
    "name": "Marvin M. Milk",
    "email": "marvin.milk@usmc.gov",
    "phone": "+1 (268) 555 0123",
    "address1": "Hermitage Rd.",
    "address2": "Jennings New Extension",
    "city": "Jennings",
    "district": "Saint Mary'\''s",
    "country": "Antigua and Barbuda"
  }

  //Settle the order
  order.settle(paymentDetails).then(settled => {
    if(settled){
      //Do something on payment success
    }else{
      //Do something on payment failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log("Required payment details were missing or invalid")
    }else if(error instanceof PermissionError){
      console.log("The authenticating user is not authorised to settle orders on behalf of the ordering customer.")
    }else if(error instanceof InvalidStateError){
      console.log("The order has already timed out, been cancelled or was settled previously.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

## Reporting

The TickeTing SDK provides a set of functionality that lets you report on hosts, events,
users and more. These features are documented below.

### List host sales

[API Reference](https://docs.ticketingevents.com/openapi/sales-reporting/list_host_sales)

```javascript
  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  //Retrieve a specific event using its ID
  let event = await host.events.find(16993717817996)

  //Retrieve a specific tier using its ID
  let tier = await host.tiers.find(19240249258262)

  host.sales.list()
    // Supported filters with examples
    .filter({
      after: new Date("2026-07-01T00:00:00"), //Return sales after date
      before: new Date("2026-08-01T00:00:00"), //Return sales before date
      event: event, //Specific event sales
      tier: tier, //Specific tier sales
      number: 17189259825853, //Return sales linked to a specific order number
      customer: "AZ-4918SF92", //Return sales linked to a specific customer
      status: "confirmed", //Can be one of pending, cancelled, confirmed, refunded
    })
    // Supported sort fields
    .sort(
      "recorded", //One of "recorded", "total"
      false //Set true for ascending sort (default), or false for descending order
    )
    .then(sales => {
      //Do something with the collection of sales
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

### Fetch host statistics

[API Reference](https://docs.ticketingevents.com/openapi/sales-reporting/retrieve_host_statistics)

```javascript
  //Retrieve a specific host using its ID
  let host = await ticketing.hosts.find(17327135633743)

  //Access the host's statistics resource
  host.statistics({
      after: "2026-07-01T00:00:00", //Only aggregate statistics after this date
      before: "2026-08-01T00:00:00", //Only aggregate statistics before this date
      interval: "month" //The intervals over which to breakdown the aggregated statistics. Can be one of hour, day, week, month or year
  }).then(statistics => {
    console.log(statistics) //See documentation for list of available statisitics
  })
  .catch(error => {
    //Handle errors
    console.log(`${typeof error} (${error.code}): ${error.message}`)
  })
```

## Transferring tickets

SDK functionality for transferring tickets in the customer's wallet to another user.

### Initiate a transfer

```javascript
  ticketing.transfers.start().then(parcel => {
    //Retrieve parcel information.
    let created = parcel.created //Date and time that the parcel was created
    let tickets = parcel.tickets //Array of tickets in the parcel including the section and quantity of each.
  }).catch(error => {
    console.log(`${typeof error} (${error.code}): ${error.message}`)
  })
```

### Add tickets to a transfer

```javascript
  //Create a new ticket parcel
  let parcel = await ticketing.transfers.start()

  //Retrieve a specific event using its ID
  let event = await ticketing.events.find(16993717817996)

  //Pack the parcel with tickets to be transferred
  parcel.add(
    event.sections[0], //Add tickets for this section to the parcel
    2 //Quantity to remove. Defaults to 1 if omitted
  ).then(success => {
    if(success){
      //Do something on success
    }else{
      //Do something on failure
    }
  })
  .catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log("The number of tickets to be added to the parcel must be a positive integer.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Remove tickets from a transfer

```javascript
  //Create a new ticket parcel
  let parcel = await ticketing.transfers.start()

  //Retrieve a specific event using its ID
  let event = await ticketing.events.find(16993717817996)

  //Remove tickets from the parcel
  parcel.remove(
    event.sections[0], //Remove tickets for this section from the parcel
    3 //Quantity to remove. Defaults to 1 if omitted
  ).then(success => {
    if(success){
      //Do something on success
    }else{
      //Do something on failure
    }
  })
  .catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log("The number of tickets to be removed from the parcel must be a positive integer.")
    }else if(error instanceof UnsupportedOperationError){
      console.log("The parcel contains fewer tickets than the quantity to be removed.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Set tickets to be transferred

```javascript
  //Create a new ticket parcel
  let parcel = await ticketing.transfers.start()

  //Retrieve a specific event using its ID
  let event = await ticketing.events.find(16993717817996)

  //Set the number of tickets in the parcel to a particular quantity
  parcel.set(
    event.sections[2], //Set the number of tickets for this section in the parcel
    5 //Quantity to set. Defaults to 1 if omitted
  ).then(success => {
    if(success){
      //Do something on success
    }else{
      //Do something on failure
    }
  })
  .catch(error => {
    //Handle errors
    if(error instanceof BadDataError){
      console.log("The ticket quantity must be a positive integer.")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Send a transfer

[API Reference](https://docs.ticketingevents.com/openapi/ticket-transfers/initiate_transfer)

```javascript
  //Create a new ticket parcel
  let parcel = await ticketing.transfers.start()

  //Retrieve a specific event using its ID
  let event = await ticketing.events.find(16993717817996)
  await parcel.add(event.sections[0], 2)

  //Send the parcel (Requires sender and recipient to have accounts)
  let sender = (await ticketing.session.info()).account
  let recipient = await ticketing.accounts.lookup({identification: "billy.butcher@fbsa.gov"})
  
  parcel.send(sender, recipient).then(transfer => {
    //Claim or cancel the transfer (see below)
  }).catch(error => {
    if(error instanceof PermissionError){
      console.log("The authenticated user is not permitted to initiate transfers on behalf of the sender.")
    }else if(error instanceof BadDataError){
      console.log("The sender does not own sufficient tickets of the indicated types to complete this transfer.")
    }else if(error instanceof InvalidStateError){
      console.log("The sender cannot transfer tickets to themselves.")
    }else{
      //Handle errors
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Fetch a transfer

[API Reference](https://docs.ticketingevents.com/openapi/ticket-transfers/retrieve_transfer)

```javascript
  //Retrieve a specific transfer using its ID
  ticketing.transfers.find("17096551195817")
    .then(transfer => {
      //Do something with the transfer resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundError){
        console.log("There is no transfer identified by the given ID")
      }else if(error instanceof PermissionError){
        console.log("The authenticating user is not authorised to retrieve transfers on behalf of the sender.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Cancel a transfer

[API Reference](https://docs.ticketingevents.com/openapi/ticket-transfers/cancel_transfer)

```javascript
  //Retrieve transfers sent by the user
  let account = (await ticketing.session.info()).account
  let transfers = await account.outbox.filter({status: "Pending"})

  //Cancel transfer
  transfers[0].cancel().then(cancelled => {
    if(cancelled){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    if(error instanceof PermissionError){
      console.log("A transfer can only be cancelled by its recipient.")
    }else if(error instanceof InvalidStateError){
      console.log("Only pending transfers can be cancelled.")
    }else{
      //Handle errors
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### Claim a transfer

[API Reference](https://docs.ticketingevents.com/openapi/ticket-transfers/claim_transfer)

```javascript
  //Retrieve transfers received by the user
  let account = (await ticketing.session.info()).account
  let transfers = await account.inbox.filter({status: "Pending"})

  //Claim transfer
  transfers[0].claim().then(claimed => {
    if(claimed){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    if(error instanceof PermissionError){
      console.log("A transfer can only be claimed by its recipient.")
    }else if(error instanceof InvalidStateError){
      console.log("Only pending transfers can be claimed.")
    }else{
      //Handle errors
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

## Admissions

---
### Admissions Tokens

Event admissions tokens allow staff to admit patrons to one or more of an event's sections. Tokens
are anonymous and can be shared for use with multiple scanning devices. This subsection covers the
operations used to manage admissions tokens.

---

### List admissions tokens

[API Reference](https://docs.ticketingevents.com/openapi/event-admissions/list_event_tokens)

```javascript
  let event = await ticketing.events.find(16993717817996)

  event.tokens // The tokens property returns a standard collection with supported methods
    // Supported filters with examples
    .filter({
      global: true //Only return global admissions tokens
    })
    .then(tokens => {
      //Do something with the collection of tokens
    })
    .catch(error => {
      //Handle errors
      if(error instanceof PermissionError){
        console.log("This account is not an administrator of this event host.")
      }else if(error instanceof PageAccessError){
        //Handle non-existant page error
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Issue admissions token

[API Reference](https://docs.ticketingevents.com/openapi/event-admissions/manage_admission_tokens)

```javascript
  let event = await ticketing.events.find(16993717817996)

  event.issue_token(event.sections)  //We are required to provide the subset of an event's sections to link the token to
    .then(token => {
      //Do something with the created token resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log("One or more of the specified sections does not belong to this event.")
      }else if(error instanceof PermissionError){
        console.log("You are not authorised to manage events on behalf of this host.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Update admissions token sections

[API Reference](https://docs.ticketingevents.com/openapi/event-admissions/update_admission_token)

```javascript
  let event = await ticketing.events.find(16993717817996)

  event.tokens
    .then(tokens => {
      tokens[0].allow(event.sections[0]) //Allow admission to a section using this token
      tokens[0].deny(event.sections[1]) //Deny admission to a section using this token

      //Save changes
      tokens[0].save().then(saved => {
        if(saved){
          //Do something on success
        }else{
          //Do something on failure
        }
      })
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log("You can only allow or deny sections of the token's event")
      }else if(error instanceof PermissionError){
        console.log("You are not authorised to manage events on behalf of this host.")
      }else if(error instanceof ResourceImmutableError){
        console.log("An event's global token cannot be modified.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Invalidate an admissions token

[API Reference](https://docs.ticketingevents.com/openapi/event-admissions/invalidate_admission_token)

```javascript
  let event = await ticketing.events.find(16993717817996)

  event.tokens
    .then(tokens => {
      tokens[1].delete().then(invalidated => {
        if(invalidated){
          //Do something on success
        }else{
          //Do something on failure
        }
      })
    })
    .catch(error => {
      //Handle errors
      if(error instanceof PermissionError){
        console.log("You are not authorised to manage events on behalf of this host.")
      }else if(error instanceof ResourceIndelibleError){
        console.log("An event's global token cannot be invalidated.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

---
### Admitting Patrons

Valid ticket holders are allowed entry to an event through admission sessions. Admission sessions
allow gate staff to verify tickets and permit entry to the event. A session can be started using
an admissions token which allows the staff member to grant access to designated event sections.

---

### Start admission session

[API Reference](https://docs.ticketingevents.com/openapi/token-authentication/retrieve_token_auth)

Before retrieving a list of valid tickets or redeeming them, an admissions session must be commenced.
This is done by providing an admissions token which is linked to a specific event and sections.

```javascript
  //Start a session using an admission token
  ticketing.session.admission(
    "A0F9GG8D", //Admission token code
    "Billy Butcher", //Name of the staff member who will be admitting patrons
    "Google Pixel 6 Pro" //Device that will be verifying tickets
  )
  .then(session => {
    //Do something with the admission session
    let started = session.started //Date and time that the session was started
    let name = session.name //Name of the redeemer that initiated this session
    let device = session.device //Device that initiated this sesson
    let code = session.code //Admissions token code used to start this session
    let event = session.event //The event this session can admit patrons to
    let sections = session.sections //The event sections this session can admit patrons to
  })
  .catch(error => {
    //Handle errors
    if(error instanceof UnauthorisedError){
      console.log("The provided code does not belong to any event token")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### List valid tickets

[API Reference](https://docs.ticketingevents.com/openapi/event-admissions/list_event_tickets)

```javascript
  let session = await ticketing.session.admission("A0F9GG8D", "Name", "Device")
  session.tickets(25 // page size) // The tickets method returns a standard collection
    // Supported filters with examples
    .filter({
      modified_since: "2024-02-21T14:59:18+00:00" //Only return tickets with a status change after the specified date
    })
    .then(tickets => {
      //Do something with the collection of tickets
    })
    .catch(error => {
      //Handle errors
      if(error instanceof InvalidStateError){
        console.log("The admission session has ended, you must start a new one.")
      }else if(error instanceof PageAccessError){
        //Handle non-existant page error
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Grant admission to event

[API Reference](https://docs.ticketingevents.com/openapi/event-admissions/admit_event_patrons)

```javascript
  let session = await ticketing.session.admission("A0F9GG8D", "Name", "Device")
  session.admit(
    [ //List of ticket serials to attempt to redeem for entry to the event
      "DAWIER-BACK75580348",
      "DAWIER-VIPV37536946",
      "DAWIER-BACK75580348"
    ]
  )
  .then(admissions => {
    //Do something with the list of successful admissions
  })
  .catch(error => {
    //Handle errors
    if(error instanceof InvalidStateError){
      console.log("The admission session has ended, you must start a new one.")
    }else if(error instanceof BadDataError){
      console.log("None of the provided ticket serials grants admission to the designated event sections")
    }else{
      console.log(`${typeof error} (${error.code}): ${error.message}`)
    }
  })
```

### List event admissions

[API Reference](https://docs.ticketingevents.com/openapi/event-admissions/list_event_admissions)

```javascript
  let session = await ticketing.session.admission("A0F9GG8D", "Name", "Device")

  let ticket = await ticketing.tickets.find("DAWIER-BACK75580348")
  let patron = await ticketing.accounts.find("AZ-4918SF92")
  let section = (await ticketing.events.find(16993717817996)).sections[0]

  session.admissions(25 //page size) // The admissions() method returns a standard collection
    // Supported filters with examples
    .filter({
      redeemer: "Billy Butcher", //Only return admissions granted by this redeemer
      device: "Google Pixel Pro 6", //Only return admissions granted from this device
      ticket: ticket, //Only return the admission granted on this ticket
      patron: patron, //Only return admissions granted to the specified patron
      section: section //Only return admissions granted to this event section
    })
    .then(admissions => {
      //Do something with the admissions collection
    })
    .catch(error => {
      //Handle errors
      if(error instanceof InvalidStateError){
        console.log("The admission session has ended, you must start a new one.")
      }else if(error instanceof PageAccessError){
        //Handle non-existant page error
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### End admission session

[API Reference](https://docs.ticketingevents.com/openapi/token-authentication/retrieve_token_auth)

After ending an admission session all further operations will fail. You will first need to start a new
admissions session to perform these operations.

```javascript
  let session = await ticketing.session.admission("A0F9GG8D", "Name", "Device")
  session.end().then(ended => {
    if(ended){
      //Do something on success
    }else{
      //Do something on failure
    }
  }).catch(error => {
    //Handle errors
    if(error instanceof InvalidStateError){
      console.log("The admission session has ended, you must start a new one.")
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
    // Supported filters with examples
    .filter({
      active: true //Only return regions with upcoming events
    })
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
  let region = await ticketing.regions.find(19290238432215)

  ticketing.venues.list()
    // Supported filters with examples
    .filter({
      region: region,
      name: "Vought Tower"
    })
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

## Content Review

### List submissions

[API Reference](https://docs.ticketingevents.com/openapi/reviewing-content/list_submissions)

```javascript
  ticketing.submissions.list()
    // Supported filters with examples
    .filter({
      type: "event",
      status: "Pending", //Pending, Approved, Rejected
    })
    .then(submissions => {
      //Do something with the collection of submissions
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

### Fetch a submission

[API Reference](https://docs.ticketingevents.com/openapi/reviewing-content/retrieve_submission)

```javascript
  //Retrieve a specific submission using its ID
  ticketing.submissions.find(17325458293736)
    .then(submission => {
      //Do something with the submission resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundError){
        console.log("There is no submission with the given ID")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Decide on a submission

[API Reference](https://docs.ticketingevents.com/openapi/reviewing-content/take_submission_decision)

```javascript
  //Retrieve a specific submission using its ID
  let submission = await ticketing.submissions.find(17325458293736)

  //Approve submission
  submission.approve("Approval note")
    .then(decision => {
      //Do something with the decision resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log("You have entered an invalid approval note.")
      }else if(error instanceof ResourceExistsError){
        console.log("A decision has already been taken on this submission.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })

  //Reject submission
  submission.reject("Rejection note")
    .then(decision => {
      //Do something with the decision resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof BadDataError){
        console.log("You have entered an invalid rejection note.")
      }else if(error instanceof ResourceExistsError){
        console.log("A decision has already been taken on this submission.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```

### Fetch submission decision

[API Reference](https://docs.ticketingevents.com/openapi/reviewing-content/retrieve_submission_decision)

```javascript
  //Retrieve a specific submission using its ID
  let submission = await ticketing.submissions.find(17325458293736)

  //Retrieve the submission decision
  submission.decision
    .then(submission => {
      //Do something with the decision resource
    })
    .catch(error => {
      //Handle errors
      if(error instanceof ResourceNotFoundErroru){
        console.log("A decision has not yet been taken on this submission.")
      }else{
        console.log(`${typeof error} (${error.code}): ${error.message}`)
      }
    })
```