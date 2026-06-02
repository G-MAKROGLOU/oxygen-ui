import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts', 'src/tokens/index.ts', 'src/icons/index.ts'],
    format: ['esm', 'cjs'],
    dts: { resolve: true },
    tsconfig: 'tsconfig.json',
    sourcemap: true,
    clean: true,
    // CSS is injected via PostCSS — emit a separate styles.css
    injectStyle: false,
    external: ['react', 'react-dom'],
    treeshake: true,
    splitting: true,           // code-split per component for per-import tree-shaking
    esbuildOptions(options) {
        options.banner = {
            js: '"use client"',   // Next.js RSC compatibility
        }
    },
})
