import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    test: {
        include: ['**/*.e2e-spec.ts'],
        globals: true,
        root: './',
        setupFiles: ['dotenv/config', 'test/setup.ts'],
    },
    plugins: [tsconfigPaths(), swc.vite({ module: { type: 'es6' } })],
});
