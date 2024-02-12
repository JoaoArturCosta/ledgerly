/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  async redirects() {
    return [
      {
        source: "/expenses",
        destination: "/expenses/overview",
        permanent: true,
      },
      {
        source: "/",
        destination: "/api/auth/signin",
        permanent: true
      }
    ];
  },
};

export default config;
