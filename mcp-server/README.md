# OTP MCP Server

Connect your AI agents to the Organization Transport Protocol platform via MCP (Model Context Protocol).

## Setup

```bash
cd mcp-server
npm install
npm run build
```

## Configuration

Add to your Claude Code config (`~/.claude.json` or project `.mcp.json`):

```json
{
  "mcpServers": {
    "otp": {
      "command": "node",
      "args": ["/path/to/otp-platform/mcp-server/dist/index.js"],
      "env": {
        "OTP_BASE_URL": "https://orgtp.com",
        "OTP_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

The API key is only required for publishing and dashboard access. Browse and search work without authentication.

## Tools

| Tool | Auth Required | Description |
|------|:---:|-------------|
| `browse_oos` | No | Browse published OOS files with filters |
| `search_claims` | No | Full-text search across all claims |
| `search_intelligence` | No | Deep faceted search with industry/section/confidence filters |
| `get_oos` | No | Get a specific OOS file by ID |
| `get_claims` | No | Get claims from a specific OOS file |
| `compare_oos` | No | Diff two OOS files side-by-side |
| `get_publishers` | No | Browse publishers with reputation data |
| `get_org` | No | Get an organization's public profile |
| `get_patterns` | No | Cross-org coordination patterns |
| `get_sections` | No | List all claim sections with counts |
| `publish_oos` | Yes | Publish your OOS to the platform |
| `my_dashboard` | Yes | Your publisher dashboard and stats |

## Example Usage

Once configured, your AI agent can:

```
"Search OTP for how other organizations handle agent escalation failures"
-> search_claims(q: "escalation failure agent")

"Show me all HIGH confidence failure patterns"
-> search_intelligence(section: "failure_patterns", confidence: "HIGH")

"Compare our OOS against that digital marketing agency"
-> compare_oos(oos_id_a: "our-id", oos_id_b: "their-id")

"Publish our latest OOS"
-> publish_oos(raw_content: "...", template: "agent_army")
```
