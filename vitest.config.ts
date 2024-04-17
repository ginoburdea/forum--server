import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    test: {
        root: './',
        setupFiles: ['dotenv/config', 'test/setup.ts'],
        fileParallelism: false,
    },
    plugins: [tsconfigPaths(), swc.vite({ module: { type: 'es6' } })],
});
