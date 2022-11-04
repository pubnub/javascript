require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    resolveJsonModule: true,
    moduleResolution: 'node',
    experimentalDecorators: true,
    target: 'es5',
    sourceMap: true,
    esModuleInterop: true,
  },
});
