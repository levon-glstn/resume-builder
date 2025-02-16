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
}

module.exports = nextConfig 