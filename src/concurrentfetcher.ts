/**
 * FetchError class to encapsulate fetch errors.
 */
export class FetchError extends Error {
  url: string;
  status: number;

  /**
   * @constructor
   * @param {string} message - The Fetch request error message
   * @param {string} url - The url request that failed 
   * @param {number} status - The http error status
   */
  constructor(message: string, url: string, status: number) {
    super(message);
    this.name = this.constructor.name;
    this.url = url;
    this.status = status;
  }
}

/**
 * JsonParseError class to encapsulate JSON parse errors.
 */
export class JsonParseError extends Error {
  url: string;

  /**
   * @constructor
   * @param {string} message - The JSON parse error message
   * @param {string} url - The url request that failed 
   */
  constructor(message: string, url: string) {
    super(message);
    this.name = this.constructor.name;
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
   * @constructor
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
  url: string;
  fetchOptions?: RequestInit;
  callback?: (uniqueId: string, data: any, error: Error | null, abortManager: AbortManager) => void;
  requestId?: string;
}

interface ConcurrentFetchResult {
  results: any[];
  errors: { uniqueId: string; url: string; error: Error }[];
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
  private errors: { uniqueId: string; url: string; error: Error }[];
  private abortManager: AbortManager;

  /**
   * @constructor
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
   */
  constructor(requests: RequestItem[]) {
    this.requests = requests;
    this.errors = [];
    this.abortManager = new AbortManager();
  }

  /**
   * This is the core method that performs concurrent fetching.
   * @param {callback} progressCallback - (optional): 
   * - progressCallback?:
   *   - uniqueId: string
   *   - completedRequestCount: number
   *   - totalRequestCount: number
   * @returns {Promise<progressCallback>} - A Promise of an array of ConcurrentFetchResult: results and errors:
   * - ConcurrentFetchResult[]:
   *  - results: any[];
   *  - errors: { uniqueId: string; url: string; error: Error }[];
   */
  async concurrentFetch({ progressCallback }: ConcurrentFetchOptions = {}): Promise<ConcurrentFetchResult> {
    const results: any[] = [];
    let completedCount = 0;

    const fetchPromises = this.requests.map((request, index) => {
      const { url, fetchOptions = {}, callback = null, requestId = null } = request;
      const uniqueId = requestId ?? index.toString();

      const fetchWithSignal = {
        ...fetchOptions,
        signal: this.abortManager.createSignal(uniqueId),
      };

      return fetch(url, fetchWithSignal)
        .then((response) => {
          if (!response.ok) {
            throw new FetchError(`Fetch HTTP error! status: ${response.status}`, url, response.status);
          }
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return response.json();
          } else if (contentType && contentType.includes("text/html")) {
            return response.text();
          } else if (contentType && contentType.includes("text/plain")) {
            return response.text();
          } else if (contentType && contentType.includes("image/")) {
            return response.blob();
          } else if (contentType && contentType.includes("application/octet-stream")) {
            return response.blob();
          } else {
            return response.blob();
          }
        })
        .then((data) => {
          if (callback) {
            callback(uniqueId, data, null, this.abortManager);
          } else {
            results[index] = data;
          }
        })
        .catch((error: Error) => {
          if (error instanceof SyntaxError) {
            error = new JsonParseError(error.message, url);
          }
          if (callback) {
            callback(uniqueId, null, error, this.abortManager);
          } else {
            this.errors.push({ uniqueId, url, error });
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
    } catch (fetchError: any) {
      this.errors.push({ uniqueId: "unknown", url: "unknown", error: fetchError });
      this.requests.forEach((request) => request.callback?.(request.requestId ?? "unknown", null, fetchError, this.abortManager));
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
