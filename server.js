const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const compression = require('compression');
const express = require('express');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  
  // Apply gzip compression
  server.use(compression({
    level: 6, // Compression level (0-9, where 9 is best compression but slowest)
    threshold: 0, // Compress all responses
    filter: (req, res) => {
      // Don't compress responses with this request header
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Compress everything else
      return compression.filter(req, res);
    }
  }));
  
  // Add custom cache control headers for different file types
  server.use((req, res, next) => {
    // Set Vary header to handle different client capabilities
    res.setHeader('Vary', 'Accept-Encoding');
    
    // Handle Next.js request
    next();
  });
  
  // Let Next.js handle all requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });
  
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}); 