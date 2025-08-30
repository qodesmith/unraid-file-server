await Bun.build({
  entrypoints: ['./index.ts'],
  compile: {
    target: 'bun-linux-x64-baseline-musl',
    outfile: './unraidFileServer',
  },
  env: 'inline',
  outdir: '.',
  minify: true,
  sourcemap: 'inline',
})
