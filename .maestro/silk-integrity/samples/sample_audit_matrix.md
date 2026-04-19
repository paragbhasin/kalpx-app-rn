# Silk Integrity — Master Audit Matrix

_Generated 2026-04-19T04:43:12.475439+00:00 _

| flow | status | backend_content_source | endpoint | fe_files | component_surface | failed_layer | exact_gap | severity | root_cause | recommended_fix | sprint_classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| recognition | PASS | ContentPack: M07_turn7_recognition | POST /api/mitra/onboarding/complete/ | src/extensions/onboarding/RecognitionBlock.tsx | RecognitionBlock |  | notes: recognition line renders, deny-list clean | P2 |  |  | later |
| triad_reveal | FAIL | WisdomAsset + triad orchestrator | POST /api/mitra/journey/start/ | src/containers/companion/TriadRevealBlock.tsx | TriadRevealBlock | 1 | Master rows missing for persona test_day3: mantra, sankalp, practice \| notes: test+day3 persona missing Master rows | P0 | data | seed WisdomAsset/ContentPack rows for the persona OR gate the persona off Sprint 1 smoke | now |
| home_contextual | PASS | ContentPack: M08_dashboard_day_active | GET /api/mitra/journey/home/ | src/containers/companion_dashboard/*.tsx | CompanionDashboard |  | notes: dashboard day_active resolves | P2 |  |  | later |
| grief_room | PASS | ContentPack: M46_grief_room | POST /api/mitra/content/moments/M46_grief_room/resolve/ | src/containers/grief_room/index.tsx | GriefRoomContainer |  | notes: M46 ContentPack live | P2 |  |  | later |
| loneliness_room | PASS | ContentPack: M47_loneliness_room | POST /api/mitra/content/moments/M47_loneliness_room/resolve/ | src/containers/loneliness_room/index.tsx | LonelinessRoomContainer |  | notes: M47 ContentPack live | P2 |  |  | later |
| joy_room | PASS | ContentPack: M48_joy_room | POST /api/mitra/content/moments/M48_joy_room/resolve/ | src/containers/joy_room/JoyRoomContainer.tsx | JoyRoomContainer |  | notes: M48 ContentPack live on dev | P2 |  |  | later |
| growth_room | PASS | ContentPack: M49_growth_room + M49_inquiry_seeds | POST /api/mitra/content/moments/M49_growth_room/resolve/ | src/containers/growth_room/GrowthRoomContainer.tsx | GrowthRoomContainer |  | notes: M49 + inquiry_seeds live on dev | P2 |  |  | later |
| day7_checkpoint | PASS | ContentPack: M24_checkpoint_day_7 | GET /api/mitra/journey/checkpoint/day7/ | src/containers/checkpoint/CheckpointDay7Block.tsx | CheckpointDay7Block |  | notes: M24 via spine | P2 |  |  | later |
| day14_checkpoint | PASS | ContentPack: M25_checkpoint_day_14 + spine seed | GET /api/mitra/journey/checkpoint/day14/ | src/containers/checkpoint/CheckpointDay14Block.tsx | CheckpointDay14Block |  | notes: migration 0111 spine seed present | P2 |  |  | later |
| completion_core_mantra | FAIL | ContentPack: M_completion_return_core_mantra | POST /api/mitra/journey/completion_return/ | src/containers/completion/CompletionReturnTransient.tsx | CompletionReturnTransient | 6 | deny-list string rendered: 'How did that feel?' \| notes: legacy 'How did that feel?' still rendering | P1 | fallback_masking | remove hardcoded fallback; bind component to ContentPack slot | now |
| completion_support_matrix | PASS | ContentPack: M_completion_return (support × source) | POST /api/mitra/journey/completion_return/ | src/containers/completion/CompletionReturnTransient.tsx | CompletionReturnTransient |  | notes: visual-only variant per S1-08 | P2 |  |  | later |
