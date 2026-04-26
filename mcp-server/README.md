# OTP - Organization Transport Protocol

Connect your AI agents to organizational intelligence. Browse, search, and publish Organizational Operating Systems across the OTP network.

## Quick Start

### For MCP-compatible platforms (Claude Code, Cursor, Windsurf, VS Code)

```bash
npx otp-mcp-server init
```

That's it. The installer detects your AI platform, asks for your API key, and writes the config. Your agent gets 17 OTP tools instantly.

### For any AI agent or human (CLI)

```bash
# Install globally -- required to use the `otp` command
npm install -g otp-mcp-server

# Then:
otp search "agent escalation failure"
otp browse --industry healthcare --pretty
```

> **Note:** The `otp` bin is only on PATH after a global install. `npx otp ...` will pull a different (unrelated) package from the npm registry. Use the global install or invoke as `npx -p otp-mcp-server -- otp <command>`.

Set your API key for publishing and discovery:

```bash
export OTP_API_KEY=otp_your_key_here
```

Get your API key at [orgtp.com/settings/api](https://orgtp.com/settings/api).

## MCP Tools

Once installed, your AI agent has these tools:

| Tool | Auth | Description |
|------|:---:|-------------|
| `browse_oos` | - | Browse published OOS files with filters |
| `search_claims` | - | Full-text search across all claims |
| `search_intelligence` | - | Deep faceted search with industry/section/confidence filters |
| `get_oos` | - | Get a specific OOS file by ID |
| `get_claims` | - | Get claims from a specific OOS file |
| `compare_oos` | - | Diff two OOS files side-by-side |
| `get_publishers` | - | Browse publishers with reputation data |
| `get_org` | - | Get an organization's public profile |
| `get_patterns` | - | Cross-org coordination patterns |
| `get_sections` | - | List all claim sections with counts |
| `publish_oos` | Key | Publish your OOS to the platform |
| `my_dashboard` | Key | Your publisher dashboard and stats |
| `discover_intelligence` | Key | Run the Scout for recommendations |
| `get_inbox` | Key | View your intelligence inbox |
| `get_inbox_stats` | Key | Inbox summary statistics |
| `review_recommendation` | Key | Act on recommendations (accept/reject/adapt) |
| `submit_ticket` | - | Report bugs or request features |

## CLI Commands

```
otp search <query>            Search across all published claims
otp browse                    Browse published OOS files
otp intelligence [query]      Deep faceted intelligence search
otp get <oos-id>              Get a specific OOS file
otp claims <oos-id>           Get claims from an OOS file
otp compare <id-a> <id-b>     Diff two OOS files
otp patterns                  Cross-org coordination patterns
otp publishers                Browse publishers
otp sections                  List claim sections
otp org <org-id>              Organization profile
otp publish <file.md>         Publish an OOS file (requires key)
otp discover                  Run the Scout (requires key)
otp inbox                     Intelligence inbox (requires key)
otp review <id> <action>      Review recommendation (requires key)
otp tickets                   List tickets
otp ticket:create "t" "d"     Create a ticket
```

Add `--pretty` for human-readable output. Default is JSON (agent-friendly).

## Manual MCP Setup

If you prefer manual configuration over `otp-mcp-server init`:

**Claude Code** (`~/.claude.json`):
```json
{
  "mcpServers": {
    "otp": {
      "command": "npx",
      "args": ["-y", "otp-mcp-server"],
      "env": {
        "OTP_BASE_URL": "https://orgtp.com",
        "OTP_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Cursor** (`~/.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "otp": {
      "command": "npx",
      "args": ["-y", "otp-mcp-server"],
      "env": {
        "OTP_BASE_URL": "https://orgtp.com",
        "OTP_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Examples

Ask your AI agent:

```
"Search OTP for how other organizations handle agent escalation failures"
"Show me all HIGH confidence failure patterns in digital marketing"
"Compare our OOS against that SaaS company's operating system"
"What coordination patterns are most common across organizations?"
"Publish our latest OOS to OTP"
"Run the Scout to discover intelligence from other orgs"
```

## API Key

The API key is only required for publishing, discovery, and dashboard access. All browse and search features work without authentication.

Get your key: [orgtp.com/settings/api](https://orgtp.com/settings/api)

## More Info

- Platform: [orgtp.com](https://orgtp.com)
- API keys start with `otp_` and are shown only once at creation
- Max 5 active keys per organization
