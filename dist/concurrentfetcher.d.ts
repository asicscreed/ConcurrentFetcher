export declare class FetchError extends Error {
    url: string;
    status: number;
    constructor(message: string, url: string, status: number);
}
export declare class JsonParseError extends Error {
    url: string;
    constructor(message: string, url: string);
}
export declare class AbortManager {
    private controllers;
    constructor();
    createSignal(uniqueId: string): AbortSignal;
    abort(uniqueId: string): void;
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
export declare class ConcurrentFetcher {
    private requests;
    private errors;
    private abortManager;
    constructor(requests: RequestItem[]);
    concurrentFetch({ progressCallback }?: ConcurrentFetchOptions): Promise<ConcurrentFetchResult>;
    abort(uniqueId: string): void;
    abortAll(): void;
}
export {};
