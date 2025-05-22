import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import path from 'node:path';
import UnoCSS from 'unocss/vite';
import extractorSvelte from '@unocss/extractor-svelte';

export default defineConfig({
	plugins: [
		UnoCSS({
			extractors: [extractorSvelte()]
		}),
		sveltekit()
	],
	resolve: {
		alias: {
			'@testing-library/svelte': path.resolve('./src/test-utils/testing-library-svelte.ts')
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom'
	}
});
