/** @type {import('next').NextConfig} */
////
///
// lockpage › next.config.js

module.exports = {
  distDir: 'export',
  eslint: {
    dirs: [
      'src',
    ],
    ignoreDuringBuilds: true,
  },
  output: 'export',
  pageExtensions: [
    'page.tsx',
    'page.ts',
    'page.jsx',
    'page.js',
    'api.tsx',
    'api.ts',
    'api.jsx',
    'api.js',
  ],
  reactStrictMode: true,
  
  webpack: (config/*, { isServer }*/) => {
    
    // Add TypeScript loader
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    })
    
    // Resolve .ts and .tsx extensions
    config.resolve.extensions.push('.ts', '.tsx')

    // if (!isServer) {
    config.resolve.fallback = { // eslint-disable-line no-param-reassign
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    }
    // }

    return config
  },
}
