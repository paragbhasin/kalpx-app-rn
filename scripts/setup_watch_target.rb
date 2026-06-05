#!/usr/bin/env ruby
# setup_watch_target.rb
# Adds KalpxWatch app target + WatchConnectivity bridge to the Xcode project.
# Run once from the monorepo root:
#   ruby scripts/setup_watch_target.rb

require 'xcodeproj'
require 'fileutils'

# ── Config ───────────────────────────────────────────────────────────────────
ROOT        = File.expand_path('..', __dir__)
IOS_DIR     = File.join(ROOT, 'apps/mobile/ios')
PROJ_PATH   = File.join(IOS_DIR, 'kalpx.xcodeproj')

IPHONE_TARGET   = 'kalpx'
WATCH_APP_NAME  = 'KalpxWatch'
WATCH_BUNDLE_ID = 'com.kalpx.app.watchkitapp'
TEAM_ID         = '9G5NZ5LBRU'
WATCHOS_MIN     = '9.0'
APP_GROUP       = 'group.com.kalpx.app'
SWIFT_VERSION   = '5.0'

WATCH_DIR   = File.join(IOS_DIR, WATCH_APP_NAME)
SHARED_DIR  = File.join(IOS_DIR, 'Shared')

# ── Open project ─────────────────────────────────────────────────────────────
project = Xcodeproj::Project.open(PROJ_PATH)
puts "✓ Opened #{PROJ_PATH}"

# ── Find iPhone target ────────────────────────────────────────────────────────
iphone_target = project.targets.find { |t| t.name == IPHONE_TARGET }
abort "✗ iPhone target '#{IPHONE_TARGET}' not found" unless iphone_target
puts "✓ Found iPhone target: #{iphone_target.name}"

# ── Guard: skip if Watch target already exists ────────────────────────────────
if project.targets.any? { |t| t.name == WATCH_APP_NAME }
  puts "⚠  Watch target '#{WATCH_APP_NAME}' already exists — skipping creation."
  puts "   If you want to recreate it, remove it from Xcode first."
  exit 0
end

# ── Create Watch App target ───────────────────────────────────────────────────
watch_target = project.new_target(
  :watch2_app,
  WATCH_APP_NAME,
  :watchos,
  WATCHOS_MIN
)
puts "✓ Created Watch target: #{WATCH_APP_NAME}"

# ── Build settings — Watch App ────────────────────────────────────────────────
watch_target.build_configurations.each do |cfg|
  s = cfg.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER']     = WATCH_BUNDLE_ID
  s['DEVELOPMENT_TEAM']              = TEAM_ID
  s['SWIFT_VERSION']                 = SWIFT_VERSION
  s['WATCHOS_DEPLOYMENT_TARGET']     = WATCHOS_MIN
  s['TARGETED_DEVICE_FAMILY']        = '4'
  s['CODE_SIGN_STYLE']               = 'Automatic'
  s['ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES'] = 'YES'
  s['LD_RUNPATH_SEARCH_PATHS']       = ['$(inherited)', '@executable_path/Frameworks']
  s['INFOPLIST_FILE']                = "#{WATCH_APP_NAME}/Info.plist"
  s['CODE_SIGN_ENTITLEMENTS']        = "#{WATCH_APP_NAME}/#{WATCH_APP_NAME}.entitlements"
  s['ASSETCATALOG_COMPILER_APPICON_NAME'] = 'AppIcon'
  s['ENABLE_BITCODE']                = 'NO'
end
puts "✓ Build settings configured"

# ── Add WatchConnectivity framework to iPhone target ─────────────────────────
wc_framework = project.frameworks_group.new_file('System/Library/Frameworks/WatchConnectivity.framework')
wc_framework.last_known_file_type = 'wrapper.framework'
wc_framework.source_tree          = 'SDKROOT'

iphone_target.frameworks_build_phase.add_file_reference(wc_framework)
puts "✓ WatchConnectivity.framework added to iPhone target"

# ── Create file groups ────────────────────────────────────────────────────────
main_group   = project.main_group
shared_group = main_group.find_subpath('Shared', true) || main_group.new_group('Shared', 'Shared')
watch_group  = main_group.find_subpath(WATCH_APP_NAME, true) || main_group.new_group(WATCH_APP_NAME, WATCH_APP_NAME)

# Sub-groups for Watch app
%w[Views Engine Connectivity Models Storage].each do |sub|
  watch_group.find_subpath(sub, true) || watch_group.new_group(sub, sub)
end

# ── Helper: add a source file to a group and target ──────────────────────────
def add_source(project, group_path, filename, target, base_dir)
  dir_parts  = group_path.split('/')
  group      = dir_parts.reduce(project.main_group) { |g, p| g.find_subpath(p, true) || g.new_group(p, p) }
  disk_path  = File.join(base_dir, *dir_parts, filename)
  ref        = group.find_file_by_path(filename) || group.new_file(disk_path)
  unless target.source_build_phase.files_references.include?(ref)
    target.source_build_phase.add_file_reference(ref)
  end
  ref
end

# ── Add iPhone-side new files to kalpx target ────────────────────────────────
iphone_new = [
  ['kalpx', 'WatchConnectivityManager.swift'],
  ['kalpx', 'KalpxWatchConnectivityModule.swift'],
  ['kalpx', 'KalpxWatchConnectivityModule.m'],
]
iphone_new.each do |(group_name, filename)|
  add_source(project, group_name, filename, iphone_target, IOS_DIR)
  puts "✓ Added #{filename} → kalpx target"
end

# ── Add shared file to iPhone target ─────────────────────────────────────────
shared_ref = shared_group.find_file_by_path('KalpxAppGroupKeys.swift') ||
             shared_group.new_file(File.join(SHARED_DIR, 'KalpxAppGroupKeys.swift'))
unless iphone_target.source_build_phase.files_references.include?(shared_ref)
  iphone_target.source_build_phase.add_file_reference(shared_ref)
end
puts "✓ KalpxAppGroupKeys.swift → kalpx target"

# ── Add Watch app source files to Watch target ────────────────────────────────
watch_sources = [
  ["#{WATCH_APP_NAME}",                    'KalpxWatchApp.swift'],
  ["#{WATCH_APP_NAME}/Views",              'RootView.swift'],
  ["#{WATCH_APP_NAME}/Views",              'QuickChantView.swift'],
  ["#{WATCH_APP_NAME}/Views",              'MantraPickerView.swift'],
  ["#{WATCH_APP_NAME}/Views",              'GoalPickerView.swift'],
  ["#{WATCH_APP_NAME}/Views",              'CompletionView.swift'],
  ["#{WATCH_APP_NAME}/Views",              'BeadRingView.swift'],
  ["#{WATCH_APP_NAME}/Engine",             'WatchJapaEngine.swift'],
  ["#{WATCH_APP_NAME}/Connectivity",       'WatchConnectivityManager.swift'],
  ["#{WATCH_APP_NAME}/Models",             'WatchLocalSession.swift'],
  ["#{WATCH_APP_NAME}/Models",             'CuratedMantra.swift'],
  ["#{WATCH_APP_NAME}/Storage",            'WatchAppGroupStorage.swift'],
]
watch_sources.each do |(group_path, filename)|
  add_source(project, group_path, filename, watch_target, IOS_DIR)
  puts "✓ Added #{filename} → #{WATCH_APP_NAME} target"
end

# Add shared KalpxAppGroupKeys to Watch target too
unless watch_target.source_build_phase.files_references.include?(shared_ref)
  watch_target.source_build_phase.add_file_reference(shared_ref)
end
puts "✓ KalpxAppGroupKeys.swift → #{WATCH_APP_NAME} target"

# ── Create Info.plist ─────────────────────────────────────────────────────────
info_plist_path = File.join(WATCH_DIR, 'Info.plist')
unless File.exist?(info_plist_path)
  File.write(info_plist_path, <<~XML)
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
        <key>CFBundleDevelopmentRegion</key>
        <string>$(DEVELOPMENT_LANGUAGE)</string>
        <key>CFBundleDisplayName</key>
        <string>KalpX</string>
        <key>CFBundleExecutable</key>
        <string>$(EXECUTABLE_NAME)</string>
        <key>CFBundleIdentifier</key>
        <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
        <key>CFBundleInfoDictionaryVersion</key>
        <string>6.0</string>
        <key>CFBundleName</key>
        <string>$(PRODUCT_NAME)</string>
        <key>CFBundlePackageType</key>
        <string>APPL</string>
        <key>CFBundleShortVersionString</key>
        <string>1.0</string>
        <key>CFBundleVersion</key>
        <string>1</string>
        <key>UISupportedInterfaceOrientations</key>
        <array>
            <string>UIInterfaceOrientationPortrait</string>
        </array>
        <key>WKCompanionAppBundleIdentifier</key>
        <string>com.kalpx.app</string>
        <key>WKWatchOnly</key>
        <false/>
    </dict>
    </plist>
  XML
  puts "✓ Created Info.plist"
end

# ── Create entitlements ───────────────────────────────────────────────────────
ent_path = File.join(WATCH_DIR, "#{WATCH_APP_NAME}.entitlements")
unless File.exist?(ent_path)
  File.write(ent_path, <<~XML)
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
        <key>com.apple.security.application-groups</key>
        <array>
            <string>#{APP_GROUP}</string>
        </array>
    </dict>
    </plist>
  XML
  puts "✓ Created #{WATCH_APP_NAME}.entitlements"
end

# ── Create PrivacyInfo.xcprivacy ──────────────────────────────────────────────
privacy_path = File.join(WATCH_DIR, 'PrivacyInfo.xcprivacy')
unless File.exist?(privacy_path)
  File.write(privacy_path, <<~XML)
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
        <key>NSPrivacyTracking</key>
        <false/>
        <key>NSPrivacyTrackingDomains</key>
        <array/>
        <key>NSPrivacyCollectedDataTypes</key>
        <array/>
        <key>NSPrivacyAccessedAPITypes</key>
        <array>
            <dict>
                <key>NSPrivacyAccessedAPIType</key>
                <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
                <key>NSPrivacyAccessedAPITypeReasons</key>
                <array>
                    <string>CA92.1</string>
                </array>
            </dict>
        </array>
    </dict>
    </plist>
  XML
  puts "✓ Created PrivacyInfo.xcprivacy"
end

# ── Embed Watch app inside iPhone app ────────────────────────────────────────
embed_phase = iphone_target.build_phases.find { |p| p.display_name == 'Embed Watch Content' }
unless embed_phase
  embed_phase = project.new(Xcodeproj::Project::Object::PBXCopyFilesBuildPhase)
  embed_phase.name            = 'Embed Watch Content'
  embed_phase.dst_subfolder_spec = '16'   # 16 = Watch app content
  iphone_target.build_phases << embed_phase
  puts "✓ Created 'Embed Watch Content' build phase"
end

watch_product_ref = watch_target.product_reference
unless embed_phase.files_references.include?(watch_product_ref)
  embed_file = embed_phase.add_file_reference(watch_product_ref)
  embed_file.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
  puts "✓ Watch app embedded in iPhone target"
end

# ── Save ─────────────────────────────────────────────────────────────────────
project.save
puts "\n✅ Done. Watch target added to #{PROJ_PATH}"
puts "   Next: open kalpx.xcworkspace, select KalpxWatch scheme, build."
