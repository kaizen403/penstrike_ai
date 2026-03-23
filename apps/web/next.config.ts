import type { NextConfig } from "next";

const config: NextConfig = {
  outputFileTracingRoot: require("path").join(__dirname, "../../"),
};

export default config;
