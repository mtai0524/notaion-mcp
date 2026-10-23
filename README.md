# Notaion MCP Server

Exposes your Notaion **Daily Notes** to Claude as MCP tools:
`list_daily_notes`, `search_daily_notes`, `create_daily_note`,
`append_to_daily_note`, `update_daily_note`, `delete_daily_note`.

## Requirements
- Node 20+
- A Notaion account (email + password)

## Install — Claude Code

No clone needed. One command, user scope, available in every project:

```bash
claude mcp add notaion --scope user -e NOTAION_EMAIL=you@example.com -e NOTAION_PASSWORD=yourpassword -- npx -y https://codeload.github.com/mtai0524/notaion-mcp/tar.gz/refs/heads/main
```

On Windows, wrap the command so npx resolves:

```bash
claude mcp add notaion --scope user -e NOTAION_EMAIL=you@example.com -e NOTAION_PASSWORD=yourpassword -- cmd /c npx -y https://codeload.github.com/mtai0524/notaion-mcp/tar.gz/refs/heads/main
```

In PowerShell the `--` needs single quotes: `'--' cmd /c npx -y <url>`.

Restart Claude Code, then try: "list my daily notes for today".

## Install — Claude Desktop

Add to `mcpServers` in `claude_desktop_config.json`
(`%APPDATA%\Claude\` on Windows, `~/Library/Application Support/Claude/` on macOS):

```json
{
  "mcpServers": {
    "notaion": {
      "command": "npx",
      "args": ["-y", "https://codeload.github.com/mtai0524/notaion-mcp/tar.gz/refs/heads/main"],
      "env": {
        "NOTAION_EMAIL": "you@example.com",
        "NOTAION_PASSWORD": "yourpassword"
      }
    }
  }
}
```

On Windows use `"command": "cmd"` with `"args": ["/c", "npx", "-y", "<url>"]`.
Restart Claude Desktop after the change.

## Configuration

| Variable | Required | Default |
|---|---|---|
| `NOTAION_EMAIL` | yes | — |
| `NOTAION_PASSWORD` | yes | — |
| `NOTAION_API_URL` | no | `https://notaion.runasp.net` |

You can log in with either your email or your username — the same value goes
in `NOTAION_EMAIL`.

Running from a clone, you can put these in `.env.local` next to `package.json`
instead (see `.env.local.example`). That file is gitignored. When installed via
npx the code lives in the npm cache, so pass the variables through the MCP
config as shown above.

## Install from source

```bash
git clone https://github.com/mtai0524/notaion-mcp.git
cd notaion-mcp && npm install && npm link
claude mcp add notaion --scope user -- notaion-mcp
```

To check the connection without Claude, print today's notes:

```bash
node smoke.js            # today
node smoke.js 2026-07-24 # a specific date
```

## Troubleshooting

- `node -v` must report 20 or newer.
- Run the npx command by hand to check it starts. A silent process that keeps
  running is normal — stop it with Ctrl+C.
- Slow network on first download: raise the timeout before starting Claude Code
  with `MCP_TIMEOUT=120000` (PowerShell: `$env:MCP_TIMEOUT=120000`).
- Check status with `claude mcp get notaion` or `/mcp`.

## Test

```bash
npm install
npm test
```
