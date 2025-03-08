/**
 * FetchError class to encasulate fetch errors.
 */
export declare class FetchError extends Error {
    url: string;
    status: number;
    /**
     * @constructor
     * @param {string} message - The Fetch request error message
     * @param {string} url - The url request that failed
     * @param {number} status - The http error status
     */
    constructor(message: string, url: string, status: number);
}
/**
 * JsonParseError class to encasulate JSON parse errors.
 */
export declare class JsonParseError extends Error {
    url: string;
    /**
     * @constructor
     * @param {string} message - The JSON parse error message
     * @param {string} url - The url request that failed
     */
    constructor(message: string, url: string);
}
/**
 * AbortManager class to handle more AbortControllers.
 * @see AbortController {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController}
 */
export declare class AbortManager {
    private controllers;
    /**
     * @constructor
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
interface RequestItem {
    url: string;
    fetchOptions?: RequestInit;
    callback?: (uniqueId: string, data: any, error: Error | null, abortManager: AbortManager) => void;
    requestId?: string;
}
interface ConcurrentFetchResult {
    results: any[];
    errors: {
        uniqueId: string;
        url: string;
        error: Error;
    }[];
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
export declare class ConcurrentFetcher {
    private requests;
    private errors;
    private abortManager;
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
    constructor(requests: RequestItem[]);
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
    concurrentFetch({ progressCallback }?: ConcurrentFetchOptions): Promise<ConcurrentFetchResult>;
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
export {};
