#!/usr/bin/env bash
# ============================================================
# OTP Installer for Claude Code
# One command: curl -fsSL https://orgtp.com/install.sh | bash
# ============================================================
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}  ╔═══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}  ║     OTP - Organization Transport Protocol     ║${NC}"
echo -e "${CYAN}${BOLD}  ║         Claude Code Installer v1.0            ║${NC}"
echo -e "${CYAN}${BOLD}  ╚═══════════════════════════════════════════════╝${NC}"
echo ""

# -- Prerequisites --

check_command() {
  if ! command -v "$1" &>/dev/null; then
    echo -e "${RED}Missing: $1 is required but not installed.${NC}"
    echo -e "  Install it: $2"
    exit 1
  fi
}

echo -e "${BOLD}Checking prerequisites...${NC}"
check_command "node" "https://nodejs.org"
check_command "npx" "comes with Node.js (https://nodejs.org)"
check_command "claude" "npm install -g @anthropic-ai/claude-code"

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}Node.js 18+ required. You have $(node -v).${NC}"
  exit 1
fi

echo -e "${GREEN}  Node.js $(node -v)${NC}"
echo -e "${GREEN}  Claude Code $(claude --version 2>/dev/null || echo 'installed')${NC}"
echo ""

# -- API Key --

OTP_BASE_URL="https://orgtp.com"

if [ -z "${OTP_API_KEY:-}" ]; then
  echo -e "${BOLD}You need an OTP API key to publish and receive intelligence.${NC}"
  echo -e "  Get one free at: ${CYAN}https://orgtp.com/settings/api${NC}"
  echo ""
  echo -e "  ${YELLOW}No key? You can still browse and search. Enter nothing to skip.${NC}"
  echo ""
  read -rp "  OTP API Key: " OTP_API_KEY
  echo ""
fi

# -- Install MCP Server --

echo -e "${BOLD}Step 1/3: Installing OTP MCP server...${NC}"

# Remove existing if present
claude mcp remove otp 2>/dev/null || true

if [ -n "$OTP_API_KEY" ]; then
  claude mcp add \
    -e OTP_API_KEY="$OTP_API_KEY" \
    -e OTP_BASE_URL="$OTP_BASE_URL" \
    --scope user \
    otp -- npx -y otp-mcp-server@latest
else
  claude mcp add \
    -e OTP_BASE_URL="$OTP_BASE_URL" \
    --scope user \
    otp -- npx -y otp-mcp-server@latest
fi

echo -e "${GREEN}  MCP server installed.${NC}"
echo ""

# -- Create Slash Commands --

echo -e "${BOLD}Step 2/3: Installing OTP commands...${NC}"

COMMANDS_DIR="$HOME/.claude/commands"
mkdir -p "$COMMANDS_DIR"

# /otp - Main hub
cat > "$COMMANDS_DIR/otp.md" << 'CMDEOF'
---
name: otp
description: OTP dashboard - your organization's intelligence hub
allowed-tools: mcp__otp__my_dashboard, mcp__otp__get_inbox_stats, mcp__otp__get_inbox, mcp__otp__browse_oos
---

You are connected to the OTP (Organization Transport Protocol) network. Show the user their current status.

Do these steps:

1. **Dashboard**: Call `get_inbox_stats` to see pending recommendations.
2. **Inbox summary**: If there are pending recommendations, call `get_inbox` with status "pending" and limit 5. Show a brief summary of each.
3. **Network**: Call `browse_oos` with limit 5 and sort "newest" to show recent publications.

Format the output as:

## OTP Dashboard

**Your Intelligence Inbox:** X pending recommendations
(list top 5 briefly - one line each with the claim rule and source org)

**Recent on the Network:** X published OOS files
(list top 5 - org name, industry, claim count)

**Quick commands:**
- `/otp-publish` - Publish or update your OOS
- `/otp-morning` - Morning intelligence briefing
- `/otp-browse` - Browse the network
- `/otp-learn` - Discover new intelligence
CMDEOF

# /otp-publish - Publish CLAUDE.md as OOS
cat > "$COMMANDS_DIR/otp-publish.md" << 'CMDEOF'
---
name: otp-publish
description: Publish your CLAUDE.md as an Organizational Operating System to OTP
allowed-tools: mcp__otp__publish_oos, Read, Glob
---

You are the OTP publisher. Help the user publish their organization's operating system to the OTP network.

Do these steps:

1. **Find the OOS file**: Look for CLAUDE.md in the current working directory, then `./CLAUDE.md`, then `~/.claude/CLAUDE.md`. Also check for any file named `*.oos.md`. Use Glob to search if needed.

2. **Read it**: Read the file content.

3. **Detect template type**: Analyze the content:
   - If it describes AI agents with roles, tools, and authority boundaries -> "agent_army"
   - If it describes a value chain or workflow pipeline -> "value_chain"
   - If it describes an org chart or team structure -> "org_chart"
   - Default to "agent_army" if unclear. Ask the user if ambiguous.

4. **Publish**: Call `publish_oos` with the full file content and detected template type.

5. **Report results**: Show:
   - Quality tier and score
   - Number of claims extracted
   - Similarities found with other orgs
   - The URL where it's published

If no CLAUDE.md or OOS file is found, tell the user:
"No CLAUDE.md found in this directory. OTP publishes your CLAUDE.md -- the file that defines how your AI agents operate. Create one first, or run this from a directory that has one."

If no API key is configured, tell the user:
"You need an API key to publish. Get one free at https://orgtp.com/settings/api, then re-run the installer: curl -fsSL https://orgtp.com/install.sh | bash"
CMDEOF

# /otp-morning - Morning intelligence briefing
cat > "$COMMANDS_DIR/otp-morning.md" << 'CMDEOF'
---
name: otp-morning
description: Morning intelligence briefing - what's new on the OTP network that's relevant to you
allowed-tools: mcp__otp__discover_intelligence, mcp__otp__get_inbox, mcp__otp__get_inbox_stats, mcp__otp__get_patterns, mcp__otp__browse_oos, mcp__otp__review_recommendation
---

You are the OTP Morning Intelligence Briefer. Give the user a concise morning briefing of what's new and relevant on the OTP network.

Do these steps IN PARALLEL where possible:

1. Call `get_inbox_stats` to get inbox summary
2. Call `get_inbox` with status "pending" and limit 10 to get pending recommendations
3. Call `browse_oos` with sort "newest" and limit 5 to see what's new
4. Call `get_patterns` to see cross-org patterns

Then compile into this format:

## OTP Morning Brief

### Intelligence Inbox
X pending recommendations to review.

(For each pending recommendation, show:)
- **[section]** "The rule text" - from [org name]
  Relevance: X% | Why: one-line explanation

### What's New on the Network
(List new OOS publications from the last few days)

### Cross-Org Patterns
(List the most interesting patterns - things multiple orgs are doing that the user isn't)

### Recommended Actions
1. (Top recommendation to accept/review, with reasoning)
2. (Second recommendation)
3. (Third recommendation)

If there are strong recommendations (relevance > 80%), ask the user:
"Want me to accept any of these? Say 'accept 1' or 'accept all' to adopt them into your OOS."

Keep it brief. This should take 30 seconds to read.
CMDEOF

# /otp-browse - Browse the network
cat > "$COMMANDS_DIR/otp-browse.md" << 'CMDEOF'
---
name: otp-browse
description: Browse published OOS files on the OTP network
allowed-tools: mcp__otp__browse_oos, mcp__otp__get_oos, mcp__otp__get_claims, mcp__otp__compare_oos, mcp__otp__search_claims, mcp__otp__get_publishers
---

You are the OTP Network Browser. Help the user explore what other organizations have published.

If the user provided arguments (like an industry or search term), use those to filter.

Otherwise, show a menu:

## OTP Network

**Browse by:**
1. **Newest** - Latest published OOS files
2. **Industry** - Filter by industry (digital_marketing, saas, healthcare, etc.)
3. **Quality** - Highest quality publications first
4. **Search** - Search for specific patterns or rules

What would you like to explore?

When showing results, format each OOS as:
- **[Org Name]** ([industry], [size]) - [claim_count] claims, [quality_tier] tier
  Template: [template_type] | Published: [date]

If the user wants to dive into a specific OOS, call `get_claims` and show the most interesting claims grouped by section. Offer to compare it against their own OOS.
CMDEOF

# /otp-learn - Discover intelligence
cat > "$COMMANDS_DIR/otp-learn.md" << 'CMDEOF'
---
name: otp-learn
description: Discover new intelligence from other organizations and review recommendations
allowed-tools: mcp__otp__discover_intelligence, mcp__otp__get_inbox, mcp__otp__get_inbox_stats, mcp__otp__review_recommendation, mcp__otp__search_intelligence, mcp__otp__get_patterns, mcp__otp__compare_oos
---

You are the OTP Intelligence Scout. Help the user discover and adopt coordination intelligence from other organizations.

Do these steps:

1. **Discover**: Call `discover_intelligence` with limit 20 to find new recommendations.

2. **Report what was found**: Show the count of new recommendations discovered.

3. **Show the inbox**: Call `get_inbox` with status "pending" and limit 10.

4. **Present for review**: For each recommendation, show:

---
**[number]. [Section]** | Relevance: [X]% | From: [org name]

> "[The rule]"

**Why:** [The reasoning/why text]

**Their evidence:** [evidence type] at [confidence] confidence

**How this helps you:** [One line on why this is relevant to the user's setup]

Accept / Reject / Adapt?

---

Wait for the user's decision on each one. When they say:
- **"accept"** or **"accept N"**: Call `review_recommendation` with action "accept"
- **"reject"** or **"reject N"**: Call `review_recommendation` with action "reject"
- **"adapt"** or **"adapt N"**: Ask what they'd change, then call with action "adapt" and their modifications
- **"accept all"**: Accept all pending with a note "batch accepted"
- **"skip"**: Move to the next one

After reviewing, show a summary: X accepted, X rejected, X adapted, X skipped.
CMDEOF

echo -e "${GREEN}  5 commands installed:${NC}"
echo -e "    /otp          - Dashboard and status"
echo -e "    /otp-publish  - Publish your CLAUDE.md to OTP"
echo -e "    /otp-morning  - Morning intelligence briefing"
echo -e "    /otp-browse   - Browse the network"
echo -e "    /otp-learn    - Discover and review intelligence"
echo ""

# -- Initial Publish Prompt --

echo -e "${BOLD}Step 3/3: Ready to publish?${NC}"
echo ""

if [ -n "$OTP_API_KEY" ]; then
  # Look for CLAUDE.md
  CLAUDE_MD=""
  if [ -f "./CLAUDE.md" ]; then
    CLAUDE_MD="./CLAUDE.md"
  elif [ -f "$HOME/CLAUDE.md" ]; then
    CLAUDE_MD="$HOME/CLAUDE.md"
  fi

  if [ -n "$CLAUDE_MD" ]; then
    LINES=$(wc -l < "$CLAUDE_MD")
    echo -e "  Found ${CYAN}$CLAUDE_MD${NC} ($LINES lines)"
    echo ""
    echo -e "  To publish it now, open Claude Code and type: ${CYAN}/otp-publish${NC}"
  else
    echo -e "  ${YELLOW}No CLAUDE.md found in current directory.${NC}"
    echo -e "  Navigate to your project and type: ${CYAN}/otp-publish${NC}"
  fi
else
  echo -e "  ${YELLOW}No API key provided - you can browse but not publish.${NC}"
  echo -e "  Get a key at: ${CYAN}https://orgtp.com/settings/api${NC}"
  echo -e "  Then re-run: ${CYAN}curl -fsSL https://orgtp.com/install.sh | bash${NC}"
fi

echo ""
echo -e "${CYAN}${BOLD}  ╔═══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}  ║              Installation Complete!            ║${NC}"
echo -e "${CYAN}${BOLD}  ╠═══════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}${BOLD}  ║                                               ║${NC}"
echo -e "${CYAN}${BOLD}  ║  Open Claude Code and try:                    ║${NC}"
echo -e "${CYAN}${BOLD}  ║                                               ║${NC}"
echo -e "${CYAN}${BOLD}  ║    /otp-publish   Publish your OOS            ║${NC}"
echo -e "${CYAN}${BOLD}  ║    /otp-morning   Morning intelligence        ║${NC}"
echo -e "${CYAN}${BOLD}  ║    /otp-browse    Explore the network         ║${NC}"
echo -e "${CYAN}${BOLD}  ║    /otp-learn     Discover recommendations    ║${NC}"
echo -e "${CYAN}${BOLD}  ║    /otp           Your dashboard              ║${NC}"
echo -e "${CYAN}${BOLD}  ║                                               ║${NC}"
echo -e "${CYAN}${BOLD}  ╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Docs: ${CYAN}https://orgtp.com/docs${NC}"
echo -e "  Help: ${CYAN}https://orgtp.com/help${NC}"
echo ""
