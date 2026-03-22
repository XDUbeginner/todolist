import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
    root: 'public',
    base: '/',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: 'index.html'
            }
        }
    },
    plugins: [
        basicSsl()
    ],
    server: {
        port: 3000,
        https: true,
        fs: {
            allow: ['..']
        }
    },
    test: {
        environment: 'jsdom'
    }
});