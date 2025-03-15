const ConcurrentFetcher = require('../dist/concurrentfetcher.common');

// Mock fetch for testing
global.fetch = jest.fn();

describe('ConcurrentFetcher class', () => {
    beforeEach(() => {
        fetch.mockClear();
    });
    
    it('should make a successful GET request', async () => {
        const mockResponseData = { message: 'Success!' };
        const mockResponse = new Response(JSON.stringify(mockResponseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
        fetch.mockResolvedValue(mockResponse);

        const requests = [ { url: "https://api.example.com/doesntmatter" } ];
        const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
        const data = await fetcher.concurrentFetch();
        const errors = data.errors ?? {};
        const results = data.results ?? {};
        expect(errors.length).toEqual(0);
        expect(results.length).toEqual(1);
        if (results.length > 0) {
            expect(results[0]).toEqual(mockResponseData);
        }
    });

    it('should use URLSearchParams in request URL', async () => {
        const mockResponseData = { message: 'Success!' };
        const mockResponse = new Response(JSON.stringify(mockResponseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
        fetch.mockResolvedValue(mockResponse);

        const baseUrl = 'https://api.example.com/search';
        const params = new URLSearchParams({
            query: 'test',
            page: '1',
        });
        const tstUrl = `${baseUrl}?${params.toString()}`;
        const requests = [ { url: tstUrl } ];
        const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
        const data = await fetcher.concurrentFetch();
        const errors = data.errors ?? {};
        const results = data.results ?? {};
        expect(errors.length).toEqual(0);
        expect(results.length).toEqual(1);
        if (results.length > 0) {
            expect(results[0]).toEqual(mockResponseData);
        }
    });

    it('should handle a 404 error', async () => {
        const tstStatus = 404;
        const mockResponse = new Response(null, {
            status: tstStatus,
            statusText: 'Not Found'
        });
        fetch.mockResolvedValue(mockResponse);

        const tstUrl = "https://api.example.com/doesntmatter";
        const tstRequestId = 'req'+Math.floor(Math.random()*55);

        const requests = [ { url: tstUrl, requestId: tstRequestId } ];
        const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
        const data = await fetcher.concurrentFetch();
        const errors = data.errors ?? {};
        const results = data.results ?? {};
        expect(results.length).toEqual(0);
        expect(errors.length).toEqual(1);
        if (errors.length == 1) {
            const { uniqueId, url, error } = errors[0];
            const errorType = (error instanceof ConcurrentFetcher.FetchError)
                ? "FetchError" : (error instanceof TypeError)
                ? "TypeError" : "Error";
            expect(errorType).toEqual('FetchError');
            if (errorType == 'FetchError') { expect(error.status).toEqual(tstStatus); }
            expect(url).toEqual(tstUrl);
            expect(uniqueId).toEqual(tstRequestId);
        }
    });

    it('should handle a network error', async () => {
        const tstMessage = 'Network request failed';
        const mockError = new TypeError(tstMessage);
        fetch.mockRejectedValue(mockError);

        const tstUrl = "https://api.example.com/doesntmatter";
        const tstRequestId = 'req'+Math.floor(Math.random()*55);

        const requests = [ { url: tstUrl, requestId: tstRequestId } ];
        const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
        const data = await fetcher.concurrentFetch();
        const errors = data.errors ?? {};
        const results = data.results ?? {};
        expect(results.length).toEqual(0);
        expect(errors.length).toEqual(1);
        if (errors.length == 1) {
            const { uniqueId, url, error } = errors[0];
            const errorType = (error instanceof ConcurrentFetcher.FetchError)
                ? "FetchError" : (error instanceof TypeError)
                ? "TypeError" : "Error";
            expect(errorType).toEqual('TypeError');
            if (errorType == 'TypeError') { expect(error.message).toEqual(tstMessage); }
            expect(url).toEqual(tstUrl);
            expect(uniqueId).toEqual(tstRequestId);
        }
    });
});
//    it('should handle a custom Request init object', async () => {
//        const mockResponseData = { result: 'Custom request' };
//        const mockResponse = new Response(JSON.stringify(mockResponseData), {
//            status: 200,
//            headers: { 'Content-Type': 'application/json' },
//        });

//        fetch.mockResolvedValue(mockResponse);

//        const url = 'https://api.example.com/custom';
//        const requestInit = {
//            method: 'PUT',
//            headers: {
//                'X-Custom-Header': 'custom-value',
//            },
//            body: JSON.stringify({ custom: 'data' }),
//            mode: 'cors',
//        };

//        const response = await fetch(url, requestInit);

//        expect(fetch).toHaveBeenCalledWith(url, requestInit);
//        expect(response.status).toBe(200);

//        const data = await response.json();
//        expect(data).toEqual(mockResponseData);
//    });
