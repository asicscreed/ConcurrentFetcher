const ConcurrentFetcher = require('../dist/concurrentfetcher.common');

// Mock fetch for testing
global.fetch = jest.fn();

describe('ConcurrentFetcher class', () => {
    beforeEach(() => {
        fetch.mockClear();
    });
    
    it('ConcurrentFetcher - make a successful GET request', async () => {
        const mockResponseData = { message: 'Success!' };
        const mockResponse = new Response(JSON.stringify(mockResponseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
        fetch.mockResolvedValue(mockResponse);

        const requests = [ { url: 'https://api.example.com/doesntmatter' } ];
        const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
        const data = await fetcher.concurrentFetch();
        const errors = data.errors ?? {};
        const results = data.results ?? {};
        expect(errors.length).toEqual(0);
        expect(results.length).toEqual(1);
        if (results.length > 0) {
//console.log(results);
            expect(results[0]).toEqual(mockResponseData);
        }
    });

    it('ConcurrentFetcher - use URLSearchParams in request URL', async () => {
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

    it('ConcurrentFetcher - handle a 404 error', async () => {
        const tstStatus = 404;
        const mockResponse = new Response(null, {
            status: tstStatus,
            statusText: 'Not Found'
        });
        fetch.mockResolvedValue(mockResponse);

        const tstUrl = 'https://api.example.com/doesntmatter';
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
            //const errorType = (error instanceof ConcurrentFetcher.FetchError) ? 'FetchError' : 'Error';
            //expect(errorType).toEqual('FetchError');
            //if (errorType == 'FetchError') { expect(error.status).toEqual(tstStatus); }
            if (error instanceof ConcurrentFetcher.FetchError) { expect(error.status).toEqual(tstStatus); }
            expect(error).toBeInstanceOf(ConcurrentFetcher.FetchError);
            expect(error).toBeInstanceOf(Error);
            expect(url).toEqual(tstUrl);
            expect(uniqueId).toEqual(tstRequestId);
        }
    });

    it('ConcurrentFetcher - handle a network error', async () => {
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
            //const errorType = (error instanceof TypeError) ? "TypeError" : "Error";
            //expect(errorType).toEqual('TypeError');
            //if (errorType == 'TypeError') { expect(error.message).toEqual(tstMessage); }
            if (error instanceof TypeError) { expect(error.message).toEqual(tstMessage); }
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toBeInstanceOf(Error);
            expect(url).toEqual(tstUrl);
            expect(uniqueId).toEqual(tstRequestId);
        }
    });

    it('ConcurrentFetcher - handle a custom Request init object', async () => {
        const mockResponseData = { result: 'Custom request' };
        const mockResponse = new Response(JSON.stringify(mockResponseData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

        fetch.mockResolvedValue(mockResponse);

        const tstUrl = 'https://api.example.com/custom';
        const requests = [{
            url: tstUrl,
            method: 'PUT',
            headers: {
                'X-Custom-Header': 'custom-value',
            },
            body: JSON.stringify({ custom: 'data' }),
            mode: 'cors',
        }];

        const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
        const data = await fetcher.concurrentFetch();
        const errors = data.errors ?? {};
        const results = data.results ?? {};
        expect(errors.length).toEqual(0);
        expect(results.length).toEqual(1);
        if (results.length > 0) {
//console.log(results);
            expect(results[0]).toEqual(mockResponseData);
        }
    });

    it('ConcurrentFetcher - handle a JsonParseError', async () => {
        const mockResponseData = '{"invalid_number": 01},';
        const mockResponse = new Response(mockResponseData, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
        fetch.mockResolvedValue(mockResponse);

        const tstUrl = 'https://api.example.com/doesntmatter';
        const tstRequestId = 'req'+Math.floor(Math.random()*55);
        const requests = [
            { url: tstUrl,
              method: 'POST',
              requestId: tstRequestId,
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json; charset: UTF-8',
              },
              body: JSON.stringify({ custom: 'data' }),
            }
        ];
        const fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
        const data = await fetcher.concurrentFetch();
        const errors = data.errors ?? {};
        const results = data.results ?? {};
        //if (results.length == 1) { console.log(results[0]); }
        expect(results.length).toEqual(0);
        expect(errors.length).toEqual(1);
        if (errors.length == 1) {
        ////    console.log(errors);
            const { uniqueId, url, error } = errors[0];
            //const errorType = (error instanceof ConcurrentFetcher.JsonParseError) ?
            //        'JsonParseError' : (error instanceof SyntaxError) ?
            //        'SyntaxError' : 'Error';
            //expect(errorType).toEqual('JsonParseError');
          //expect(error).toBeInstanceOf(ConcurrentFetcher.JsonParseError);
            expect(error).toBeInstanceOf(SyntaxError);
            expect(error).toBeInstanceOf(Error);
            expect(url).toEqual(tstUrl);
            expect(uniqueId).toEqual(tstRequestId);
        }
    });

    // AbortManager
  it('AbortManager - create a signal and store the controller', () => {
    const uniqueId = 'test-id';
    const abortManager = new ConcurrentFetcher.AbortManager();
    const signal = abortManager.createSignal(uniqueId);

    expect(signal).toBeInstanceOf(AbortSignal);
    expect(abortManager.controllers.has(uniqueId)).toBe(true);
  });

  it('AbortManager - abort a specific signal and remove the controller', () => {
    const uniqueId = 'test-id';
    const abortManager = new ConcurrentFetcher.AbortManager();
    const signal = abortManager.createSignal(uniqueId);
    const abortHandler = jest.fn();
    signal.addEventListener('abort', abortHandler);

    abortManager.abort(uniqueId);

    expect(abortHandler).toHaveBeenCalled();
    expect(abortManager.controllers.has(uniqueId)).toBe(false);
  });

  it('AbortManager - not abort if the uniqueId does not exist', () => {
    const uniqueId = 'test-id';
    const abortManager = new ConcurrentFetcher.AbortManager();
    abortManager.abort(uniqueId);

    expect(abortManager.controllers.has(uniqueId)).toBe(false);
  });

  it('AbortManager - abort all signals and clear the controllers', () => {
    const uniqueId1 = 'test-id-1';
    const uniqueId2 = 'test-id-2';
    const abortManager = new ConcurrentFetcher.AbortManager();
    const signal1 = abortManager.createSignal(uniqueId1);
    const signal2 = abortManager.createSignal(uniqueId2);
    const abortHandler1 = jest.fn();
    const abortHandler2 = jest.fn();
    signal1.addEventListener('abort', abortHandler1);
    signal2.addEventListener('abort', abortHandler2);

    abortManager.abortAll();

    expect(abortHandler1).toHaveBeenCalled();
    expect(abortHandler2).toHaveBeenCalled();
    expect(abortManager.controllers.size).toBe(0);
  });

  it('AbortManager - handle abortAll when no signals are created', () => {
    const abortManager = new ConcurrentFetcher.AbortManager();
      abortManager.abortAll();
      expect(abortManager.controllers.size).toBe(0);
  });

  it('AbortManager - handle abort when the uniqueId is already aborted', () => {
      const uniqueId = 'test-id';
    const abortManager = new ConcurrentFetcher.AbortManager();
      abortManager.createSignal(uniqueId);
      abortManager.abort(uniqueId);
      abortManager.abort(uniqueId); // Second abort should do nothing.
      expect(abortManager.controllers.has(uniqueId)).toBe(false);
  });

  it('FetchError - create a instance with correct properties', () => {
    const message = 'Network request failed';
    const url = 'https://example.com/api/data';
    const status = 500;

    const error = new ConcurrentFetcher.FetchError(message, url, status);

    expect(error).toBeInstanceOf(ConcurrentFetcher.FetchError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('FetchError');
    expect(error.message).toBe(message);
    expect(error.url).toBe(url);
    expect(error.status).toBe(status);
  });

  it('FetchError - create a instance with default super constructor properties', () => {
    const message = 'Something went wrong';
    const url = 'https://example.com/api/test';
    const status = 404;

    const error = new ConcurrentFetcher.FetchError(message, url, status);

    expect(error.stack).toBeDefined(); // Check if stack trace is present, inherited from Error
  });

  it('FetchError - handle different data types for status and url', () => {
    const message = 'Invalid data';
    const url = 123;
    const status = '400';

    const error = new ConcurrentFetcher.FetchError(message, url, status);

    expect(error.url).toBe(123);
    expect(error.status).toBe('400');
  });

  it('FetchError - handle undefined parameters', () => {
    const error = new ConcurrentFetcher.FetchError();
    //expect(error.message).toBe(undefined);
    expect(error.url).toBe(undefined);
    expect(error.status).toBe(undefined);
  });

  it('FetchError - handle null parameters', () => {
    const error = new ConcurrentFetcher.FetchError(null,null,null);
    //expect(error.message).toBe(null);
    expect(error.url).toBe(null);
    expect(error.status).toBe(null);
  });

  it('JsonParseError - create a instance with correct properties', () => {
    const message = 'Network request failed';
    const url = 'https://example.com/api/data';

    const error = new ConcurrentFetcher.JsonParseError(message, url);

    expect(error).toBeInstanceOf(ConcurrentFetcher.JsonParseError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('JsonParseError');
    expect(error.message).toBe(message);
    expect(error.url).toBe(url);
  });

  it('JsonParseError - create a instance with default super constructor properties', () => {
    const message = 'Something went wrong';
    const url = 'https://example.com/api/test';

    const error = new ConcurrentFetcher.JsonParseError(message, url);

    expect(error.stack).toBeDefined(); // Check if stack trace is present, inherited from Error
  });

  it('JsonParseError - handle different data types for status and url', () => {
    const message = 'Invalid data';
    const url = 123;

    const error = new ConcurrentFetcher.JsonParseError(message, url);

    expect(error.url).toBe(123);
  });

  it('JsonParseError - handle undefined parameters', () => {
    const error = new ConcurrentFetcher.JsonParseError();
    expect(error.url).toBe(undefined);
  });

  it('JsonParseError - handle null parameters', () => {
    const error = new ConcurrentFetcher.JsonParseError(null,null,null);
    expect(error.url).toBe(null);
  });

  it('Error - throw Error', () => {
   let myError = new Error('some message');
   myError.data = { name: 'myError',
                    desc: 'myDescription' };
   let thrownError;

   try { throw myError; } catch(error) { thrownError = error; }

   expect(thrownError.data).toEqual({ name: 'myError',
                                      desc: 'myDescription' });
  });
});
