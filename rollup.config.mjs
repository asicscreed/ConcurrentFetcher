export default [
	{
		input: 'dist/concurrentfetcher.js',
		output: [
			{
				file: 'dist/concurrentfetcher.amd.js',
				sourcemap: true,
				format: 'amd'
			},
			{
				file: 'dist/concurrentfetcher.common.js',
				sourcemap: true,
				format: 'cjs'
			},
			{
				file: 'dist/concurrentfetcher.es.js',
				sourcemap: true,
				format: 'es'
			},
			{
				file: 'dist/concurrentfetcher.iife.js',
				sourcemap: true,
                name: 'ConcurrentFetcher',
				format: 'iife'
			},
			{
				file: 'dist/concurrentfetcher.system.js',
				sourcemap: true,
                name: 'ConcurrentFetcher',
				format: 'system'
			},
			{
				file: 'dist/concurrentfetcher.umd.js',
				sourcemap: true,
                name: 'ConcurrentFetcher',
				format: 'umd'
			}
		]
	}
];
