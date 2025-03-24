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
        const errors = result.filter(answer => answer.status === 'rejected');
        const results = result.filter(answer => answer.status !== 'rejected');
//console.log(results);

        expect(errors.length).toEqual(0);
        expect(results.length).toEqual(2);
        expect(results[0].value.data).toEqual({ data: 'result1' });
        expect(results[1].value.data).toEqual({ data: 'result2' });
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
        const errors = result.filter(answer => answer.status === 'rejected');
        const results = result.filter(answer => answer.status !== 'rejected');

        expect(results.length).toBe(1);
        expect(results[0].value.data).toEqual({ data: 'result2' });
        expect(errors.length).toBe(1);
        expect(errors[0].reason.error.message).toBe('Fetch error 1');
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('ConcurrentFetcher - handle TypeError...', async () => {
        const requests = [{ url: 'https://example.com/api/1' }];
        fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);

        mockFetch.mockResolvedValueOnce({ ok: true, text: async () => '{invalid json}', headers: new Map([["content-type","application/json"]])});

        const result = await fetcher.concurrentFetch();
        const errors = result.filter(answer => answer.status === 'rejected');
        const results = result.filter(answer => answer.status !== 'rejected');

        expect(results.length).toEqual(0);
        expect(errors.length).toBe(1);
        expect(errors[0].reason.error.name).toBe('TypeError');
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
       const errors = result.filter(answer => answer.status === 'rejected');
       const results = result.filter(answer => answer.status !== 'rejected');

      expect(results.length).toEqual(1);
      if (results.length > 0) {
        expect(results[0].value.data).toEqual({ data: 'result1' });
      }
    });

    it('ConcurrentFetcher - handle cutoff amount', async () => {
        const requests = [{ url: 'https://example.com/api/1', cutoffAmount: 1 }];
        fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);

        const byteArrayLength = 16;
        const byteArrayBytes = 65536; // 16*65536==4*262144==1024*1024
        const byteArray = [byteArrayLength];
        for (let i = 0; i < byteArrayLength; i++) {
            byteArray[i] = new Uint8Array(byteArrayBytes);
            for (let j = 0; j < byteArrayBytes; j++) {
                byteArray[i][j] = Math.floor(Math.random()*255);
            }
        }
        //console.log("byteArray length", byteArray.length);

        const mockReader = {
            read: jest.fn()
                .mockResolvedValueOnce({ done: false, value: byteArray[0] })
                .mockResolvedValueOnce({ done: false, value: byteArray[1] })
                .mockResolvedValueOnce({ done: false, value: byteArray[2] })
                .mockResolvedValueOnce({ done: false, value: byteArray[3] })
                .mockResolvedValueOnce({ done: false, value: byteArray[4] })
                .mockResolvedValueOnce({ done: false, value: byteArray[5] })
                .mockResolvedValueOnce({ done: false, value: byteArray[6] })
                .mockResolvedValueOnce({ done: false, value: byteArray[7] })
                .mockResolvedValueOnce({ done: false, value: byteArray[8] })
                .mockResolvedValueOnce({ done: false, value: byteArray[9] })
                .mockResolvedValueOnce({ done: false, value: byteArray[10] })
                .mockResolvedValueOnce({ done: false, value: byteArray[11] })
                .mockResolvedValueOnce({ done: false, value: byteArray[12] })
                .mockResolvedValueOnce({ done: false, value: byteArray[13] })
                .mockResolvedValueOnce({ done: false, value: byteArray[14] })
                .mockResolvedValueOnce({ done: false, value: byteArray[15] })
                .mockResolvedValueOnce({ done: true }),
            releaseLock: jest.fn(),
        };

        totalByteLength = 0;
        for (let i = 0; i < byteArrayLength; i++) { totalByteLength += byteArray[i].length; }

        const mockBody = {
            getReader: jest.fn().mockReturnValue(mockReader),
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            body: mockBody,
            headers: new Map([["content-length", totalByteLength]]),
        });

        const result = await fetcher.concurrentFetch();
        const errors = result.filter(answer => answer.status === 'rejected');
        const results = result.filter(answer => answer.status !== 'rejected');

        expect(mockReader.read).toHaveBeenCalled();
        expect(mockReader.releaseLock).toHaveBeenCalled();
        expect(errors.length).toEqual(0);
        expect(results.length).toEqual(1);
        if (results.length > 0) {
            const blob = results[0].value.data;
            expect(blob.size).toEqual(totalByteLength);
        }
    });

    it('ConcurrentFetcher - handle erroneous constructor parameters', async () => {
      let requests = [];
      try {
          fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
      } catch (error) {
          expect(error.message).toEqual('Argument empty: requests');
      }

      requests = [{}];
      try {
          fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
      } catch (error) {
          expect(error.message).toEqual('Argument empty: requests');
      }

      requests = {url: 'https://example.com/api/1'};
      try {
          fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
      } catch (error) {
          expect(error.message).toEqual('Argument is invalid: requests');
      }

      requests = [
            {url: 'https://example.com/api/0', requestId: 'req10'},
            {url: 'https://example.com/api/1', requestId: 'req11'},
            {url: 'https://example.com/api/2', requestId: 'req12'},
            {url: 'https://example.com/api/3', requestId: 'req13'},
            {url: 'https://example.com/api/4', requestId: 'req14'},
            {url: 'https://example.com/api/5', requestId: 'req15'},
            {url: 'https://example.com/api/6', requestId: 'req16'},
            {url: 'https://example.com/api/6', requestId: 'req16'},
            {url: 'https://example.com/api/7', requestId: 'req17'},
            {url: 'https://example.com/api/8', requestId: 'req18'},
            {url: 'https://example.com/api/9', requestId: 'req19'}
      ];
      let errorThrown = null;
      try {
          fetcher = new ConcurrentFetcher.ConcurrentFetcher(requests);
      } catch (error) {
          errorThrown = error;
      }
      expect(errorThrown).toBeInstanceOf(Error);
      if (errorThrown instanceof Error) {
        expect(errorThrown.message).toEqual('Duplicate key: requestId = req16');
      }
    });
});
