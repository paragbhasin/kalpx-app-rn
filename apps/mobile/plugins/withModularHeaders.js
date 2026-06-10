const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// Xcode 26 / Apple Clang 17+: fmt 11.0.2's base.h unconditionally defines
// FMT_USE_CONSTEVAL=1 when __cpp_consteval is present (C++20). React Native
// new arch forces C++20 on all pods, so every pod that includes <fmt/base.h>
// gets consteval-enabled basic_format_string — which Apple Clang rejects.
// Setting GCC_PREPROCESSOR_DEFINITIONS doesn't work because the header
// redefines the macro after our command-line flag.
// Fix: after pod install, patch base.h to insert
//   #undef FMT_USE_CONSTEVAL / #define FMT_USE_CONSTEVAL 0
// before the first #if FMT_USE_CONSTEVAL usage, so ALL consumers of the
// header see FMT_USE_CONSTEVAL=0 regardless of xcconfig.
const FMT_HEADER_PATCH = `
  # Xcode 26 / Apple Clang 17+: force FMT_USE_CONSTEVAL=0 in fmt base.h.
  # base.h has no #ifndef guard — it unconditionally redefines the macro, so
  # xcconfig preprocessor flags are overridden. Patching the header directly
  # is the only reliable fix. Idempotent: checks for '#undef FMT_USE_CONSTEVAL'.
  fmt_base_h = File.join(installer.sandbox.root, 'fmt/include/fmt/base.h')
  if File.exist?(fmt_base_h)
    content = File.read(fmt_base_h)
    unless content.include?('#undef FMT_USE_CONSTEVAL')
      patched = content.sub(
        '#if FMT_USE_CONSTEVAL',
        "#undef FMT_USE_CONSTEVAL\\n#define FMT_USE_CONSTEVAL 0\\n#if FMT_USE_CONSTEVAL"
      )
      File.write(fmt_base_h, patched)
    end
  end

  # Xcode 26+: 'Create Symlinks to Header Folders' script phases have no input/output
  # files, causing Xcode to treat them as ambiguous dependencies (error in Xcode 16+).
  # Fix: mark alwaysOutOfDate = 1 so Xcode skips dependency analysis for these phases.
  installer.pods_project.targets.each do |target|
    target.build_phases.each do |phase|
      next unless phase.is_a?(Xcodeproj::Project::Object::PBXShellScriptBuildPhase)
      next unless phase.name == 'Create Symlinks to Header Folders'
      phase.always_out_of_date = '1'
    end
  end
  installer.pods_project.save
`;

const withModularHeaders = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, "Podfile");
      if (!fs.existsSync(file)) return config;
      let contents = fs.readFileSync(file, "utf8");

      if (!contents.includes("use_modular_headers!")) {
        contents = contents.replace(
          /(target '.*' do)/,
          "$1\n  use_modular_headers!"
        );
      }

      // Inject fmt header patch at BEGINNING of existing post_install block.
      // post_install is nested inside target 'kalpx' do in SDK 53, so end-regex
      // would match the wrong end — inject at start instead.
      if (!contents.includes("FMT_USE_CONSTEVAL")) {
        contents = contents.replace(
          "post_install do |installer|",
          "post_install do |installer|\n" + FMT_HEADER_PATCH
        );
      }

      fs.writeFileSync(file, contents);
      return config;
    },
  ]);
};

module.exports = withModularHeaders;
