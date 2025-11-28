import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow build to proceed even with ESLint errors
  // Linting is still enforced via separate CI/CD job
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Exclude browser-extension from TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },

  // Exclude browser-extension from build
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    // Exclude browser-extension from compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/browser-extension/**', '**/node_modules/**'],
    }
    return config
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 80, 85, 90, 95, 100],
  },

  // Security Headers (CRITICAL)
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js requires 'unsafe-inline' for inline scripts in both dev and production
              // TODO: Consider implementing nonce-based CSP for enhanced security
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Tailwind requires unsafe-inline
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https: wss:",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ]
      }
    ]
  }
};

export default nextConfig;
