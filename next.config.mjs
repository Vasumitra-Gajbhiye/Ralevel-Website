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
    ],
  },

  async redirects() {
    return [
      {
        source: "/ads.txt",
        destination: "https://srv.adstxtmanager.com/19390/ralevel.com",
        permanent: true,
      },
    ];
  },

  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https: data:",
      "font-src 'self' https: data:",
      "connect-src 'self' https:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'", // prevents plugin injection
      "frame-src 'self'", // blocks embedding external frames
    ].join("; ");

    return [
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
            value: "same-origin",
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
