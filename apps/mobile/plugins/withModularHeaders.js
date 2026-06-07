const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// Xcode 26 / LLVM 17+: {fmt} uses consteval functions that Xcode 26's stricter
// C++20 enforcement rejects in folly/RCT-Folly pods compiled from source.
// GCC_PREPROCESSOR_DEFINITIONS is used (not OTHER_CFLAGS) so it survives
// react_native_post_install. Injected at END of the existing post_install block
// so it runs AFTER react_native_post_install, which may otherwise reset flags.
const FMT_FIX = [
  "  # Xcode 26 / LLVM 17+ fmt consteval fix — must run after react_native_post_install",
  "  installer.pods_project.targets.each do |target|",
  "    target.build_configurations.each do |config|",
  "      defs = config.build_settings['GCC_PREPROCESSOR_DEFINITIONS']",
  "      if defs.nil?",
  "        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = ['$(inherited)', 'FMT_USE_CONSTEVAL=0']",
  "      elsif defs.is_a?(Array)",
  "        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs + ['FMT_USE_CONSTEVAL=0'] unless defs.include?('FMT_USE_CONSTEVAL=0')",
  "      elsif !defs.to_s.include?('FMT_USE_CONSTEVAL=0')",
  "        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs.to_s + ' FMT_USE_CONSTEVAL=0'",
  "      end",
  "    end",
  "  end",
].join("\n");

const withModularHeaders = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, "Podfile");
      let contents = fs.readFileSync(file, "utf8");

      if (!contents.includes("use_modular_headers!")) {
        contents = contents.replace(
          /(target '.*' do)/,
          "$1\n  use_modular_headers!"
        );
      }

      // Inject at end of existing post_install block (before its closing `end`),
      // so react_native_post_install runs first and our fix applies last.
      if (!contents.includes("FMT_USE_CONSTEVAL")) {
        if (contents.includes("post_install do |installer|")) {
          // Replace the final `end` in the file (closes the post_install block)
          contents = contents.replace(/(\nend\s*)$/, "\n" + FMT_FIX + "\nend\n");
        } else {
          contents +=
            "\npost_install do |installer|\n" + FMT_FIX + "\nend\n";
        }
      }

      fs.writeFileSync(file, contents);
      return config;
    },
  ]);
};

module.exports = withModularHeaders;
