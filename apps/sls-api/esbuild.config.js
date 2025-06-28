const config = () => {
  /** @type {import('esbuild').BuildOptions} */
  const config = {
    // Enable or Disable bundling the function code and dependencies into a single file. (Default: true)
    bundle: true,
    // Set the target ECMAScript version to ES6
    target: 'es2020',
    platform: 'node',
    // format: 'cjs',
    format: 'esm',
    // NPM packages to not be bundled, and instead be available in node_modules, and the zip file uploaded to Lambda.
    //
    // This property only makes sense if bundling is enabled.
    //
    // If no excludes (see below) are specified, and the runtime is set to nodejs16.x or lower,
    // we automatically add "aws-sdk" to the list of externals.
    //
    // If no excludes (see below) are specified, and the runtime is set to nodejs18.x or higher,
    // we automatically add "aws-sdk/*" to the list of externals.
    //
    // Glob patterns are supported here.
    external: ['@aws-sdk/client-s3'],
    // The packages config, this can be set to override the behavior of external
    // If this is set then all dependencies will be treated as external and not bundled.
    // packages: 'external',
    // NPM packages to not be included in node_modules, and the zip file uploaded to Lambda.
    //
    // This option only makes most sense if bundling is disabled. But if bundling is enabled and externals are specified
    // this property can be useful to further control which external packages to be included/excluded from the zip file.
    //
    // Everything specified here is also added to the list of externals (see above).
    //
    // Glob patterns are supported here.
    exclude: ['@aws-sdk/*'],
    // By default Framework will attempt to build and package all functions concurrently.
    // This property can bet set to a different number if you wish to limit the
    // concurrency of those operations.
    buildConcurrency: 3,
    // Enable or Disable minifying the built code. (Default: false)
    minify: false,
    // Enable or configure sourcemaps, can be set to true or to an object with further configuration.
    sourcemap: true,

    // sourcemap: {
    //   // The sourcemap type to use, options are (inline, linked, or external)
    //   type: 'linked',
    //   // Whether to set the NODE_OPTIONS on functions to enable sourcemaps on Lambda
    //   setNodeOptions: true,
    // },
  }

  return config
}

export default config
