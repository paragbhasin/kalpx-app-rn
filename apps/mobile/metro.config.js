const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const monorepoRoot = path.resolve(__dirname, "../..");

const config = getDefaultConfig(__dirname);

// Monorepo support: watch packages/ from root
config.watchFolders = [monorepoRoot];

// Resolve @kalpx/* packages from monorepo root node_modules
config.resolver = {
  ...config.resolver,
  unstable_enableSymlinks: true,
  nodeModulesPaths: [
    path.resolve(__dirname, "node_modules"),
    path.resolve(monorepoRoot, "node_modules"),
  ],
  extraNodeModules: {
    "@kalpx/analytics": path.resolve(monorepoRoot, "packages/analytics"),
    "strict-uri-encode": path.resolve(
      monorepoRoot,
      "node_modules/.pnpm/strict-uri-encode@2.0.0/node_modules/strict-uri-encode"
    ),
  },
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

module.exports = config;
