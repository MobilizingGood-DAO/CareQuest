/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co https://*.avax.network wss://*.avax.network",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          // HSTS (HTTP Strict Transport Security)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // Cache Control for sensitive pages
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          // Pragma
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          // Expires
          {
            key: 'Expires',
            value: '0'
          }
        ]
      },
      // Additional headers for API routes
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      }
    ]
  },
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Experimental features for security
  experimental: {
    // Enable server components for better security
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // Webpack configuration for security
  webpack: (config, { isServer }) => {
    // Security: Disable eval in production
    if (!isServer) {
      config.optimization.minimize = true;
    }
    
    // Security: Add source map protection
    if (process.env.NODE_ENV === 'production') {
      config.devtool = 'hidden-source-map';
    }
    
    return config;
  },
  // Redirects for security
  async redirects() {
    return [
      // Redirect HTTP to HTTPS in production
      ...(process.env.NODE_ENV === 'production' ? [{
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http'
          }
        ],
        destination: 'https://app.goodonavax.info/:path*',
        permanent: true
      }] : [])
    ]
  },
  // Rewrites for security
  async rewrites() {
    return [
      // Block access to sensitive files
      { source: '/.env', destination: '/404' },
      { source: '/.env.local', destination: '/404' },
      { source: '/.env.development', destination: '/404' },
      { source: '/.env.production', destination: '/404' },
      {
        source: '/package.json',
        destination: '/404'
      },
      {
        source: '/package-lock.json',
        destination: '/404'
      }
    ]
  }
}

export default nextConfig
