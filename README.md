<header>

# ConcurrentFetcher

A javascript class for managing concurrent fetch requests.

The Fetch Web API is a neat tool for fetching/getting network resources in web applications. And although fetch() is generally easy to use, there are a few nuances in regards to error handling, asynchronous and concurrent processing, cancellation and so forth :-)

The ConcurrentFetcher class addresses the core challenges of concurrent request, error handling, and cancellation.
</header>

## Availability
Maintained at github : <link>https://github.com/asicscreed/ConcurrentFetcher</link>
<br>And published at npm: <link>https://www.npmjs.com/package/concurrentfetcher</link>

## Install

```shell
npm install concurrentfetcher
```

## Usage
Basically, you instantiate the class with an array of fetch requests and then call `concurrentFetch()` in an <i>async</i> context.
It calls fetch and consumes the Response object. If a callback is defined, it is called for each response. Without a callback, the responses (data and errors, respectively) are collected and returned as a Promise&lt;ConcurrentFetchResults&gt; as this:
```typescript
interface ConcurrentFetchResult {
  results: any[]; // json, text or blob data
  errors: { uniqueId: string; url: string | Request; error: FetchError }[];
}
```
_The errors array is added with the unique Id, the request URL and a custom FetchError which sets error.status as response.status_

**JavaScript**:
```javascript
  // Running in browser with <script src="concurrentfetcher.iife.min.js"></script>
  // examples/browser/example1.html
  const requests = [{ url: "https://jsonplaceholder.typicode.com/photos/1" }, { url: "https://jsonplaceholder.typicode.com/comments/1" }];

  let errors = {};
  let results = {};
  const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
  await fetcher.concurrentFetch()
  .then((data) => {
    errors = data.errors ?? {};
    results = data.results ?? {};
  });
  if (errors.length > 0) document.write(JSON.stringify(errors));
  if (results.length > 0) document.write(JSON.stringify(results));
```

And the same example, but with callback:

**JavaScript**:
```javascript
  // Running in browser with <script src="concurrentfetcher.iife.min.js"></script>
  // examples/browser/example2.html
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
  fetcher.concurrentFetch();
```
And call example in Node.js:

**JavaScript**:
```javascript
  // Running in Node.js with <script src="concurrentfetcher.umd.min.js"></script>
  // examples/node/get/input.html
  const people  = document.getElementById('people');
  const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
  fetcher.concurrentFetch()
  .then((data) => {
    // you should handle if (data.errors.length > 0)
    if (data.results.length > 0) {
      people.innerHTML = data.results[0].map((person) => {
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

## Description:

### Key points:
<i>Concurrency:</i> The class leverages Promise.all() for efficient concurrent execution and optimizing performance.
<br><i>Error handling:</i> Custom error classes (FetchError, JsonParseError) and error reporting provide information for debugging and handling failures.
<br><i>Flexibility:</i> The ability to configure individual fetch options and utilize both callbacks and promises makes the class adaptable to various use cases.
<br><i>Cancellation:</i> The AbortManager class provides robust cancellation support, allowing for individual and global request cancellation.
Support for client-controlled cancellation of a single request and of all requests. And timeout controlled cancellation on individual requests.
<br><i>Progress tracking:</i> The optional progressCallback enables monitoring the progress of fetch requests.
<br><i>Retry logic:</i> Retry mechanism for failed requests to improve the resilience of the class.

### Areas for consideration:
<i>Advanced progress Tracking:</i> Implement more granular progress tracking, such as byte transfer information for more detailed monitoring.
<br><i>Stream handling:</i> Adding support for handling response streams, which would be beneficial for large data transfers.
<br><i>Testing:</i> (More) Extensive unit and integration tests will greatly improve the classes reliability.
<br><i>Adaptability:</i> Examples to demonstrate how to use the class in various environments (~~browser~~, ~~Node.js~~, frontend frameworks, testing).

<footer>
<!--
  <<< Author notes: Footer >>>
  Add a link to get support, GitHub status page, code of conduct, license link.
-->

---

Get help: [Post in our discussion board](https://github.com/orgs/skills/discussions/categories/github-pages) &bull; [Review the GitHub status page](https://www.githubstatus.com/)

&copy; 2023 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

</footer>
