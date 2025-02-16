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

    // Add JSX support
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: ['babel-loader'],
      exclude: /node_modules/,
    })

    return config
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig 