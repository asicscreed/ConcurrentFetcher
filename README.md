<header>

<!--
  <<< Author notes: Course header >>>
  Include a 1280×640 image, course title in sentence case, and a concise description in emphasis.
  In your repository settings: enable template repository, add your 1280×640 social image, auto delete head branches.
  Add your open source license, GitHub uses MIT license.
-->

# ParallelFetcher

A javascript class for managing parallel fetch requests.

</header>

<!--
  <<< Author notes: Step 1 >>>
  Choose 3-5 steps for your course.
  The first step is always the hardest, so pick something easy!
  Link to docs.github.com for further explanations.
  Encourage users to open new tabs for steps!
-->

## Introduction:
The Fetch Web API is a neat tool for fetching/getting network resources in web applications. And although fetch() is generally easy to use, there are a few nuances in regards to error handling, asynchronous and parallel processing, cancellation and so forth :-)

The ParallelFetcher class addresses the core challenges of concurrent fetching, error handling, and cancellation. The included AbortManager class enhances the control and organization of parallel fetches.

### Key points:
<i>Concurrency:</i> The class leverages Promise.all() for efficient parallel execution, optimizing performance.
<br><i>Error handling:</i> Custom error classes (FetchError, JsonParseError) and  error reporting provide detailed information for debugging and handling failures.
<br><i>Flexibility:</i> The ability to configure individual fetch options and utilize both callbacks and promises makes the class adaptable to various use cases.
<br><i>Cancellation:</i> The AbortManager class provides robust cancellation support, allowing for individual and global request cancellation.
<br><i>Progress tracking:</i> The optional progressCallback enables monitoring the progress of fetch requests.
<br><i>Encapsulation:</i> The AbortManager encapsulates cancellation logic, promoting cleaner and more maintainable code.
<!-- Adaptability:</i> The examples demonstrate how to use the class in various environments (browser, Node.js, frontend frameworks, testing). -->

### Areas for consideration:
<i>TypeScript integration:</i> Adding TypeScript type definitions would mprove code maintainability and prevent potential runtime errors.
<br><i>Advanced progress Tracking:</i> Implement more granular progress tracking, such as byte transfer information for more detailed monitoring.
<br><i>Stream handling:</i> Adding support for handling response streams, which would be beneficial for large data transfers.
<br><i>Retry logic:</i> Adding a retry mechanism for failed requests could improve the resilience of the class.
<br><i>Testing:</i> (More) Extensive unit and integration tests will greatly improve the classes reliability.
<br><i>Documentation:</i> Expanding the documentation, including JSDoc comments, would make the classes more user-friendly :-)

<footer>
<!--
  <<< Author notes: Footer >>>
  Add a link to get support, GitHub status page, code of conduct, license link.
-->

---

Get help: [Post in our discussion board](https://github.com/orgs/skills/discussions/categories/github-pages) &bull; [Review the GitHub status page](https://www.githubstatus.com/)

&copy; 2023 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

</footer>
