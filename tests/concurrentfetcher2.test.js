const ConcurrentFetcher = require('../dist/concurrentfetcher.common');

describe('ConcurrentFetcher', () => {
    let fetcher;
    let mockFetch;

    beforeEach(() => {
        mockFetch = jest.spyOn(global, 'fetch');
        //fetcher = new ConcurrentFetcher.ConcurrentFetcher([]);
    });

    afterEach(() => {
        mockFetch.mockRestore();
    });

    it('ConcurrentFetcher - fetch all requests and return results', async () => {
        const requests = [
            { url: 'https://example.com/api/1' },
            { url: 'https://example.com/api/2' },
        ];
        fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: 'result1' }), headers: new Map([["content-type","application/json"]])});
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: 'result2' }), headers: new Map([["content-type","application/json"]])});

        const result = await fetcher.concurrentFetch();

        expect(result.results).toEqual([{ data: 'result1' }, { data: 'result2' }]);
        expect(result.errors).toEqual([]);
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('ConcurrentFetcher - handle fetch errors and store them in errors array', async () => {
        const requests = [
            { url: 'https://example.com/api/1' },
            { url: 'https://example.com/api/2' },
        ];
        fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);

        mockFetch.mockRejectedValueOnce(new Error('Fetch error 1'));
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: 'result2' }), headers: new Map([["content-type","application/json"]])});

        const result = await fetcher.concurrentFetch();

        expect(result.results).toEqual([{ data: 'result2' }]);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].error.message).toBe('Fetch error 1');
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('ConcurrentFetcher - handle TypeError...', async () => {
        const requests = [{ url: 'https://example.com/api/1' }];
        fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);

        mockFetch.mockResolvedValueOnce({ ok: true, text: async () => '{invalid json}', headers: new Map([["content-type","application/json"]])});

        const result = await fetcher.concurrentFetch();

        expect(result.results).toEqual([]);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].error.name).toBe('TypeError');
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('ConcurrentFetcher - call callback function if provided', async () => {
        //const callback = jest.fn();
        const reqId = 'req4711';
        let cbCount = 0;
        let cbdata = null;
        let cbuniqueId = '';
        let cberror = null;
        const requests = [
            { url: 'https://example.com/api/1',
              requestId: reqId,
              callback: (uniqueId, data, error, abortManager) => {
                cbCount++;
                cbuniqueId = uniqueId;
                cbdata = data;
                cberror = error;
              }
            }
        ];
        fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);

        const reqJson = { data: 'result1' };
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => (reqJson), headers: new Map([["content-type","application/json"]])});

        await fetcher.concurrentFetch();

        expect(cbCount).toEqual(1);
        expect(cbuniqueId).toEqual(reqId);
        expect(cbdata).toEqual(reqJson);
        expect(cberror).toEqual(null);
        //expect(callback).toHaveBeenCalledWith('0', { data: 'result1' }, null, []);
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('ConcurrentFetcher - handle progress callback', async () => {
        const progressCallback = jest.fn();
        const requests = [{ url: 'https://example.com/api/1' }];
        fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: 'result1' }), headers: new Map([["content-type","application/json"]])});

        await fetcher.concurrentFetch({ progressCallback });

        expect(progressCallback).toHaveBeenCalledTimes(1);
    });

    it('ConcurrentFetcher - handle retries', async () => {
        const requests = [{ url: 'https://example.com/api/1', maxRetries: 1, statusCodesToRetry: [[500, 599]], retryDelay: 10 }];
        fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);

        mockFetch.mockResolvedValueOnce({ ok: false, status: 500, headers: new Map([["content-type","application/json"]])});
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: 'result1' }), headers: new Map([["content-type","application/json"]])});

        await fetcher.concurrentFetch();

        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('ConcurrentFetcher - handle force text', async () => {
      const requests = [{ url: 'https://example.com/api/1', forceText: true }];
      fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: 'result1' }), headers: new Map([["content-type","application/json"]])});

      const result = await fetcher.concurrentFetch();

      expect(result.results).toEqual(['{"data":"result1"}']);
    });

    it('ConcurrentFetcher - handle cutoff amount', async () => {
        const requests = [{ url: 'https://example.com/api/1', cutoffAmount: 1000 }];
        fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);

        const byteArrayLength = 10000;
        const byteArray = new Uint8Array(byteArrayLength);
        for (let i = 0; i < byteArrayLength; i++) { byteArray[i] = Math.floor(Math.random()*255); }

        const mockReader = {
            read: jest.fn()
                .mockResolvedValueOnce({ done: false, value: byteArray })
                .mockResolvedValueOnce({ done: true }),
            releaseLock: jest.fn(),
        };

        const mockBody = {
            getReader: jest.fn().mockReturnValue(mockReader),
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            body: mockBody,
            headers: new Map([["content-length", byteArray.length]]),
        });

        await fetcher.concurrentFetch();

        expect(mockReader.read).toHaveBeenCalled();
        expect(mockReader.releaseLock).toHaveBeenCalled();
    });
});
