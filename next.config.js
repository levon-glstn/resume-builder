/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
    config.experiments = { ...config.experiments, asyncWebAssembly: true }
    
    // Add worker support
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: { 
        loader: 'worker-loader',
        options: { 
          filename: 'static/[hash].worker.js',
          publicPath: '/_next/'
        }
      }
    })

    return config
  },
  reactStrictMode: true,
  
  // Enable compression for better performance
  compress: true,
  
  // Configure headers for caching and performance
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // Set cache control for static assets - 30 days (in seconds)
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        // Special caching for static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // Longer cache for static assets - 1 year
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Special caching for images
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // Longer cache for images - 1 year
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 