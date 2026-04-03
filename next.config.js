/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),

  async headers() {
    return [
      {
        source: '/terminal',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-src 'self' http://localhost:3020 http://192.168.0.0/16 http://192.168.1.0/16; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3020",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
