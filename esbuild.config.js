require('esbuild').build({
    entryPoints: ['code.ts'], // Adjust this to the path of your plugin's source code
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
    outfile: 'code.js', // Output file
  }).catch(() => process.exit(1))
  