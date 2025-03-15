/**
 * FetchError class to encapsulate fetch errors.
 */
export declare class FetchError extends Error {
    url: string | Request;
    status: number;
    /**
     * @param {string} message - The Fetch request error message
     * @param {string | Request} url - The url request that failed
     * @param {number} status - The http error status
     */
    constructor(message: string, url: string | Request, status: number);
}
/**
 * JsonParseError class to encapsulate JSON parse errors.
 */
export declare class JsonParseError extends Error {
    url: string | Request;
    /**
     * @param {string} message - The JSON parse error message
     * @param {string | Request} url - The url request that failed
     */
    constructor(message: string, url: string | Request);
}
/**
 * AbortManager class to handle more AbortControllers.
 * @see AbortController {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController}
 */
export declare class AbortManager {
    private controllers;
    /**
    */
    constructor();
    /**
     * Creates a new AbortController for a fetch request identified by a Unique Id.
     *
     * @param {string} uniqueId - Unique Id (or identifier)
     * @returns {AbortController.AbortSignal}  - This signal can be passed to the asynchronous request.
     */
    createSignal(uniqueId: string): AbortSignal;
    /**
     * Local abort operation.
     * Aborts the operation associated with the Unique Id.
     *
     * @param {string} uniqueId - (optional) Unique Id (or identifier)
     */
    abort(uniqueId: string): void;
    /**
     * Global abort operation.
     * Aborts all running and pending requests.
     */
    abortAll(): void;
}
export interface RequestItem {
    url: string | Request;
    fetchOptions?: RequestInit;
    callback?: (uniqueId: string, data: any, error: Error | null, abortManager: AbortManager) => void;
    requestId?: string;
    maxRetries?: number;
    statusCodesToRetry?: number[][];
    retryDelay?: number;
    abortTimeout?: number;
    cutoffAmount?: number;
}
export interface ConcurrentFetchResponse {
    results: any[];
    errors: {
        uniqueId: string;
        url: string | Request;
        error: Error;
    }[];
}
export interface ConcurrentFetchOptions {
    progressCallback?: (uniqueId: string, completedRequestCount: number, totalRequestCount: number, completedByteCount: number, totalByteCount: number) => void;
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
export declare class ConcurrentFetcher {
    private requests;
    private errors;
    private abortManager;
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
     * - (optional) statusCodesToRetry: The HTTP response status codes that will automatically be retried.
     *   - Defaults to: [[100, 199], [429, 429], [500, 599]]
     * - (optional) retryDelay: delay in ms between each retry. Defaults to 1000 = 1 second.
     * - (optional) abortTimeout: automatically abort the request after this specified time (in ms).
     * - (optional) cutoffAmount: when response content is bigger than cutoffAmount, then reading will be buffered. If 0 (zero) then reading will not be buffered.
     */
    constructor(requests: RequestItem[]);
    /**
      * Helper method to introduce a delay (in milliseconds)
      */
    delay(ms: number): Promise<unknown>;
    /**
      * Retry logic for each individual fetch request
      */
    fetchWithRetry<T>(url: string | Request, fetchWithSignal: RequestInit, uniqueId: string, maxRetries: number, statusCodesToRetry: number[][], retryDelay: number, cutoffAmount: number, progressCallback: any, countRetries?: number): Promise<T>;
    /**
     * This is the core method that performs concurrent fetching.
     * @param {callback} progressCallback - (optional):
     * - progressCallback?:
     *   - uniqueId: string
     *   - completedRequestCount: number
     *   - totalRequestCount: number
     * @returns {Promise<ConcurrentFetchResponse>} - A Promise of an array of ConcurrentFetchResponse: results and errors:
     * - ConcurrentFetchResponse[]:
     *  - results: any[];
     *  - errors: { uniqueId: string; url: string | Request; error: Error }[];
     */
    concurrentFetch({ progressCallback }?: ConcurrentFetchOptions): Promise<ConcurrentFetchResponse>;
    /**
     *  Check whether or not a retry-condition is met.
     *  Based on the response.status and the statusCodesToRetry configured.
     *
     */
    shouldRetryRequest(responseStatus: number, maxRetries: number, statusCodesToRetry: number[][], countRetries: number): boolean;
    /**
     * Calls AbortManager.abort()
     * see {@link AbortManager}
     *
     */
    abort(uniqueId: string): void;
    /**
     * Calls AbortManager.abortAll()
     * see {@link AbortManager}
     */
    abortAll(): void;
}
