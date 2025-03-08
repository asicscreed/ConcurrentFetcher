var ConcurrentFetcher = (function (exports) {
    'use strict';

    class FetchError extends Error {
        constructor(message, url, status) {
            super(message);
            this.name = this.constructor.name;
            this.url = url;
            this.status = status;
        }
    }
    class JsonParseError extends Error {
        constructor(message, url) {
            super(message);
            this.name = this.constructor.name;
            this.url = url;
        }
    }
    class AbortManager {
        constructor() {
            this.controllers = new Map();
        }
        createSignal(uniqueId) {
            const controller = new AbortController();
            this.controllers.set(uniqueId, controller);
            return controller.signal;
        }
        abort(uniqueId) {
            const controller = this.controllers.get(uniqueId);
            if (controller) {
                controller.abort();
                this.controllers.delete(uniqueId);
            }
        }
        abortAll() {
            this.controllers.forEach((controller) => controller.abort());
            this.controllers.clear();
        }
    }
    class ConcurrentFetcher {
        constructor(requests) {
            this.requests = requests;
            this.errors = [];
            this.abortManager = new AbortManager();
        }
        async concurrentFetch({ progressCallback } = {}) {
            const results = [];
            let completedCount = 0;
            const fetchPromises = this.requests.map((request, index) => {
                const { url, fetchOptions = {}, callback = null, requestId = null } = request;
                const uniqueId = requestId !== null && requestId !== void 0 ? requestId : index.toString();
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
                    }
                    else if (contentType && contentType.includes("text/html")) {
                        return response.text();
                    }
                    else if (contentType && contentType.includes("text/plain")) {
                        return response.text();
                    }
                    else if (contentType && contentType.includes("image/")) {
                        return response.blob();
                    }
                    else if (contentType && contentType.includes("application/octet-stream")) {
                        return response.blob();
                    }
                    else {
                        return response.blob();
                    }
                })
                    .then((data) => {
                    if (callback) {
                        callback(uniqueId, data, null, this.abortManager);
                    }
                    else {
                        results[index] = data;
                    }
                })
                    .catch((error) => {
                    if (error instanceof SyntaxError) {
                        error = new JsonParseError(error.message, url);
                    }
                    if (callback) {
                        callback(uniqueId, null, error, this.abortManager);
                    }
                    else {
                        this.errors.push({ uniqueId, url, error });
                        results[index] = null;
                    }
                })
                    .finally(() => {
                    completedCount++;
                    if (progressCallback)
                        progressCallback(uniqueId, completedCount, this.requests.length);
                });
            });
            try {
                await Promise.all(fetchPromises);
                const filteredResults = results ? results.filter((result) => result !== null) : [];
                return { results: filteredResults, errors: this.errors };
            }
            catch (fetchError) {
                this.errors.push({ uniqueId: "unknown", url: "unknown", error: fetchError });
                this.requests.forEach((request) => { var _a, _b; return (_a = request.callback) === null || _a === void 0 ? void 0 : _a.call(request, (_b = request.requestId) !== null && _b !== void 0 ? _b : "unknown", null, fetchError, this.abortManager); });
                return { results: [], errors: this.errors };
            }
        }
        abort(uniqueId) {
            this.abortManager.abort(uniqueId);
        }
        abortAll() {
            this.abortManager.abortAll();
        }
    }

    exports.AbortManager = AbortManager;
    exports.ConcurrentFetcher = ConcurrentFetcher;
    exports.FetchError = FetchError;
    exports.JsonParseError = JsonParseError;

    return exports;

})({});
