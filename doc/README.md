## Classes

<dl>
<dt><a href="#FetchError">FetchError</a></dt>
<dd><p>FetchError class to encasulate fetch errors.</p></dd>
<dt><a href="#JsonParseError">JsonParseError</a></dt>
<dd></dd>
<dt><a href="#AbortManager">AbortManager</a></dt>
<dd></dd>
<dt><a href="#ConcurrentFetcher">ConcurrentFetcher</a></dt>
<dd><p>ConcurrentFetcher class, which manages concurrent fetch requests and cancellation.</p>
<p>Built upon:</p>
<ul>
<li>Fetch API [https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)</li>
<li>and AbortController [https://developer.mozilla.org/en-US/docs/Web/API/AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)</li>
</ul></dd>
<dt><a href="#FetchError">FetchError</a></dt>
<dd><p>FetchError class to encasulate fetch errors.</p></dd>
<dt><a href="#JsonParseError">JsonParseError</a></dt>
<dd></dd>
<dt><a href="#AbortManager">AbortManager</a></dt>
<dd></dd>
<dt><a href="#ConcurrentFetcher">ConcurrentFetcher</a></dt>
<dd><p>ConcurrentFetcher class, which manages concurrent fetch requests and cancellation.</p>
<p>Built upon:</p>
<ul>
<li>Fetch API [https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)</li>
<li>and AbortController [https://developer.mozilla.org/en-US/docs/Web/API/AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)</li>
</ul></dd>
</dl>

## Members

<dl>
<dt><a href="#FetchError">FetchError</a></dt>
<dd><p>JsonParseError class to encasulate JSON parse errors.</p></dd>
<dt><a href="#JsonParseError">JsonParseError</a></dt>
<dd><p>AbortManager class to handle more AbortControllers.</p></dd>
<dt><a href="#FetchError">FetchError</a></dt>
<dd><p>JsonParseError class to encasulate JSON parse errors.</p></dd>
<dt><a href="#JsonParseError">JsonParseError</a></dt>
<dd><p>AbortManager class to handle more AbortControllers.</p></dd>
</dl>

<a name="FetchError"></a>

## FetchError
<p>FetchError class to encasulate fetch errors.</p>

**Kind**: global class  

* [FetchError](#FetchError)
    * [new FetchError(message, url, status)](#new_FetchError_new)
    * [new FetchError(message, url, status)](#new_FetchError_new)

<a name="new_FetchError_new"></a>

### new FetchError(message, url, status)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The Fetch request error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |
| status | <code>number</code> | <p>The http error status</p> |

<a name="new_FetchError_new"></a>

### new FetchError(message, url, status)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The Fetch request error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |
| status | <code>number</code> | <p>The http error status</p> |

<a name="JsonParseError"></a>

## JsonParseError
**Kind**: global class  

* [JsonParseError](#JsonParseError)
    * [new JsonParseError(message, url)](#new_JsonParseError_new)
    * [new JsonParseError(message, url)](#new_JsonParseError_new)

<a name="new_JsonParseError_new"></a>

### new JsonParseError(message, url)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The JSON parse error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |

<a name="new_JsonParseError_new"></a>

### new JsonParseError(message, url)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The JSON parse error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |

<a name="AbortManager"></a>

## AbortManager
**Kind**: global class  

* [AbortManager](#AbortManager)
    * [.createSignal(uniqueId)](#AbortManager+createSignal) ⇒ <code>AbortController.AbortSignal</code>
    * [.abort(uniqueId)](#AbortManager+abort)
    * [.abortAll()](#AbortManager+abortAll)
    * [.createSignal(uniqueId)](#AbortManager+createSignal) ⇒ <code>AbortController.AbortSignal</code>
    * [.abort(uniqueId)](#AbortManager+abort)
    * [.abortAll()](#AbortManager+abortAll)

<a name="AbortManager+createSignal"></a>

### abortManager.createSignal(uniqueId) ⇒ <code>AbortController.AbortSignal</code>
<p>Creates a new AbortController for a fetch request identified by a Unique Id.</p>

**Kind**: instance method of [<code>AbortManager</code>](#AbortManager)  
**Returns**: <code>AbortController.AbortSignal</code> - <ul>
<li>This signal can be passed to the asynchronous request.</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| uniqueId | <code>string</code> | <p>Unique Id (or identifier)</p> |

<a name="AbortManager+abort"></a>

### abortManager.abort(uniqueId)
<p>Local abort operation.
Aborts the operation associated with the Unique Id.</p>

**Kind**: instance method of [<code>AbortManager</code>](#AbortManager)  

| Param | Type | Description |
| --- | --- | --- |
| uniqueId | <code>string</code> | <p>(optional) Unique Id (or identifier)</p> |

<a name="AbortManager+abortAll"></a>

### abortManager.abortAll()
<p>Global abort operation.
Aborts all running and pending requests.</p>

**Kind**: instance method of [<code>AbortManager</code>](#AbortManager)  
<a name="AbortManager+createSignal"></a>

### abortManager.createSignal(uniqueId) ⇒ <code>AbortController.AbortSignal</code>
<p>Creates a new AbortController for a fetch request identified by a Unique Id.</p>

**Kind**: instance method of [<code>AbortManager</code>](#AbortManager)  
**Returns**: <code>AbortController.AbortSignal</code> - <ul>
<li>This signal can be passed to the asynchronous request.</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| uniqueId | <code>string</code> | <p>Unique Id (or identifier)</p> |

<a name="AbortManager+abort"></a>

### abortManager.abort(uniqueId)
<p>Local abort operation.
Aborts the operation associated with the Unique Id.</p>

**Kind**: instance method of [<code>AbortManager</code>](#AbortManager)  

| Param | Type | Description |
| --- | --- | --- |
| uniqueId | <code>string</code> | <p>(optional) Unique Id (or identifier)</p> |

<a name="AbortManager+abortAll"></a>

### abortManager.abortAll()
<p>Global abort operation.
Aborts all running and pending requests.</p>

**Kind**: instance method of [<code>AbortManager</code>](#AbortManager)  
<a name="ConcurrentFetcher"></a>

## ConcurrentFetcher
<p>ConcurrentFetcher class, which manages concurrent fetch requests and cancellation.</p>
<p>Built upon:</p>
<ul>
<li>Fetch API [https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)</li>
<li>and AbortController [https://developer.mozilla.org/en-US/docs/Web/API/AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)</li>
</ul>

**Kind**: global class  
**See**

- Fetch API [https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- AbortController [https://developer.mozilla.org/en-US/docs/Web/API/AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)


* [ConcurrentFetcher](#ConcurrentFetcher)
    * [new ConcurrentFetcher(requests)](#new_ConcurrentFetcher_new)
    * [new ConcurrentFetcher(requests)](#new_ConcurrentFetcher_new)
    * [.concurrentFetch(progressCallback)](#ConcurrentFetcher+concurrentFetch) ⇒ <code>Promise.&lt;progressCallback&gt;</code>
    * [.abort()](#ConcurrentFetcher+abort)
    * [.abortAll()](#ConcurrentFetcher+abortAll)
    * [.concurrentFetch(progressCallback)](#ConcurrentFetcher+concurrentFetch) ⇒ <code>Promise.&lt;progressCallback&gt;</code>
    * [.abort()](#ConcurrentFetcher+abort)
    * [.abortAll()](#ConcurrentFetcher+abortAll)

<a name="new_ConcurrentFetcher_new"></a>

### new ConcurrentFetcher(requests)

| Param | Type | Description |
| --- | --- | --- |
| requests | <code>array</code> | <p>An array of:</p> <ul> <li>URL: the URL (or resource) for the fetch request. This can be any one of: <ul> <li>a string containing the URL</li> <li>an object, such an instance of URL, which has a stringifier that produces a string containing the URL</li> <li>a Request instance</li> </ul> </li> <li>(optional) fetch options: an object containing options to configure the request.</li> <li>(optional) callback object: callback for the response handling: <ul> <li>uniqueId: Either the supplied Request Id or the generated Id.</li> <li>data: result from the request. Is null when an error is raised.</li> <li>error: If not null, then an error have occurred for that request</li> <li>abortManager: Only to be used when aborting all subsequent fetch processing: abortManager.abortAll();</li> </ul> </li> <li>(optional) Request Id: Must identify each request uniquely. Required for error handling and for the caller or callback to navigate. <ul> <li>Generated if not given. Known as uniqueId throughout the solution.</li> </ul> </li> </ul> |

<a name="new_ConcurrentFetcher_new"></a>

### new ConcurrentFetcher(requests)

| Param | Type | Description |
| --- | --- | --- |
| requests | <code>array</code> | <p>An array of:</p> <ul> <li>URL: the URL (or resource) for the fetch request. This can be any one of: <ul> <li>a string containing the URL</li> <li>an object, such an instance of URL, which has a stringifier that produces a string containing the URL</li> <li>a Request instance</li> </ul> </li> <li>(optional) fetch options: an object containing options to configure the request.</li> <li>(optional) callback object: callback for the response handling: <ul> <li>uniqueId: Either the supplied Request Id or the generated Id.</li> <li>data: result from the request. Is null when an error is raised.</li> <li>error: If not null, then an error have occurred for that request</li> <li>abortManager: Only to be used when aborting all subsequent fetch processing: abortManager.abortAll();</li> </ul> </li> <li>(optional) Request Id: Must identify each request uniquely. Required for error handling and for the caller or callback to navigate. <ul> <li>Generated if not given. Known as uniqueId throughout the solution.</li> </ul> </li> </ul> |

<a name="ConcurrentFetcher+concurrentFetch"></a>

### concurrentFetcher.concurrentFetch(progressCallback) ⇒ <code>Promise.&lt;progressCallback&gt;</code>
<p>This is the core method that performs concurrent fetching.</p>

**Kind**: instance method of [<code>ConcurrentFetcher</code>](#ConcurrentFetcher)  
**Returns**: <code>Promise.&lt;progressCallback&gt;</code> - <ul>
<li>A Promise of an array of ConcurrentFetchResult: results and errors:</li>
<li>ConcurrentFetchResult[]:</li>
<li>results: any[];</li>
<li>errors: { uniqueId: string; url: string; error: Error }[];</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| progressCallback | <code>callback</code> | <p>(optional):</p> <ul> <li>progressCallback?: <ul> <li>uniqueId: string</li> <li>completedRequestCount: number</li> <li>totalRequestCount: number</li> </ul> </li> </ul> |

<a name="ConcurrentFetcher+abort"></a>

### concurrentFetcher.abort()
<p>Calls AbortManager.abort()
see [AbortManager](#AbortManager)</p>

**Kind**: instance method of [<code>ConcurrentFetcher</code>](#ConcurrentFetcher)  
<a name="ConcurrentFetcher+abortAll"></a>

### concurrentFetcher.abortAll()
<p>Calls AbortManager.abortAll()
see [AbortManager](#AbortManager)</p>

**Kind**: instance method of [<code>ConcurrentFetcher</code>](#ConcurrentFetcher)  
<a name="ConcurrentFetcher+concurrentFetch"></a>

### concurrentFetcher.concurrentFetch(progressCallback) ⇒ <code>Promise.&lt;progressCallback&gt;</code>
<p>This is the core method that performs concurrent fetching.</p>

**Kind**: instance method of [<code>ConcurrentFetcher</code>](#ConcurrentFetcher)  
**Returns**: <code>Promise.&lt;progressCallback&gt;</code> - <ul>
<li>A Promise of an array of ConcurrentFetchResult: results and errors:</li>
<li>ConcurrentFetchResult[]:</li>
<li>results: any[];</li>
<li>errors: { uniqueId: string; url: string; error: Error }[];</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| progressCallback | <code>callback</code> | <p>(optional):</p> <ul> <li>progressCallback?: <ul> <li>uniqueId: string</li> <li>completedRequestCount: number</li> <li>totalRequestCount: number</li> </ul> </li> </ul> |

<a name="ConcurrentFetcher+abort"></a>

### concurrentFetcher.abort()
<p>Calls AbortManager.abort()
see [AbortManager](#AbortManager)</p>

**Kind**: instance method of [<code>ConcurrentFetcher</code>](#ConcurrentFetcher)  
<a name="ConcurrentFetcher+abortAll"></a>

### concurrentFetcher.abortAll()
<p>Calls AbortManager.abortAll()
see [AbortManager](#AbortManager)</p>

**Kind**: instance method of [<code>ConcurrentFetcher</code>](#ConcurrentFetcher)  
<a name="FetchError"></a>

## FetchError
<p>FetchError class to encasulate fetch errors.</p>

**Kind**: global class  

* [FetchError](#FetchError)
    * [new FetchError(message, url, status)](#new_FetchError_new)
    * [new FetchError(message, url, status)](#new_FetchError_new)

<a name="new_FetchError_new"></a>

### new FetchError(message, url, status)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The Fetch request error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |
| status | <code>number</code> | <p>The http error status</p> |

<a name="new_FetchError_new"></a>

### new FetchError(message, url, status)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The Fetch request error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |
| status | <code>number</code> | <p>The http error status</p> |

<a name="JsonParseError"></a>

## JsonParseError
**Kind**: global class  

* [JsonParseError](#JsonParseError)
    * [new JsonParseError(message, url)](#new_JsonParseError_new)
    * [new JsonParseError(message, url)](#new_JsonParseError_new)

<a name="new_JsonParseError_new"></a>

### new JsonParseError(message, url)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The JSON parse error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |

<a name="new_JsonParseError_new"></a>

### new JsonParseError(message, url)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The JSON parse error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |

<a name="AbortManager"></a>

## AbortManager
**Kind**: global class  

* [AbortManager](#AbortManager)
    * [.createSignal(uniqueId)](#AbortManager+createSignal) ⇒ <code>AbortController.AbortSignal</code>
    * [.abort(uniqueId)](#AbortManager+abort)
    * [.abortAll()](#AbortManager+abortAll)
    * [.createSignal(uniqueId)](#AbortManager+createSignal) ⇒ <code>AbortController.AbortSignal</code>
    * [.abort(uniqueId)](#AbortManager+abort)
    * [.abortAll()](#AbortManager+abortAll)

<a name="AbortManager+createSignal"></a>

### abortManager.createSignal(uniqueId) ⇒ <code>AbortController.AbortSignal</code>
<p>Creates a new AbortController for a fetch request identified by a Unique Id.</p>

**Kind**: instance method of [<code>AbortManager</code>](#AbortManager)  
**Returns**: <code>AbortController.AbortSignal</code> - <ul>
<li>This signal can be passed to the asynchronous request.</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| uniqueId | <code>string</code> | <p>Unique Id (or identifier)</p> |

<a name="AbortManager+abort"></a>

### abortManager.abort(uniqueId)
<p>Local abort operation.
Aborts the operation associated with the Unique Id.</p>

**Kind**: instance method of [<code>AbortManager</code>](#AbortManager)  

| Param | Type | Description |
| --- | --- | --- |
| uniqueId | <code>string</code> | <p>(optional) Unique Id (or identifier)</p> |

<a name="AbortManager+abortAll"></a>

### abortManager.abortAll()
<p>Global abort operation.
Aborts all running and pending requests.</p>

**Kind**: instance method of [<code>AbortManager</code>](#AbortManager)  
<a name="AbortManager+createSignal"></a>

### abortManager.createSignal(uniqueId) ⇒ <code>AbortController.AbortSignal</code>
<p>Creates a new AbortController for a fetch request identified by a Unique Id.</p>

**Kind**: instance method of [<code>AbortManager</code>](#AbortManager)  
**Returns**: <code>AbortController.AbortSignal</code> - <ul>
<li>This signal can be passed to the asynchronous request.</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| uniqueId | <code>string</code> | <p>Unique Id (or identifier)</p> |

<a name="AbortManager+abort"></a>

### abortManager.abort(uniqueId)
<p>Local abort operation.
Aborts the operation associated with the Unique Id.</p>

**Kind**: instance method of [<code>AbortManager</code>](#AbortManager)  

| Param | Type | Description |
| --- | --- | --- |
| uniqueId | <code>string</code> | <p>(optional) Unique Id (or identifier)</p> |

<a name="AbortManager+abortAll"></a>

### abortManager.abortAll()
<p>Global abort operation.
Aborts all running and pending requests.</p>

**Kind**: instance method of [<code>AbortManager</code>](#AbortManager)  
<a name="ConcurrentFetcher"></a>

## ConcurrentFetcher
<p>ConcurrentFetcher class, which manages concurrent fetch requests and cancellation.</p>
<p>Built upon:</p>
<ul>
<li>Fetch API [https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)</li>
<li>and AbortController [https://developer.mozilla.org/en-US/docs/Web/API/AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)</li>
</ul>

**Kind**: global class  
**See**

- Fetch API [https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- AbortController [https://developer.mozilla.org/en-US/docs/Web/API/AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)


* [ConcurrentFetcher](#ConcurrentFetcher)
    * [new ConcurrentFetcher(requests)](#new_ConcurrentFetcher_new)
    * [new ConcurrentFetcher(requests)](#new_ConcurrentFetcher_new)
    * [.concurrentFetch(progressCallback)](#ConcurrentFetcher+concurrentFetch) ⇒ <code>Promise.&lt;progressCallback&gt;</code>
    * [.abort()](#ConcurrentFetcher+abort)
    * [.abortAll()](#ConcurrentFetcher+abortAll)
    * [.concurrentFetch(progressCallback)](#ConcurrentFetcher+concurrentFetch) ⇒ <code>Promise.&lt;progressCallback&gt;</code>
    * [.abort()](#ConcurrentFetcher+abort)
    * [.abortAll()](#ConcurrentFetcher+abortAll)

<a name="new_ConcurrentFetcher_new"></a>

### new ConcurrentFetcher(requests)

| Param | Type | Description |
| --- | --- | --- |
| requests | <code>array</code> | <p>An array of:</p> <ul> <li>URL: the URL (or resource) for the fetch request. This can be any one of: <ul> <li>a string containing the URL</li> <li>an object, such an instance of URL, which has a stringifier that produces a string containing the URL</li> <li>a Request instance</li> </ul> </li> <li>(optional) fetch options: an object containing options to configure the request.</li> <li>(optional) callback object: callback for the response handling: <ul> <li>uniqueId: Either the supplied Request Id or the generated Id.</li> <li>data: result from the request. Is null when an error is raised.</li> <li>error: If not null, then an error have occurred for that request</li> <li>abortManager: Only to be used when aborting all subsequent fetch processing: abortManager.abortAll();</li> </ul> </li> <li>(optional) Request Id: Must identify each request uniquely. Required for error handling and for the caller or callback to navigate. <ul> <li>Generated if not given. Known as uniqueId throughout the solution.</li> </ul> </li> </ul> |

<a name="new_ConcurrentFetcher_new"></a>

### new ConcurrentFetcher(requests)

| Param | Type | Description |
| --- | --- | --- |
| requests | <code>array</code> | <p>An array of:</p> <ul> <li>URL: the URL (or resource) for the fetch request. This can be any one of: <ul> <li>a string containing the URL</li> <li>an object, such an instance of URL, which has a stringifier that produces a string containing the URL</li> <li>a Request instance</li> </ul> </li> <li>(optional) fetch options: an object containing options to configure the request.</li> <li>(optional) callback object: callback for the response handling: <ul> <li>uniqueId: Either the supplied Request Id or the generated Id.</li> <li>data: result from the request. Is null when an error is raised.</li> <li>error: If not null, then an error have occurred for that request</li> <li>abortManager: Only to be used when aborting all subsequent fetch processing: abortManager.abortAll();</li> </ul> </li> <li>(optional) Request Id: Must identify each request uniquely. Required for error handling and for the caller or callback to navigate. <ul> <li>Generated if not given. Known as uniqueId throughout the solution.</li> </ul> </li> </ul> |

<a name="ConcurrentFetcher+concurrentFetch"></a>

### concurrentFetcher.concurrentFetch(progressCallback) ⇒ <code>Promise.&lt;progressCallback&gt;</code>
<p>This is the core method that performs concurrent fetching.</p>

**Kind**: instance method of [<code>ConcurrentFetcher</code>](#ConcurrentFetcher)  
**Returns**: <code>Promise.&lt;progressCallback&gt;</code> - <ul>
<li>A Promise of an array of ConcurrentFetchResult: results and errors:</li>
<li>ConcurrentFetchResult[]:</li>
<li>results: any[];</li>
<li>errors: { uniqueId: string; url: string; error: Error }[];</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| progressCallback | <code>callback</code> | <p>(optional):</p> <ul> <li>progressCallback?: <ul> <li>uniqueId: string</li> <li>completedRequestCount: number</li> <li>totalRequestCount: number</li> </ul> </li> </ul> |

<a name="ConcurrentFetcher+abort"></a>

### concurrentFetcher.abort()
<p>Calls AbortManager.abort()
see [AbortManager](#AbortManager)</p>

**Kind**: instance method of [<code>ConcurrentFetcher</code>](#ConcurrentFetcher)  
<a name="ConcurrentFetcher+abortAll"></a>

### concurrentFetcher.abortAll()
<p>Calls AbortManager.abortAll()
see [AbortManager](#AbortManager)</p>

**Kind**: instance method of [<code>ConcurrentFetcher</code>](#ConcurrentFetcher)  
<a name="ConcurrentFetcher+concurrentFetch"></a>

### concurrentFetcher.concurrentFetch(progressCallback) ⇒ <code>Promise.&lt;progressCallback&gt;</code>
<p>This is the core method that performs concurrent fetching.</p>

**Kind**: instance method of [<code>ConcurrentFetcher</code>](#ConcurrentFetcher)  
**Returns**: <code>Promise.&lt;progressCallback&gt;</code> - <ul>
<li>A Promise of an array of ConcurrentFetchResult: results and errors:</li>
<li>ConcurrentFetchResult[]:</li>
<li>results: any[];</li>
<li>errors: { uniqueId: string; url: string; error: Error }[];</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| progressCallback | <code>callback</code> | <p>(optional):</p> <ul> <li>progressCallback?: <ul> <li>uniqueId: string</li> <li>completedRequestCount: number</li> <li>totalRequestCount: number</li> </ul> </li> </ul> |

<a name="ConcurrentFetcher+abort"></a>

### concurrentFetcher.abort()
<p>Calls AbortManager.abort()
see [AbortManager](#AbortManager)</p>

**Kind**: instance method of [<code>ConcurrentFetcher</code>](#ConcurrentFetcher)  
<a name="ConcurrentFetcher+abortAll"></a>

### concurrentFetcher.abortAll()
<p>Calls AbortManager.abortAll()
see [AbortManager](#AbortManager)</p>

**Kind**: instance method of [<code>ConcurrentFetcher</code>](#ConcurrentFetcher)  
<a name="FetchError"></a>

## FetchError
<p>JsonParseError class to encasulate JSON parse errors.</p>

**Kind**: global variable  

* [FetchError](#FetchError)
    * [new FetchError(message, url, status)](#new_FetchError_new)
    * [new FetchError(message, url, status)](#new_FetchError_new)

<a name="new_FetchError_new"></a>

### new FetchError(message, url, status)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The Fetch request error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |
| status | <code>number</code> | <p>The http error status</p> |

<a name="new_FetchError_new"></a>

### new FetchError(message, url, status)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The Fetch request error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |
| status | <code>number</code> | <p>The http error status</p> |

<a name="JsonParseError"></a>

## JsonParseError
<p>AbortManager class to handle more AbortControllers.</p>

**Kind**: global variable  
**See**: AbortController [https://developer.mozilla.org/en-US/docs/Web/API/AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)  

* [JsonParseError](#JsonParseError)
    * [new JsonParseError(message, url)](#new_JsonParseError_new)
    * [new JsonParseError(message, url)](#new_JsonParseError_new)

<a name="new_JsonParseError_new"></a>

### new JsonParseError(message, url)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The JSON parse error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |

<a name="new_JsonParseError_new"></a>

### new JsonParseError(message, url)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The JSON parse error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |

<a name="FetchError"></a>

## FetchError
<p>JsonParseError class to encasulate JSON parse errors.</p>

**Kind**: global variable  

* [FetchError](#FetchError)
    * [new FetchError(message, url, status)](#new_FetchError_new)
    * [new FetchError(message, url, status)](#new_FetchError_new)

<a name="new_FetchError_new"></a>

### new FetchError(message, url, status)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The Fetch request error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |
| status | <code>number</code> | <p>The http error status</p> |

<a name="new_FetchError_new"></a>

### new FetchError(message, url, status)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The Fetch request error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |
| status | <code>number</code> | <p>The http error status</p> |

<a name="JsonParseError"></a>

## JsonParseError
<p>AbortManager class to handle more AbortControllers.</p>

**Kind**: global variable  
**See**: AbortController [https://developer.mozilla.org/en-US/docs/Web/API/AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)  

* [JsonParseError](#JsonParseError)
    * [new JsonParseError(message, url)](#new_JsonParseError_new)
    * [new JsonParseError(message, url)](#new_JsonParseError_new)

<a name="new_JsonParseError_new"></a>

### new JsonParseError(message, url)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The JSON parse error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |

<a name="new_JsonParseError_new"></a>

### new JsonParseError(message, url)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>The JSON parse error message</p> |
| url | <code>string</code> | <p>The url request that failed</p> |

