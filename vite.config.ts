import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
	root: 'src/app/ui/pages',
	server: {
		open: '/testing.html',
	},
	build: {
		outDir: '../../../../dist/ui',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				testing: resolve(__dirname, 'src/app/ui/pages/testing.html'),
			},
		},
	},
});
