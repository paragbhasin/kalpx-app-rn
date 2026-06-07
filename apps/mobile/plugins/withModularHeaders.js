const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const FMT_FIX_LINES = [
  "  # Xcode 26 / LLVM 17+: {fmt} consteval fix for folly/hermes pods",
  "  if installer.pods_project",
  "    installer.pods_project.targets.each do |target|",
  "      target.build_configurations.each do |config|",
  "        existing = (config.build_settings['OTHER_CFLAGS'] || '$(inherited)').to_s",
  "        unless existing.include?('-DFMT_USE_CONSTEVAL=0')",
  "          config.build_settings['OTHER_CFLAGS'] = existing + ' -DFMT_USE_CONSTEVAL=0'",
  "        end",
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

      // Inject fmt consteval fix into the EXISTING post_install block so that
      // react_native_post_install (called inside it) is not skipped. CocoaPods
      // 1.x only runs the last post_install block — a second block would shadow
      // the Expo-generated one and break pod installation.
      if (!contents.includes("FMT_USE_CONSTEVAL")) {
        if (contents.includes("post_install do |installer|")) {
          contents = contents.replace(
            "post_install do |installer|",
            "post_install do |installer|\n" + FMT_FIX_LINES
          );
        } else {
          contents +=
            "\npost_install do |installer|\n" + FMT_FIX_LINES + "\nend\n";
        }
      }

      fs.writeFileSync(file, contents);
      return config;
    },
  ]);
};

module.exports = withModularHeaders;
