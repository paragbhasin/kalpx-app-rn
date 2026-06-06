#!/usr/bin/env ruby
# setup_watch_widget_extension.rb
# Adds KalpxWatchWidgetExtension WidgetKit target to the Xcode project.
# Must be run AFTER setup_watch_target.rb (requires KalpxWatch target to exist).
# Run once from the monorepo root:
#   ruby scripts/setup_watch_widget_extension.rb

require 'xcodeproj'
require 'fileutils'

# ── Config ───────────────────────────────────────────────────────────────────
ROOT        = File.expand_path('..', __dir__)
IOS_DIR     = File.join(ROOT, 'apps/mobile/ios')
PROJ_PATH   = File.join(IOS_DIR, 'kalpx.xcodeproj')

WATCH_TARGET_NAME  = 'KalpxWatch'
WIDGET_TARGET_NAME = 'KalpxWatchWidgetExtension'
WIDGET_BUNDLE_ID   = 'com.kalpx.app.watchwidget'
WATCH_BUNDLE_ID    = 'com.kalpx.app.watchkitapp'
TEAM_ID            = '9G5NZ5LBRU'
WATCHOS_MIN        = '9.0'
APP_GROUP          = 'group.com.kalpx.app'
SWIFT_VERSION      = '5.0'

WIDGET_DIR = File.join(IOS_DIR, WIDGET_TARGET_NAME)
SHARED_DIR = File.join(IOS_DIR, 'Shared')

# ── Open project ─────────────────────────────────────────────────────────────
project = Xcodeproj::Project.open(PROJ_PATH)
puts "✓ Opened #{PROJ_PATH}"

# ── Find Watch target ─────────────────────────────────────────────────────────
watch_target = project.targets.find { |t| t.name == WATCH_TARGET_NAME }
abort "✗ Watch target '#{WATCH_TARGET_NAME}' not found — run setup_watch_target.rb first" unless watch_target
puts "✓ Found Watch target: #{watch_target.name}"

# ── Guard: skip if widget target already exists ───────────────────────────────
if project.targets.any? { |t| t.name == WIDGET_TARGET_NAME }
  puts "⚠  Widget target '#{WIDGET_TARGET_NAME}' already exists — skipping creation."
  exit 0
end

# ── Create widget extension target ───────────────────────────────────────────
# :watch2_extension is the correct type for watchOS extension targets.
# WidgetKit extensions are a subtype of watch extension.
widget_target = project.new_target(
  :watch2_extension,
  WIDGET_TARGET_NAME,
  :watchos,
  WATCHOS_MIN
)
puts "✓ Created widget target: #{WIDGET_TARGET_NAME}"

# ── Build settings ────────────────────────────────────────────────────────────
widget_target.build_configurations.each do |cfg|
  s = cfg.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER']     = WIDGET_BUNDLE_ID
  s['DEVELOPMENT_TEAM']              = TEAM_ID
  s['SWIFT_VERSION']                 = SWIFT_VERSION
  s['WATCHOS_DEPLOYMENT_TARGET']     = WATCHOS_MIN
  s['TARGETED_DEVICE_FAMILY']        = '4'
  s['CODE_SIGN_STYLE']               = 'Automatic'
  s['INFOPLIST_FILE']                = "#{WIDGET_TARGET_NAME}/Info.plist"
  s['CODE_SIGN_ENTITLEMENTS']        = "#{WIDGET_TARGET_NAME}/#{WIDGET_TARGET_NAME}.entitlements"
  s['PRODUCT_NAME']                  = '$(TARGET_NAME)'
  s['ENABLE_BITCODE']                = 'NO'
  s['SKIP_INSTALL']                  = 'YES'
  s['LD_RUNPATH_SEARCH_PATHS']       = ['$(inherited)', '@executable_path/Frameworks', '@executable_path/../../Frameworks']
  # WidgetKit extension type
  s['APPLICATION_EXTENSION_API_ONLY'] = 'YES'
  s['NSExtension']                    = {
    'NSExtensionPointIdentifier' => 'com.apple.widgetkit-extension'
  }
end
puts "✓ Build settings configured"

# ── Add WidgetKit framework ───────────────────────────────────────────────────
frameworks_group = project.frameworks_group
wk_ref = frameworks_group.find_file_by_path('WidgetKit.framework') ||
         frameworks_group.new_reference('System/Library/Frameworks/WidgetKit.framework')
wk_ref.last_known_file_type = 'wrapper.framework'
wk_ref.source_tree = 'SDKROOT'
widget_target.frameworks_build_phase.add_file_reference(wk_ref)

# Add WidgetKit to Watch app too (for WidgetCenter.shared.reloadAllTimelines())
watch_target.frameworks_build_phase.add_file_reference(wk_ref)
puts "✓ WidgetKit.framework added to #{WIDGET_TARGET_NAME} and #{WATCH_TARGET_NAME}"

# Add SwiftUI framework
swiftui_ref = frameworks_group.find_file_by_path('SwiftUI.framework') ||
              frameworks_group.new_reference('System/Library/Frameworks/SwiftUI.framework')
swiftui_ref.last_known_file_type = 'wrapper.framework'
swiftui_ref.source_tree = 'SDKROOT'
widget_target.frameworks_build_phase.add_file_reference(swiftui_ref)
puts "✓ SwiftUI.framework added to #{WIDGET_TARGET_NAME}"

# ── Create file group ─────────────────────────────────────────────────────────
main_group   = project.main_group
widget_group = main_group.find_subpath(WIDGET_TARGET_NAME, true) ||
               main_group.new_group(WIDGET_TARGET_NAME, WIDGET_TARGET_NAME)
shared_group = main_group.find_subpath('Shared', true) ||
               main_group.new_group('Shared', 'Shared')

# ── Add widget Swift source ───────────────────────────────────────────────────
source_path = File.join(WIDGET_DIR, 'KalpxWatchWidget.swift')
source_ref  = widget_group.find_file_by_path('KalpxWatchWidget.swift') ||
              widget_group.new_file(source_path)
unless widget_target.source_build_phase.files_references.include?(source_ref)
  widget_target.source_build_phase.add_file_reference(source_ref)
end
puts "✓ KalpxWatchWidget.swift → #{WIDGET_TARGET_NAME} target"

# ── Add shared KalpxAppGroupKeys to widget target ─────────────────────────────
shared_ref = shared_group.find_file_by_path('KalpxAppGroupKeys.swift') ||
             shared_group.new_file(File.join(SHARED_DIR, 'KalpxAppGroupKeys.swift'))
unless widget_target.source_build_phase.files_references.include?(shared_ref)
  widget_target.source_build_phase.add_file_reference(shared_ref)
end
puts "✓ KalpxAppGroupKeys.swift → #{WIDGET_TARGET_NAME} target"

# ── Embed widget extension inside Watch app ───────────────────────────────────
embed_phase = watch_target.build_phases.find { |p| p.display_name == 'Embed App Extensions' }
unless embed_phase
  embed_phase = project.new(Xcodeproj::Project::Object::PBXCopyFilesBuildPhase)
  embed_phase.name               = 'Embed App Extensions'
  embed_phase.dst_subfolder_spec = '13'  # 13 = PlugIns
  watch_target.build_phases << embed_phase
  puts "✓ Created 'Embed App Extensions' build phase in Watch target"
end

widget_product_ref = widget_target.product_reference
unless embed_phase.files_references.include?(widget_product_ref)
  embed_file = embed_phase.add_file_reference(widget_product_ref)
  embed_file.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
  puts "✓ Widget extension embedded in Watch app"
end

# ── Save ─────────────────────────────────────────────────────────────────────
project.save
puts "\n✅ Done. Widget extension target added to #{PROJ_PATH}"
puts "   Next: open kalpx.xcworkspace, select KalpxWatchWidgetExtension scheme, build."
