/**
 * Expo config plugin — ABI splits for Android
 *
 * Injects a `splits { abi { ... } }` stanza into android/app/build.gradle so
 * every build output drops x86 and x86_64 native libraries. Those ABIs are
 * emulator-only (zero real-device coverage) and cost ~41 MB per fat APK:
 * libreactnative.so + libappmodules.so + libhermes.so + libavif_android.so
 * each ship 2 extra times with no consumer.
 *
 * universalApk=true preserves a fat APK as a fallback so EAS "preview" builds
 * still have a single artifact to upload (the fat APK is now ~140 MB instead
 * of ~184 MB because x86/x86_64 are gone). Per-arch split APKs
 * (arm64-v8a, armeabi-v7a) are also emitted.
 *
 * Play Store AAB (production profile) uses the same split list and
 * auto-delivers the single matching ABI per device at install time.
 *
 * Idempotent — only injects if the stanza isn't already present. Safe to
 * re-run on every `expo prebuild`.
 */
const { withAppBuildGradle } = require("@expo/config-plugins");

const SPLITS_BLOCK = `
    // ─ ABI splits (injected by plugins/withAbiSplits.js) ─────────────────
    splits {
        abi {
            enable true
            reset()
            include 'arm64-v8a', 'armeabi-v7a'
            universalApk true
        }
    }
`;

const MARKER = "splits {";
const ANCHOR = "androidResources {";

function injectSplits(buildGradle) {
  if (buildGradle.includes(MARKER)) {
    return buildGradle; // already injected — idempotent
  }
  const anchorIdx = buildGradle.indexOf(ANCHOR);
  if (anchorIdx === -1) {
    throw new Error(
      "withAbiSplits: could not find `androidResources {` block in " +
        "build.gradle — the anchor has moved; update the plugin.",
    );
  }
  // Find the closing brace of the androidResources { ... } block.
  // Walk from anchorIdx counting braces until balanced.
  let depth = 0;
  let i = buildGradle.indexOf("{", anchorIdx);
  if (i === -1) throw new Error("withAbiSplits: malformed androidResources block");
  for (; i < buildGradle.length; i++) {
    const c = buildGradle[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  if (i === buildGradle.length) {
    throw new Error("withAbiSplits: unbalanced braces in androidResources block");
  }
  const insertAt = i + 1;
  return (
    buildGradle.slice(0, insertAt) + "\n" + SPLITS_BLOCK + buildGradle.slice(insertAt)
  );
}

const withAbiSplits = (config) =>
  withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents = injectSplits(cfg.modResults.contents);
    return cfg;
  });

module.exports = withAbiSplits;
