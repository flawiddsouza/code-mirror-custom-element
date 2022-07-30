import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/code-mirror.js',
            formats: ['es']
        }
    }
})
