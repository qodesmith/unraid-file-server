await Bun.build({
  entrypoints: ['./index.ts'],
  compile: {
    // Using the "baseline" version to support the older CPU powering Unraid.
    target: 'bun-linux-x64-baseline-musl',
    // target: 'bun-linux-x64-musl', // For newer CPUs.
    outfile: './unraidFileServer',
  },
  env: 'inline',
  outdir: '.',
  minify: true,
  sourcemap: 'inline',
})
