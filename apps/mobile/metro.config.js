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
    "react-native-vector-icons": path.resolve(
      monorepoRoot,
      "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons"
    ),
  },
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
  resolveRequest: (context, moduleName, platform) => {
    // Force all bare react-native imports to the canonical copy in apps/mobile.
    // pnpm creates a second copy for packages with different peer-dep context hashes;
    // Metro bundles both, creating two AppRegistry/InitializeCore instances in the same
    // Hermes runtime. Expo registers 'main' on copy 1; the Fabric renderer boots from
    // copy 2 and calls runApplication where 'main' is absent → Invariant Violation.
    // Fix: resolve as if the import comes from apps/mobile so Metro finds the copy
    // in apps/mobile/node_modules/react-native (the canonical symlink).
    if (
      moduleName === "react-native" ||
      (moduleName.startsWith("react-native/") && !moduleName.startsWith("react-native-"))
    ) {
      return context.resolveRequest(
        { ...context, originModulePath: path.resolve(__dirname, "App.jsx") },
        moduleName,
        platform
      );
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

module.exports = config;
