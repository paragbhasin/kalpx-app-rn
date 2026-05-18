# kalpx-app-rn — Monorepo Root

## Structure
- `apps/mobile/` — React Native app (Expo). RN is product master. All product behavior defined here.
- `apps/web/` — React web app (Vite + React). Mirrors mobile; never leads.
- `packages/` — Shared packages (core, contracts, types, api-client, auth, analytics, design-tokens, validation, state, feature-flows).

## Install dependencies
```bash
pnpm install   # from monorepo root
```

## Mobile development
```bash
cd apps/mobile && npx expo start
```

## Cross-Surface Parity Rule

`apps/mobile/src/blocks/room/roomStepCopy.ts` and `apps/web/src/lib/roomStepCopy.ts` must always be identical in copy values. Any change to one must be applied to the other in the same commit. The only allowed structural differences are import paths and type references (`ActionEnvelope` on mobile vs local `ActionLike` on web). `ROOM_COMPLETION_HEADER` and `ROOM_NEXT_STEP_LINE` live in `@kalpx/contracts` and sync automatically — no manual action needed for those.

## Maestro MCP

The Maestro MCP server is configured in `~/.claude.json`. At the start of every session:

1. Run `/mcp` and confirm `maestro` shows as **connected**.
2. If it shows disconnected or missing, exit and restart Claude Code — MCP servers only connect at startup.
3. Once connected, use `mcp__maestro__*` tools for ALL Maestro operations (run flow, screenshot, UI hierarchy). Do NOT fall back to `Bash(maestro test ...)` unless the MCP tools are unavailable.

The working dir for Maestro flows is `/Users/paragbhasin/kalpx-app-rn` (monorepo root).
Maestro YAML files live in `.maestro/` at the monorepo root.
