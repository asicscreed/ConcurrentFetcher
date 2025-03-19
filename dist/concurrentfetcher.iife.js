var ConcurrentFetcher = (function (exports) {
    'use strict';

    /**
     * FetchError class to encapsulate fetch errors.
     */
    class FetchError extends Error {
        /**
         * @param {string} message - The Fetch request error message
         * @param {string | Request} url - The url request that failed
         * @param {number} status - The http error status
         */
        constructor(message, url, status) {
            super(message);
            //this.name = this.constructor.name; minified...
            this.name = 'FetchError';
            this.url = url;
            this.status = status;
        }
    }
    /**
     * JsonParseError class to encapsulate JSON parse errors.
     */
    class JsonParseError extends SyntaxError {
        /**
         * @param {string} message - The JSON parse error message
         * @param {string | Request} url - The url request that failed
         */
        constructor(message, url) {
            super(message);
            //this.name = this.constructor.name; minified...
            this.name = 'JsonParseError';
            this.url = url;
        }
    }
    /**
     * AbortManager class to handle more AbortControllers.
     * @see AbortController {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController}
     */
    class AbortManager {
        /**
         */
        constructor() {
            this.controllers = new Map();
        }
        /**
         * Creates a new AbortController for a fetch request identified by a Unique Id.
         *
         * @param {string} uniqueId - Unique Id (or identifier)
         * @returns {AbortController.AbortSignal}  - This signal can be passed to the asynchronous request.
         */
        createSignal(uniqueId) {
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
        abort(uniqueId) {
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
        abortAll() {
            this.controllers.forEach((controller) => controller.abort());
            this.controllers.clear();
        }
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
    class ConcurrentFetcher {
        //private commonErrors = {
        //  invalidOperation: 'Invalid operation',
        //  unAuthorized: 'You are not authorized to use this function',
        //};
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
         * - (optional) forceReader: Reads response.body instead of either text, json or blob data. Defaults to false. See also cutoffAmount.
         * - (optional) cutoffAmount: when response content is bigger than cutoffAmount (in KB!) - then response.body will be read in chunks. AND The result will be a blob object (even when reading text and json!). Defaults to 0 (zero) - meaning: no special treatment.
         *   - blob data will be read in chunks if either forceReader (is true) or cutoffAmount (is reached).
         *   - text/json data will be read in chunks if forceReader (is true) and returned as a string.
         *   - text/json data will be read in chunks if cutoffAmount (is reached) and returned as blob data.
         */
        constructor(requests) {
            if (!Array.isArray(requests)) {
                throw this.CommonError('InvalidArgument', 'requests');
            }
            const reqLen = requests.length;
            if (reqLen < 1) {
                throw this.CommonError('ArgumentEmpty', 'requests');
            }
            const reqArray = [];
            for (let i = 0; i < reqLen; i++) {
                reqArray.push(i);
            }
            for (let i = 0; i < reqLen; i++) {
                if (requests[i].requestId) {
                    if (reqArray.includes(requests[i].requestId)) {
                        throw this.CommonError('DuplicateKey', 'requestId = ' + requests[i].requestId);
                    }
                    else {
                        reqArray.push(requests[i].requestId);
                    }
                }
            }
            this.requests = requests;
            this.errors = [];
            this.abortManager = new AbortManager();
        }
        /**
         * Helper method to introduce a delay (in milliseconds)
         */
        delay(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }
        /**
         * Retry logic for each individual fetch request
         */
        async fetchWithRetry(url, fetchWithSignal, uniqueId, maxRetries, statusCodesToRetry, retryDelay, forceReader, cutoffAmount, progressCallback, countRetries = 0) {
            let responseStatus = 200;
            try {
                const _url = typeof Request !== 'undefined' && url instanceof Request
                    ? url.clone()
                    : url;
                const response = await fetch(_url, fetchWithSignal);
                ////console.log("response.statusText =", response.statusText);
                ////console.log("response.userFinalURL =", response.useFinalURL);
                responseStatus = response.status;
                if (!response.ok) {
                    throw new FetchError('Fetch HTTP error! status: ' + response.status, url, response.status);
                }
                let contentType = '';
                let contentLength = 0;
                if (response.headers) {
                    response.headers.forEach((value, key) => {
                        //console.log("response.header =", `${key} ==> ${value}`);
                        if (key.toLowerCase() == 'content-type') {
                            contentType = value.toLowerCase();
                        }
                        else if (key.toLowerCase() == 'content-length') {
                            contentLength = parseInt(value);
                        }
                    });
                }
                let forceResponseReader = false;
                if (forceReader && !response.bodyUsed && response.body) {
                    forceResponseReader = true;
                }
                let returnData;
                if (contentType.match(/application\/[^+]*[+]?(json);?.*/i)) {
                    if (forceResponseReader) {
                        if (cutoffAmount > 0 &&
                            contentLength > cutoffAmount * 1024 &&
                            !response.bodyUsed &&
                            response.body) {
                            returnData = await this.fetchBlobStream(response, uniqueId, contentType, contentLength, progressCallback);
                            //const resp = await this.fetchBlobStream(response, uniqueId, contentType, contentLength, progressCallback);
                            //data = await resp.blob();
                        }
                        else {
                            returnData = await this.fetchTextStream(response, 'json', uniqueId, contentType, contentLength, progressCallback);
                        }
                    }
                    else {
                        returnData = await response.json();
                    }
                }
                else if (contentType.includes('text/')) {
                    if (forceResponseReader) {
                        if (cutoffAmount > 0 &&
                            contentLength > cutoffAmount * 1024 &&
                            !response.bodyUsed &&
                            response.body) {
                            returnData = await this.fetchBlobStream(response, uniqueId, contentType, contentLength, progressCallback);
                            //const resp = await this.fetchBlobStream(response, uniqueId, contentType, contentLength, progressCallback);
                            //data = await resp.blob();
                        }
                        else {
                            returnData = await this.fetchTextStream(response, 'text', uniqueId, contentType, contentLength, progressCallback);
                        }
                    }
                    else {
                        returnData = await response.text();
                    }
                }
                else {
                    // blob!
                    if (forceResponseReader ||
                        (cutoffAmount > 0 &&
                            contentLength > cutoffAmount * 1024 &&
                            !response.bodyUsed &&
                            response.body)) {
                        returnData = await this.fetchBlobStream(response, uniqueId, contentType, contentLength, progressCallback);
                        //const resp = await this.fetchBlobStream(response, uniqueId, contentType, contentLength, progressCallback);
                        //data = await resp.blob();
                    }
                    else {
                        returnData = await response.blob();
                    }
                }
                return returnData;
                //throw new FetchError('Should never happen', url, 0);
            }
            catch (err) {
                if (this.shouldRetryRequest(responseStatus, maxRetries, statusCodesToRetry, countRetries)) {
                    countRetries++;
                    // Wait before retrying
                    await this.delay(retryDelay);
                    // Retry request.
                    return this.fetchWithRetry(url, fetchWithSignal, uniqueId, maxRetries, statusCodesToRetry, retryDelay, forceReader, cutoffAmount, progressCallback, countRetries);
                }
                else {
                    // Can't do more...
                    throw err;
                }
            }
        }
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
        async concurrentFetch({ progressCallback, } = {}) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const results = [];
            let completedCount = 0;
            const fetchPromises = this.requests.map((request, index) => {
                const { url, fetchOptions = {}, callback = null, requestId = null, maxRetries = 0, statusCodesToRetry = [[100 - 199], [429 - 429], [500 - 599]], retryDelay = 1000, abortTimeout = 0, forceReader = false, cutoffAmount = 0, } = request;
                const uniqueId = requestId !== null && requestId !== void 0 ? requestId : index.toString();
                const abortSignal = abortTimeout > 0
                    ? AbortSignal.any([
                        this.abortManager.createSignal(uniqueId),
                        AbortSignal.timeout(abortTimeout),
                    ])
                    : this.abortManager.createSignal(uniqueId);
                // Default options (can be overridden)
                // including Representation header: Content-Type
                const defaultOptions = {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json; charset: UTF-8',
                    },
                    signal: abortSignal,
                };
                const fetchWithSignal = { ...defaultOptions, ...fetchOptions }; // signal: abortSignal
                // Must remove 'Content-Type': 'multipart/form-data', since server expects:
                // Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryyEmKNDsBKjB7QEqu
                return this.fetchWithRetry(url, fetchWithSignal, uniqueId, maxRetries, statusCodesToRetry, retryDelay, forceReader, cutoffAmount, progressCallback)
                    .then((data) => {
                    if (callback) {
                        callback(uniqueId, data, null, this.abortManager);
                    }
                    else {
                        results[index] = data;
                    }
                })
                    .catch((err) => {
                    if (err instanceof SyntaxError ||
                        (err.name && err.name === 'SyntaxError')) {
                        err = new JsonParseError(err.message, url);
                        //} else if ((err instanceof TypeError) || (err.name && err.name === "TypeError")) {
                        //  err = new FetchError('Fetch Network error! error: '+err.message, url, 500);
                    }
                    if (callback) {
                        callback(uniqueId, null, err, this.abortManager);
                    }
                    else {
                        this.errors.push({ uniqueId, url, error: err });
                        results[index] = null;
                    }
                })
                    .finally(() => {
                    completedCount++;
                    if (progressCallback) {
                        progressCallback(uniqueId, completedCount, this.requests.length, 0, 0);
                    }
                });
            });
            try {
                await Promise.all(fetchPromises);
                const filteredResults = results
                    ? results.filter((result) => result !== null)
                    : [];
                return { results: filteredResults, errors: this.errors };
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            catch (err) {
                this.errors.push({ uniqueId: 'unknown', url: 'unknown', error: err });
                this.requests.forEach((request) => {
                    var _a, _b;
                    return (_a = request.callback) === null || _a === void 0 ? void 0 : _a.call(request, (_b = request.requestId) !== null && _b !== void 0 ? _b : 'unknown', null, err, this.abortManager);
                });
                return { results: [], errors: this.errors };
            }
        }
        /**
         *  Reads text-/json-data in chunks.
         *
         */
        async fetchTextStream(fetchResponse, fetchType, uniqueId, contentType, contentLength, progressCallback) {
            if (!fetchResponse.body) {
                throw new Error('Response body is empty.');
            }
            const reader = fetchResponse.body.getReader();
            let done, value;
            let textChunks = '';
            const decoder = new TextDecoder('utf-8');
            while (({ done, value } = await reader.read()), !done) {
                textChunks += decoder.decode(value, { stream: true });
                if (progressCallback) {
                    progressCallback(uniqueId, 0, 0, textChunks.length, contentLength);
                }
            }
            // empty buffer...
            textChunks += decoder.decode();
            if (progressCallback) {
                progressCallback(uniqueId, 0, 0, textChunks.length, contentLength);
            }
            if (fetchType == 'json') {
                try {
                    return JSON.parse(textChunks);
                }
                catch (err) {
                    // If not JsonParseError re-throw, otherwise return textChunks...
                    if (!(err instanceof SyntaxError)) {
                        throw err;
                    }
                }
            }
            return textChunks;
        }
        /**
         *  Reads blob-data in chunks.
         *
         */
        async fetchBlobStream(fetchResponse, uniqueId, contentType, contentLength, progressCallback) {
            if (!fetchResponse.body) {
                throw new Error('Response body is empty.');
            }
            //console.log("fetchBlobStream =", `${contentType} ==> ${contentLength}`);
            const reader = fetchResponse.body.getReader();
            const chunks = [];
            let receivedLength = 0;
            try {
                //const allChunks = new Uint8Array(contentLength);
                //let receivedLength = 0;
                //while (true) {
                //    const { done, value } = await reader.read();
                //    if (done) { break; }
                //    allChunks.set(value, receivedLength);
                //    receivedLength += value.length;
                //    if (progressCallback) { progressCallback(uniqueId, 0, 0, receivedLength, contentLength); }
                //}
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    chunks.push(value);
                    receivedLength += value.length;
                    if (progressCallback) {
                        progressCallback(uniqueId, 0, 0, receivedLength, contentLength);
                    }
                }
                const allChunks = new Uint8Array(receivedLength);
                let position = 0;
                for (const chunk of chunks) {
                    allChunks.set(chunk, position);
                    position += chunk.length;
                }
                //console.log(Date.now() + " - blob is streamed: " + receivedLength + "/" + contentLength);
                return new Blob([allChunks]);
                //return new Response(allChunks, {
                //   status: fetchResponse.status,
                //   statusText: fetchResponse.statusText,
                //   headers: fetchResponse.headers
                //});
                //} catch(err) {
                //    throw err;
            }
            finally {
                reader.releaseLock();
            }
        }
        /**
         *  Check whether or not a retry-condition is met.
         *  Based on the response.status and the statusCodesToRetry configured.
         *
         */
        shouldRetryRequest(responseStatus, maxRetries, statusCodesToRetry, countRetries) {
            if (maxRetries - countRetries < 1) {
                return false;
            }
            let isInRange = false;
            for (const [min, max] of statusCodesToRetry) {
                if (responseStatus >= min && responseStatus <= max) {
                    isInRange = true;
                    break;
                }
            }
            return isInRange;
        }
        /**
         * Calls AbortManager.abort()
         * see {@link AbortManager}
         *
         */
        abort(uniqueId) {
            this.abortManager.abort(uniqueId);
        }
        /**
         * Calls AbortManager.abortAll()
         * see {@link AbortManager}
         */
        abortAll() {
            this.abortManager.abortAll();
        }
        /**
         * Returns a new Error with a common error message.
         */
        CommonError(errorType, message) {
            let errorMessage = '';
            switch (errorType) {
                case 'ArgumentEmpty':
                    errorMessage = 'Argument empty: ' + message;
                    break;
                case 'ArgumentMissing':
                    errorMessage = 'Argument missing: ' + message;
                    break;
                case 'InvalidArgument':
                    errorMessage = 'Argument is invalid: ' + message;
                    break;
                case 'DuplicateKey':
                    errorMessage = 'Duplicate key: ' + message;
                    break;
                case 'ValueError':
                    errorMessage = 'Value error: ' + message;
                    break;
                default:
                    errorMessage = message;
            }
            const error = new Error(errorMessage);
            error.name = errorType;
            return error;
        }
    }

    exports.AbortManager = AbortManager;
    exports.ConcurrentFetcher = ConcurrentFetcher;
    exports.FetchError = FetchError;
    exports.JsonParseError = JsonParseError;

    return exports;

})({});
//# sourceMappingURL=concurrentfetcher.iife.js.map
