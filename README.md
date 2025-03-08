<header>

# ConcurrentFetcher

A javascript class for managing concurrent fetch requests.

The Fetch Web API is a neat tool for fetching/getting network resources in web applications. And although fetch() is generally easy to use, there are a few nuances in regards to error handling, asynchronous and concurrent processing, cancellation and so forth :-)

The ConcurrentFetcher class addresses the core challenges of concurrent request, error handling, and cancellation.
</header>

## Availability
Maintained at github : <link>https://github.com/asicscreed/ConcurrentFetcher</link>
<br>And published at npm: <link>https://www.npmjs.com/package/concurrentfetcher</link>

## Usage
Basically you instantiate the class including an array of fetch requests and then call `concurrentFetch()` in an <i>async</i> context.

**JavaScript**:
```javascript
  const requests = [{ url: "https://jsonplaceholder.typicode.com/photos/1" }, { url: "https://jsonplaceholder.typicode.com/comments/1" }];

  let errors = {};
  let results = {};
  const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
  await fetcher.concurrentFetch()
  .then((response) => {
    errors = response.errors ?? {};
    results = response.results ?? {};
  });
  if (errors.length > 0) document.write(JSON.stringify(errors));
  if (results.length > 0) document.write(JSON.stringify(results));
```

And the same example, but with callback:

**JavaScript**:
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
  fetcher.concurrentFetch();
```

## Description:

### Key points:
<i>Concurrency:</i> The class leverages Promise.all() for efficient concurrent execution, optimizing performance.
<br><i>Error handling:</i> Custom error classes (FetchError, JsonParseError) and  error reporting provide detailed information for debugging and handling failures.
<br><i>Flexibility:</i> The ability to configure individual fetch options and utilize both callbacks and promises makes the class adaptable to various use cases.
<br><i>Cancellation:</i> The AbortManager class provides robust cancellation support, allowing for individual and global request cancellation.
<br><i>Progress tracking:</i> The optional progressCallback enables monitoring the progress of fetch requests.
<br><i>Encapsulation:</i> The AbortManager encapsulates cancellation logic, promoting cleaner and more maintainable code.

### Areas for consideration:
<i>Advanced progress Tracking:</i> Implement more granular progress tracking, such as byte transfer information for more detailed monitoring.
<br><i>Stream handling:</i> Adding support for handling response streams, which would be beneficial for large data transfers.
<br><i>Retry logic:</i> Adding a retry mechanism for failed requests could improve the resilience of the class.
<br><i>Testing:</i> (More) Extensive unit and integration tests will greatly improve the classes reliability.
<br><i>Adaptability:</i> Examples to demonstrate how to use the class in various environments (browser, Node.js, frontend frameworks, testing).

<footer>
<!--
  <<< Author notes: Footer >>>
  Add a link to get support, GitHub status page, code of conduct, license link.
-->

---

Get help: [Post in our discussion board](https://github.com/orgs/skills/discussions/categories/github-pages) &bull; [Review the GitHub status page](https://www.githubstatus.com/)

&copy; 2023 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

</footer>
