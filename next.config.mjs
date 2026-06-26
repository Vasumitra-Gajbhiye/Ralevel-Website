// import createMDX from "@next/mdx";

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

//   experimental: {
//     mdxRs: true,
//   },

//   images: {
//     domains: ["res.cloudinary.com"],
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "**",
//       },
//     ],
//   },
// };

// const withMDX = createMDX({});

// export default withMDX(nextConfig);

import createMDX from "@next/mdx";
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@r-alevel/discord-bot"],
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  experimental: {
    mdxRs: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/ads.txt",
        destination: "https://srv.adstxtmanager.com/19390/ralevel.com",
        permanent: true,
      },
      {
        source: "/forms",
        destination: "/apply",
        permanent: true,
      },
      {
        source: "/forms/:path*",
        destination: "/apply/:path*",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },

  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  async headers() {
    const clerkOrigins = [
      "https://*.clerk.accounts.dev",
      "https://clerk.ralevel.com",
    ].join(" ");

    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://va.vercel-scripts.com ${clerkOrigins} https://challenges.cloudflare.com`,
      `style-src 'self' 'unsafe-inline' ${clerkOrigins}`,
      "img-src 'self' https: data: https://img.clerk.com https://images.clerk.dev",
      "font-src 'self' https: data:",
      `connect-src 'self' https: ${clerkOrigins}`,
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      `frame-src 'self' https://js.stripe.com ${clerkOrigins} https://challenges.cloudflare.com`,
    ].join("; ");

    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), gyroscope=(), accelerometer=()",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
