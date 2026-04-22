# kalpx-app-rn — Session Bootstrap

## Maestro MCP

The Maestro MCP server is configured in `~/.claude.json`. At the start of every session:

1. Run `/mcp` and confirm `maestro` shows as **connected**.
2. If it shows disconnected or missing, exit and restart Claude Code — MCP servers only connect at startup.
3. Once connected, use `mcp__maestro__*` tools for ALL Maestro operations (run flow, screenshot, UI hierarchy). Do NOT fall back to `Bash(maestro test ...)` unless the MCP tools are unavailable.

The working dir for Maestro flows is `/Users/paragbhasin/kalpx-app-rn`.
