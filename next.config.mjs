import { createRequire } from "module";
const require = createRequire(import.meta.url);
const json = require("./package.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    instrumentationHook: true,
  },
  publicRuntimeConfig: {
    nextVersion: json.dependencies.next,
  },
};

export default nextConfig;
