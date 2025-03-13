/**
 * FetchError class to encapsulate fetch errors.
 */
export class FetchError extends Error {
  url: string | Request;
  status: number;

  /**
   * @param {string} message - The Fetch request error message
   * @param {string | Request} url - The url request that failed 
   * @param {number} status - The http error status
   */
  constructor(message: string, url: string | Request, status: number) {
    super(message);
    //this.name = this.constructor.name; minified...
    this.name = "FetchError";
    this.url = url;
    this.status = status;
  }
}

/**
 * JsonParseError class to encapsulate JSON parse errors.
 */
export class JsonParseError extends Error {
  url: string | Request;

  /**
   * @param {string} message - The JSON parse error message
   * @param {string | Request} url - The url request that failed 
   */
  constructor(message: string, url: string | Request) {
    super(message);
    //this.name = this.constructor.name; minified...
    this.name = "JsonParseError";
    this.url = url;
  }
}

/**
 * AbortManager class to handle more AbortControllers.
 * @see AbortController {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController}
 */
export class AbortManager {
  private controllers: Map<string, AbortController>;

  /**
  */
  constructor() {
    this.controllers = new Map<string, AbortController>();
  }

  /**
   * Creates a new AbortController for a fetch request identified by a Unique Id.
   *
   * @param {string} uniqueId - Unique Id (or identifier)
   * @returns {AbortController.AbortSignal}  - This signal can be passed to the asynchronous request.
   */
  createSignal(uniqueId: string): AbortSignal {
    const controller = new AbortController();
    this.controllers.set(uniqueId, controller);
    return controller.signal;
  }

  /**
   * Local abort operation.
   * Aborts the operation associated with the Unique Id.
   *
   * @param {string} uniqueId - (optional) Unique Id (or identifier)
   */
  abort(uniqueId: string): void {
    const controller = this.controllers.get(uniqueId);
    if (controller) {
      controller.abort();
      this.controllers.delete(uniqueId);
    }
  }
  /**
   * Global abort operation.
   * Aborts all running and pending requests.
   */
  abortAll(): void {
    this.controllers.forEach((controller) => controller.abort());
    this.controllers.clear();
  }
}

interface RequestItem {
  url: string | Request;
  fetchOptions?: RequestInit;
  callback?: (uniqueId: string, data: any, error: Error | null, abortManager: AbortManager) => void;
  requestId?: string;
  maxRetries?: number;
  retryDelay?: number;
  abortTimeout?: number;
}

interface ConcurrentFetchResult {
  // results could also be { uniqueId: string; data: any }[];
  results: any[];
  // then errors should be { uniqueId: string; error: Error }[];
  errors: { uniqueId: string; url: string | Request; error: Error }[];
}

interface ConcurrentFetchOptions {
  progressCallback?: (uniqueId: string, completedRequestCount: number, totalRequestCount: number) => void;
}

/**
 * ConcurrentFetcher class, which manages concurrent fetch requests and cancellation.
 *
 * Built upon:
 * - Fetch API {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API}
 * - and AbortController {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController}
 * @see Fetch API {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API}
 * @see AbortController {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController}
 */
export class ConcurrentFetcher {
  private requests: RequestItem[];
  private errors: { uniqueId: string; url: string | Request; error: Error }[];
  private abortManager: AbortManager;

  /**
   * @param {array} requests - An array of:
   * - URL: the URL (or resource) for the fetch request. This can be any one of:
   *   - a string containing the URL
   *   - an object, such an instance of URL, which has a stringifier that produces a string containing the URL
   *   - a Request instance
   * - (optional) fetch options: an object containing options to configure the request.
   * - (optional) callback object: callback for the response handling:
   *   - uniqueId: Either the supplied Request Id or the generated Id.
   *   - data: result from the request. Is null when an error is raised.
   *   - error: If not null, then an error have occurred for that request    
   *   - abortManager: Only to be used when aborting all subsequent fetch processing: abortManager.abortAll();
   * - (optional) Request Id: Must identify each request uniquely. Required for error handling and for the caller or callback to navigate. 
   *   - Generated if not given. Known as uniqueId throughout the solution.
   * - (optional) maxRetries: failed requests will retry up to maxRetries times with a retryDelay between each retry. Defaults to 0 (zero) meaning no retries.
   * - (optional) retryDelay: delay in ms between each retry. Defaults to 1000 = 1 second.
   * - (optional) abortTimeout: automatically abort the request after this specified time (in ms).
   */
  constructor(requests: RequestItem[]) {
    this.requests = requests;
    this.errors = [];
    this.abortManager = new AbortManager();
  }

  /**
    * Helper method to introduce a delay (in milliseconds)
    */
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
    * Retry logic for each individual fetch request
    */
  async fetchWithRetry<T>(url: string | Request, fetchWithSignal: RequestInit, uniqueId: string, maxRetries: number, retryDelay: number, countRetries = 0): Promise<T> {
    try {
      const _url = (typeof Request !== 'undefined' && url instanceof Request) ? url.clone() : url;
      const response = await fetch(_url, fetchWithSignal);
      //console.log("response.url =", response.url);
      //console.log("response.type =", response.type);
      //console.log("response.status =", response.status);
      //if (response.headers) {
      //    response.headers.forEach((value, key) => {
      //        console.log("response.header =", `${key} ==> ${value}`);
      //    });
      //}
      ////console.log("response.statusText =", response.statusText);
      ////console.log("response.userFinalURL =", response.useFinalURL);
      if (!response.ok) {
        throw new FetchError('Fetch HTTP error! status: '+response.status, url, response.status);
      }
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
          const response2 = response.clone();
          try {
              data = await response.json();
          } catch (e) {
              data = await response2.text();
          }
      } else if (contentType && contentType.includes("text/")) {
          data = await response.text();
      } else {
          data = await response.blob();
      }
      // Successfully fetched data
      return data;
    } catch (err) {
      if (maxRetries > 0) {
        maxRetries--;
        countRetries++;
        // Wait before retrying
        await this.delay(retryDelay);
        // Retry request.
        return this.fetchWithRetry(url, fetchWithSignal, uniqueId, maxRetries, retryDelay, countRetries);
      }
      // Can't do more...
      throw err;
    }
  }

  /**
   * This is the core method that performs concurrent fetching.
   * @param {callback} progressCallback - (optional): 
   * - progressCallback?:
   *   - uniqueId: string
   *   - completedRequestCount: number
   *   - totalRequestCount: number
   * @returns {Promise<ConcurrentFetchResult>} - A Promise of an array of ConcurrentFetchResult: results and errors:
   * - ConcurrentFetchResult[]:
   *  - results: any[];
   *  - errors: { uniqueId: string; url: string | Request; error: Error }[];
   */
  async concurrentFetch({ progressCallback }: ConcurrentFetchOptions = {}): Promise<ConcurrentFetchResult> {
    const results: any[] = [];
    let completedCount = 0;

    const fetchPromises = this.requests.map((request, index) => {
      const { url, fetchOptions = {}, callback = null, requestId = null, maxRetries = 0, retryDelay = 1000, abortTimeout = 0 } = request;
      const uniqueId = (requestId) ?? index.toString();
      const abortSignal = (abortTimeout > 0) ? AbortSignal.any([this.abortManager.createSignal(uniqueId), AbortSignal.timeout(abortTimeout)]) : this.abortManager.createSignal(uniqueId);

      // Default options (can be overridden)
      // including Representation header: Content-Type
      const defaultOptions = {
          method: 'GET',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json; charset: UTF-8',
              'mode': 'cors'
          },
          signal: abortSignal
      };

      const fetchWithSignal = { ...defaultOptions, ...fetchOptions }; // signal: abortSignal

      // Must remove 'Content-Type': 'multipart/form-data', since server expects:
      // Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryyEmKNDsBKjB7QEqu

      //console.log("Request options =", fetchWithSignal);

      return this.fetchWithRetry(url, fetchWithSignal, uniqueId, maxRetries, retryDelay)
      .then((data) => {
          if (callback) {
            callback(uniqueId, data, null, this.abortManager);
          } else {
            results[index] = data;
          }
        })
      .catch((err: Error) => {
          if (err instanceof SyntaxError) {
            err = new JsonParseError(err.message, url);
          }
          if (callback) {
            callback(uniqueId, null, err, this.abortManager);
          } else {
            this.errors.push({ uniqueId, url, error: err });
            results[index] = null;
          }
        })
      .finally(() => {
          completedCount++;
          if (progressCallback) progressCallback(uniqueId, completedCount, this.requests.length);
      });
    });

    try {
      await Promise.all(fetchPromises);

      const filteredResults = results ? results.filter((result) => result !== null) : [];

      return { results: filteredResults, errors: this.errors };
    } catch (err: any) {
      this.errors.push({ uniqueId: "unknown", url: "unknown", error: err });
      this.requests.forEach((request) => request.callback?.(request.requestId ?? "unknown", null, err, this.abortManager));
      return { results: [], errors: this.errors };
    }
  }

  /**
   * Calls AbortManager.abort()
   * see {@link AbortManager}
   *
   */
  abort(uniqueId: string): void {
    this.abortManager.abort(uniqueId);
  }

  /**
   * Calls AbortManager.abortAll()
   * see {@link AbortManager}
   */
  abortAll(): void {
    this.abortManager.abortAll();
  }
}
