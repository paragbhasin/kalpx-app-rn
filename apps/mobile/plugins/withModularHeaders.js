const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withModularHeaders = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, "Podfile");
      let contents = fs.readFileSync(file, "utf8");

      if (!contents.includes("use_modular_headers!")) {
        // Add use_modular_headers! inside the main target block
        contents = contents.replace(
          /(target '.*' do)/,
          "$1\n  use_modular_headers!"
        );
      }

      // Xcode 26 / LLVM 17+ compatibility: {fmt} library uses consteval functions
      // that fail under Xcode 26's stricter C++20 enforcement in folly/hermes pods.
      // Disabling FMT_CONSTEVAL at pod level is the standard upstream workaround.
      if (!contents.includes("FMT_USE_CONSTEVAL")) {
        contents +=
          "\n" +
          "post_install do |installer|\n" +
          "  installer.pods_project.targets.each do |target|\n" +
          "    target.build_configurations.each do |config|\n" +
          "      flags = (config.build_settings['OTHER_CFLAGS'] || '$(inherited)').to_s\n" +
          "      unless flags.include?('-DFMT_USE_CONSTEVAL=0')\n" +
          "        config.build_settings['OTHER_CFLAGS'] = \"#{flags} -DFMT_USE_CONSTEVAL=0\".strip\n" +
          "      end\n" +
          "    end\n" +
          "  end\n" +
          "end\n";
      }

      fs.writeFileSync(file, contents);
      return config;
    },
  ]);
};

module.exports = withModularHeaders;
