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
export declare class JsonParseError extends SyntaxError {
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
export interface ConcurrentFetchResponse {
    id: string;
    stamp: number;
    data?: any;
    error?: Error;
    message?: string;
}
export type myCallback = (uniqueId: string, data: any, // eslint-disable-line @typescript-eslint/no-explicit-any
error: Error | null, abortManager: AbortManager) => void;
export interface RequestItem {
    url: string | Request;
    fetchOptions?: RequestInit;
    callback?: myCallback;
    requestId?: string;
    maxRetries?: number;
    statusCodesToRetry?: number[][];
    retryDelay?: number;
    abortTimeout?: number;
    forceReader?: boolean;
    cutoffAmount?: number;
}
export type myprogressCallback = (uniqueId: string, completedRequestCount: number, totalRequestCount: number, completedByteCount: number, totalByteCount: number) => void;
export interface ConcurrentFetchOptions {
    progressCallback?: myprogressCallback;
    abortOnError?: boolean;
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
    private abortManager;
    private firstErrorRaised;
    /**
     * @param {array} RequestItem[] - An array of:
     * - URL: the URL (or resource) for the fetch request. This can be any one of:
     *   - a string containing the URL
     *   - an object, such an instance of URL, which has a stringifier that produces a string containing the URL
     *   - a Request instance
     * - (optional) fetch options: an object containing options to configure the request.
     * - (optional) callback object: callback for the response handling:
     *   - uniqueId: Either the supplied Request Id or the generated Id.
     *   - data: result from the request. Is null when an error is raised.
     *   - error: If not null, then an error have occurred for that request
     *   - abortManager: To be used when aborting all subsequent fetch processing: abortManager.abortAll();
     * - (optional) Request Id: Must identify each request uniquely. Required for error handling and for the caller or callback to refer each request.
     *   - Generated if not given. Known as id/uniqueId throughout the solution.
     * - (optional) maxRetries: failed requests will retry up to maxRetries times with a retryDelay between each retry. Defaults to 0 (zero) meaning no retries.
     * - (optional) statusCodesToRetry: The HTTP response status codes that will automatically be retried.
     *   - Defaults to: [[100, 199], [429, 429], [500, 599]]
     * - (optional) retryDelay: delay in ms between each retry. Defaults to 1000 = 1 second.
     * - (optional) abortTimeout: automatically aborts the request after this specified time (in ms).
     * - (optional) forceReader: Reads response.body instead of either text, json or blob data. Defaults to false. See also cutoffAmount.
     * - (optional) cutoffAmount: when response content is bigger than cutoffAmount (in KB!) - then response.body will be read in chunks. AND The result will be a blob object (even when reading text and json!). Defaults to 0 (zero) - meaning: no special treatment.
     *   - blob data will be read in chunks if either forceReader (is true) or cutoffAmount (is reached).
     *   - text/json data will be read in chunks if forceReader (is true) and returned as a string.
     *   - text/json data will be read in chunks if cutoffAmount (is reached) and returned as blob data.
     */
    constructor(requests: RequestItem[]);
    /**
     * Helper method to introduce a delay (in milliseconds)
     */
    delay(ms: number): Promise<unknown>;
    /**
     * Retry logic for each individual fetch request
     */
    fetchWithRetry<T>(url: string | Request, fetchWithSignal: RequestInit, uniqueId: string, maxRetries: number, statusCodesToRetry: number[][], retryDelay: number, forceReader: boolean, cutoffAmount: number, progressCallback: myprogressCallback | undefined, countRetries?: number): Promise<T>;
    /**
     * This is the core method that performs concurrent fetching. It builds an array of requests for the fetch()-method and then waits for them - via promise.allSettled() - to finish. The processing can be aborted in more ways, and this method supports 'global' abortOnError. Moreover each request can be controlled by the caller to abort single requests or all requests.
     * $param {progressCallback?, abortOnError?} - ConcurrentFetchOptions
     * - progressCallback?:
     *   - uniqueId: string // Either set by requestId in the request array, or made as uniqueId. Can be used the refer to the request.
     *   - completedRequestCount: number // Counts number of completed requests (both 'fulfilled' and 'rejected requests). Is 0 when chunks are being read.)
     *   - totalRequestCount: number // The total number requests. Is 0 when chunks are being read.
     *   - completedByteCount: number //  Counts number of completed chunk bytes read. Is 0 when reporting completedRequestCount.
     *   - totalByteCount: number // The total number of bytes being read. Can be 0!. Is 0 when reporting totalRequestCount.
     * - abortOnError?: boolean - (optional): If true then all further processing will be aborted on the first error raised.
     * @returns {PromiseFulfilledResult<ConcurrentFetchResponse>} - A PromiseFulfilledResult of ConcurrentFetchResponse:
     * - PromiseFulfilledResult<ConcurrentFetchResponse>[]:
     *   - status: string; // Either 'rejected' or 'fulfilled'
     *   - value: ConcurrentFetchResponse;
     * - ConcurrentFetchResponse:
     *   - id: string // Either set by requestId in the request array, or made as uniqueId. Can be used the refer to the request.
     *   - stamp: number // Timestamp set when request finish
     *   - data?: any // Response from the request. Only available on 'fulfilled' requests - that are not handled by callback
     *   - error?: Error // Error object from the request. Only available on 'rejected' requests - that are not handled by callback
     *   - message?: string // Error.message from the request. Only available on 'rejected' requests - that are not handled by callback
     */
    concurrentFetch({ progressCallback, abortOnError }?: ConcurrentFetchOptions): Promise<any[]>;
    /**
     *  Reads text-/json-data in chunks.
     *
     */
    fetchTextStream(fetchResponse: Response, fetchType: string, uniqueId: string, contentType: string, contentLength: number, progressCallback: myprogressCallback | undefined): Promise<string>;
    /**
     *  Reads blob-data in chunks.
     *
     */
    fetchBlobStream(fetchResponse: Response, uniqueId: string, contentType: string, contentLength: number, progressCallback: myprogressCallback | undefined): Promise<Blob>;
    /**
     *  Returns the first error raised - or null.
     *
     */
    getErrorRaised(): ConcurrentFetchResponse | null;
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
    /**
     * Returns a new Error with a common error message.
     */
    CommonError(errorType: string, message: string): Error;
}
