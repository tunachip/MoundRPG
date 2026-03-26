import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
	root: 'src/app/ui/pages',
	server: {
		open: '/maker.html',
	},
	build: {
		outDir: '../../../../dist/ui',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				maker: resolve(__dirname, 'src/app/ui/pages/maker.html'),
				makerLite: resolve(__dirname, 'src/app/ui/pages/maker-lite.html'),
				testing: resolve(__dirname, 'src/app/ui/pages/testing.html'),
			},
		},
	},
});
