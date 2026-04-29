// Root-level metro config for EAS builds (project root = git root).
// For local dev, apps/mobile/metro.config.js is used when running from apps/mobile/.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const mobileRoot = path.join(projectRoot, "apps/mobile");

const config = getDefaultConfig(mobileRoot);

config.watchFolders = [projectRoot];

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(mobileRoot, "node_modules"),
    path.resolve(projectRoot, "node_modules"),
  ],
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

module.exports = config;
