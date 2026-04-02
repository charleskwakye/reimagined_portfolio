import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        isolate: true,
        threads: false,
        maxThreads: 1,
        setupFiles: ['./src/__tests__/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'text-summary'],
            exclude: [
                'node_modules/',
                'src/__tests__/',
                '**/*.test.ts',
                '**/*.spec.ts',
            ],
        },
        testTimeout: 30000,
        hookTimeout: 60000,
        include: ['src/__tests__/**/*.test.ts'],
        exclude: ['node_modules', 'dist', '.next'],
    },
})
