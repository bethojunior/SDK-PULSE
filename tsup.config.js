import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.js',
    auto: 'src/auto.js'
  },
  format: ['esm', 'cjs'],
  dts: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2020'
});
