const { withSettingsGradle } = require('@expo/config-plugins');

// Marker string used to detect whether the patch has already been applied (idempotency guard).
const PATCH_MARKER = '// monorepo-autolinking-fix';

// The exact line expo prebuild generates that we need to replace.
const OLD = 'ex.autolinkLibrariesFromCommand(expoAutolinking.rnConfigCommand)';

// Replacement: resolves the monorepo apps/mobile dir at Gradle config time and passes it as
// --project-root so react-native-config reads apps/mobile/package.json (where @react-native-firebase
// and other native deps are declared) instead of the repo-root package.json (which has only turbo).
const NEW = [
  '// EAS root prebuild fix: react-native-config must use apps/mobile as project root',
  '      // to discover native deps (e.g. @react-native-firebase) declared in apps/mobile/package.json.',
  '      def mobileRoot = rootDir.getAbsoluteFile().getParentFile().absolutePath + "/apps/mobile"',
  '      ex.autolinkLibrariesFromCommand(expoAutolinking.rnConfigCommand + ["--project-root", mobileRoot]) // monorepo-autolinking-fix',
].join('\n');

module.exports = function withAndroidAutolinkingFix(config) {
  return withSettingsGradle(config, (config) => {
    const contents = config.modResults.contents;

    if (contents.includes(PATCH_MARKER)) {
      // Already patched — prebuild was run more than once. No-op.
      return config;
    }

    if (!contents.includes(OLD)) {
      throw new Error(
        'withAndroidAutolinkingFix: expected target line not found in settings.gradle.\n' +
          'expo-modules-autolinking may have changed its generated output format.\n' +
          'Expected: ' + OLD
      );
    }

    config.modResults.contents = contents.replace(OLD, NEW);
    return config;
  });
};
