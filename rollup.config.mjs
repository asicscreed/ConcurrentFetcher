export default [
	{
		input: 'dist/concurrentfetcher.js',
		output: [
			{
				file: 'dist/concurrentfetcher.amd.js',
				sourcemap: false,
				format: 'amd'
			},
			{
				file: 'dist/concurrentfetcher.common.js',
				sourcemap: false,
				format: 'cjs'
			},
			{
				file: 'dist/concurrentfetcher.es.js',
				sourcemap: false,
				format: 'es'
			},
			{
				file: 'dist/concurrentfetcher.iife.js',
				sourcemap: false,
                name: 'ConcurrentFetcher',
				format: 'iife'
			},
			{
				file: 'dist/concurrentfetcher.system.js',
				sourcemap: false,
                name: 'ConcurrentFetcher',
				format: 'system'
			},
			{
				file: 'dist/concurrentfetcher.umd.js',
				sourcemap: false,
                name: 'ConcurrentFetcher',
				format: 'umd'
			}
		]
	}
];
