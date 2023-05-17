/** @type {import('next').NextConfig} */
////
///
// next.config.js

const nextConfig = {
  eslint: {
    dirs: [
      'resources',
      'scripts',
      'server',
      'src',
      'types',
      'utils',
    ],
    ignoreDuringBuilds: true,
  },
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
      process: 'process/browser',
      stream: require.resolve('stream-browserify'),
    }
    // }
    
    return config
  },
}

module.exports = nextConfig
