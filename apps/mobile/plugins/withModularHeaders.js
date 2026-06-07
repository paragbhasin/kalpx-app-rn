const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// Xcode 26 / LLVM 17+: fmt 11.0.2 is a separate compiled pod. React Native new arch's
// set_clang_cxx_language_standard_if_needed forces C++20 on ALL pod targets via
// installer.target_installation_results.pod_target_installation_results — this enables
// consteval in fmt, which Xcode 26's stricter enforcement rejects.
// Fix: inject FMT_USE_CONSTEVAL=0 using the same API as RN itself, covering all pod targets
// including fmt (which lives in a secondary Xcode project, unreachable via installer.pods_project).
// Injected at BEGINNING of existing post_install block via string replace (not end-of-file regex)
// because in Expo SDK 53 the post_install block is nested INSIDE target 'kalpx' do.
const FMT_FIX = [
  "  # Xcode 26 / LLVM 17+: disable fmt consteval on all pod targets",
  "  installer.target_installation_results.pod_target_installation_results",
  "    .each do |pod_name, target_installation_result|",
  "    target_installation_result.native_target.build_configurations.each do |config|",
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

      if (!contents.includes("FMT_USE_CONSTEVAL")) {
        contents = contents.replace(
          "post_install do |installer|",
          "post_install do |installer|\n" + FMT_FIX
        );
      }

      fs.writeFileSync(file, contents);
      return config;
    },
  ]);
};

module.exports = withModularHeaders;
