<header>

# ConcurrentFetcher

A javascript class for managing concurrent fetch requests.

The Fetch Web API is a neat tool for fetching/getting network resources in web applications. And although fetch() is generally easy to use, there are a few nuances in regards to error handling, asynchronous and concurrent processing, cancellation and so forth :-)

The ConcurrentFetcher class addresses the core challenges of concurrent requests, error handling, large data, and controlled cancellation.
</header>

## Availability
Maintained at github : <link>https://github.com/asicscreed/ConcurrentFetcher</link>
<br>And published at npm: <link>https://www.npmjs.com/package/concurrentfetcher</link>

## Install

```shell
npm install concurrentfetcher
```

## Usage
Basically, you instantiate the class with an array of fetch requests and then call `concurrentFetch()`. It calls fetch and consumes the Response object. If a callback is defined, it is called for each response. Without a callback, the responses (data and errors, respectively) are collected and returned. Like this:
```javascript
const requests = [
 { url: "https://jsonplaceholder.typicode.com/photos/1" },
 { url: "https://jsonplaceholder.typicode.com/comments/1" }
];
const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
fetcher.concurrentFetch()
.then((fetchResults) => {
    const reasons = fetchResults.filter(arr => arr.status === 'rejected');
    // NB! Do not filter the fetchResults array on large objects
    const values = fetchResults.filter(arr => arr.status !== 'rejected');
})
```
The result is an array of objects, each describing the outcome of one promise in the iterable, in the order of the promises passed, regardless of completion order. This is handled by [Promise.allSettled()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled). Each outcome object has the following properties:
```typescript
// for successful results:
{ status: 'fulfilled',
  value: {
    id: /* unique id which identifies the request */,
    stamp: /* timespamp set when request finished */,
    data: /* data returned from the fetch request. Either text, json or blob data. */
 }
}
// for errors:
{ status: 'rejected',
  reason: {
    id: /* unique id which identifies the request */,
    stamp: /* timespamp set when request finished */,
    error: /* catched from the failed fetch request. */
  }
}
// NB! When callbacks are being used, then data and error er left out (since they are available for the callback)
```
Since Promise.allSettled() only returns when <i>all</i> requests have been completed: resolved and/or rejected, Promise.all() is being used, when the approach is more <i>all or nothing</i>.

ConcurrentFetcher supports the option of aborting all further processing on the first error. This is to mimic the behavior of Promise.all(). The boolean named parameter `abortOnError` for the `concurrentFetch()` method controls this. If set and an error occurs, all further processing is aborted. The final response is - though - as Promise.allSettled() complete with all resolved and rejected responses. To identify the initial/first error raised, the instance method `getErrorRaised()` - returns a single reason object: { id, stamp, error } - as above.

Browser example without callback (src="concurrentfetcher.iife.min.js"):

**JavaScript**: [Example1](https://github.com/asicscreed/ConcurrentFetcher/tree/main/examples/browser/example1.html)
```javascript
const requests = [
 { url: "https://jsonplaceholder.typicode.com/photos/1" },
 { url: "https://jsonplaceholder.typicode.com/comments/1" }
];
const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
fetcher.concurrentFetch({ abortOnError: true })
.then((fetchResults) => {
  if (fetcher.getErrorRaised()) { console.log(fetcher.getErrorRaised()); }
  for (let i = 0; i < fetchResults.length; i++) {
    if (fetchResults[i].status === 'rejected') {
      const { id, stamp, error } = fetchResults[i].reason;
      document.write(error.toString());
    } else {
      const { id, stamp, data } = fetchResults[i].value;
      document.write(JSON.stringify(data));
    }
  }
})
```
Same currentFetch example, but with callback (src="concurrentfetcher.iife.min.js"):

**JavaScript**: [Example2](https://github.com/asicscreed/ConcurrentFetcher/tree/main/examples/browser/example2.html)
```javascript
const requests = [
  { url: "https://jsonplaceholder.typicode.com/photos/1",
    callback: (uniqueId, data, error, abortManager) => {
      if (error) document.write(JSON.stringify(error));
      else document.write(JSON.stringify(data));
    }
  },
  { url: "https://jsonplaceholder.typicode.com/comments/1",
    callback: (uniqueId, data, error, abortManager) => {
      if (error) document.write(JSON.stringify(error));
      else document.write(JSON.stringify(data));
    }
  }
];

const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
fetcher.concurrentFetch()
...
```
Hosted in Node.js with: concurrentfetcher.umd.min.js

**JavaScript**: [Node.js](https://github.com/asicscreed/ConcurrentFetcher/tree/main/examples/node/get/index.html)
```javascript
const people  = document.getElementById('people');
const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
fetcher.concurrentFetch()
.then((fetchResults) => {
  const errors = fetchResults.filter(answer => answer.status === 'rejected');
  if (errors.length > 0) { /* Do something about the errors */ }
  const results = fetchResults.filter(answer => answer.status !== 'rejected');
  if (results.length > 0) {
    people.innerHTML = results[0].value.data.map((person) => {
      return (
        '<div class="text-center mt-3">'+
          '<h5 class="mt-2 mb-0">'+person.name+'</h5>'+
          '<span>'+person.email+'</span>'+
          '<div class="px-4 mt-1">'+
            '<p class="fonts">'+person.company.catchPhrase+'</p>'+
          '</div>'+
        '</div>'
      );
    }).join('');
  } // data.results.length
})
.catch(error => console.error(error));  
```
Loaded in RequireJS with: concurrentfetcher.amd.min.js

**JavaScript**: [RequireJS](https://github.com/asicscreed/ConcurrentFetcher/tree/main/examples/node/amd/index.html)
```javascript
requirejs.config({ paths: { ConcurrentFetcher: '/concurrentfetcher.amd.min' }});
requirejs(['ConcurrentFetcher'], function (ConcurrentFetcher) {
  const requests = [
      {
          url: 'https://api.github.com/users/asicscreed',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
      }
  ];
  const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
  fetcher.concurrentFetch()
  .then((fetchResults) => {
    const errors = fetchResults.filter(answer => answer.status === 'rejected');
    if (errors.length > 0) { /* Do something about the errors */ }
    const results = fetchResults.filter(answer => answer.status !== 'rejected');
    if (results.length > 0) {
      user = results[0].value.data;
      document.getElementById('useravatar').src = user.avatar_url;
      document.getElementById('username').innerHTML = user.login;
    }
  })
```
## Documentation:
Currently, all documentation is located in the docs folder. It is generated by JSDoc, and is therefore regular html documents.

### Key points:
<i>Concurrency:</i> The class leverages Promise.all() for efficient concurrent execution and optimizing performance.
<br><i>Error handling:</i> Custom error classes (FetchError, JsonParseError) and error reporting provide information for debugging and handling failures.
<br><i>Flexibility:</i> The ability to configure individual fetch options and utilize both callbacks and promises makes the class adaptable to various use cases.
<br><i>Cancellation:</i> The AbortManager class provides robust cancellation support, allowing for individual and global request cancellation.
Support for client-controlled cancellation of a single request and of all requests. And timeout controlled cancellation on individual requests.
<br><i>Progress tracking:</i> The optional progressCallback enables monitoring the progress of fetch requests.
<br><i>Retry logic:</i> Retry mechanism for failed requests to improve the resilience of the class.
<br><i>Large data handling:</i> Utilizes response.body to read large data in chunks. Reports byte transfer information for progress tracking.
<br><i>Testing:</i> Extensive unit tests to improve the classes reliability.

### Areas for consideration:
<i>Advanced progress Tracking:</i> ~~Implement more granular progress tracking~~, such as byte transfer information for more detailed monitoring.
<br><i>Stream handling:</i> ~~Adding support for handling response streams, which~~ would be beneficial for large data transfers.
<br><i>Testing:</i> ~~(More) Extensive unit tests and~~ integration tests will improve the classes reliability further.
<br><i>Adaptability:</i> Examples to demonstrate how to use the class in various environments (~~browser~~, ~~Node.js~~, frontend frameworks, ~~testing~~).

<footer>
<!--
  <<< Author notes: Footer >>>
  Add a link to get support, GitHub status page, code of conduct, license link.
-->

---

Get help: [Post in our discussion board](https://github.com/orgs/skills/discussions/categories/github-pages) &bull; [Review the GitHub status page](https://www.githubstatus.com/)

&copy; 2023 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

</footer>
