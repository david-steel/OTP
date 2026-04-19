#!/usr/bin/env node

/**
 * otp-mcp-server init
 * Interactive setup that detects the user's AI platform,
 * accepts an API key, writes the MCP config, and verifies the connection.
 */

import { createInterface } from "readline";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const OTP_BASE_URL = "https://orgtp.com";

// -- Platform detection --

interface Platform {
  name: string;
  configPath: string;
  configKey: string; // top-level key in the JSON config
}

function detectPlatforms(): Platform[] {
  const home = homedir();
  const found: Platform[] = [];

  const candidates: Platform[] = [
    {
      name: "Claude Code",
      configPath: join(home, ".claude.json"),
      configKey: "mcpServers",
    },
    {
      name: "Claude Code (project)",
      configPath: join(process.cwd(), ".mcp.json"),
      configKey: "mcpServers",
    },
    {
      name: "Cursor",
      configPath: join(home, ".cursor", "mcp.json"),
      configKey: "mcpServers",
    },
    {
      name: "Windsurf",
      configPath: join(home, ".codeium", "windsurf", "mcp_config.json"),
      configKey: "mcpServers",
    },
    {
      name: "VS Code (Copilot)",
      configPath: join(home, ".vscode", "mcp.json"),
      configKey: "servers",
    },
  ];

  // Detect which platforms exist on this machine
  for (const c of candidates) {
    const dir = c.configPath.replace(/\/[^/]+$/, "");
    // If the parent directory exists or the config file exists, it's a candidate
    if (existsSync(c.configPath) || existsSync(dir)) {
      found.push(c);
    }
  }

  // Always offer Claude Code as an option even if ~/.claude.json doesn't exist yet
  if (!found.some((p) => p.name === "Claude Code")) {
    found.unshift(candidates[0]);
  }

  return found;
}

// -- Readline helpers --

function createRL(): ReturnType<typeof createInterface> {
  return createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl: ReturnType<typeof createInterface>, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

// -- Config writing --

function writeConfig(platform: Platform, apiKey: string): void {
  let config: Record<string, any> = {};

  if (existsSync(platform.configPath)) {
    try {
      config = JSON.parse(readFileSync(platform.configPath, "utf-8"));
    } catch {
      // Start fresh if the file is malformed
    }
  } else {
    // Ensure parent directory exists
    const dir = platform.configPath.replace(/\/[^/]+$/, "");
    mkdirSync(dir, { recursive: true });
  }

  if (!config[platform.configKey]) {
    config[platform.configKey] = {};
  }

  config[platform.configKey].otp = {
    command: "npx",
    args: ["-y", "otp-mcp-server"],
    env: {
      OTP_BASE_URL,
      ...(apiKey ? { OTP_API_KEY: apiKey } : {}),
    },
  };

  writeFileSync(platform.configPath, JSON.stringify(config, null, 2) + "\n");
}

// -- Connection verification --

async function verifyConnection(apiKey: string): Promise<{ ok: boolean; org?: string; error?: string }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    // Test browse (no auth required)
    const browseRes = await fetch(`${OTP_BASE_URL}/api/v1/browse?limit=1`);
    if (!browseRes.ok) {
      return { ok: false, error: `API unreachable (HTTP ${browseRes.status})` };
    }

    // If they provided a key, test authenticated endpoint
    if (apiKey) {
      const authRes = await fetch(`${OTP_BASE_URL}/api/v1/auth/me`, { headers });
      if (!authRes.ok) {
        return { ok: false, error: "API key invalid or expired. Check orgtp.com/settings/api" };
      }
      const data = await authRes.json() as any;
      return { ok: true, org: data.org?.name };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Connection failed" };
  }
}

// -- Main --

async function main() {
  const args = process.argv.slice(2);

  // If not called with "init", show help
  if (args[0] !== "init" && args.length > 0) {
    console.log("Usage: otp-mcp-server init");
    console.log("       otp-mcp-server        (start MCP server on stdio)");
    process.exit(0);
  }

  if (args[0] !== "init") {
    // Fall through to MCP server -- this file only handles init
    console.error("Use 'otp-mcp-server init' to set up, or run without args to start the MCP server.");
    process.exit(1);
  }

  console.log("");
  console.log("  OTP - Organization Transport Protocol");
  console.log("  Connect your AI agents to organizational intelligence");
  console.log("");

  const rl = createRL();

  try {
    // Step 1: Detect platforms
    const platforms = detectPlatforms();

    let platform: Platform;
    if (platforms.length === 1) {
      console.log(`  Detected: ${platforms[0].name}`);
      const confirm = await ask(rl, `  Install OTP for ${platforms[0].name}? (Y/n) `);
      if (confirm.toLowerCase() === "n") {
        console.log("  Aborted.");
        process.exit(0);
      }
      platform = platforms[0];
    } else {
      console.log("  Detected AI platforms:");
      platforms.forEach((p, i) => console.log(`    ${i + 1}. ${p.name}`));
      console.log("");
      const choice = await ask(rl, `  Which platform? (1-${platforms.length}) `);
      const idx = parseInt(choice, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= platforms.length) {
        console.log("  Invalid choice. Aborted.");
        process.exit(1);
      }
      platform = platforms[idx];
    }

    // Step 2: API key
    console.log("");
    console.log("  An API key lets your agent publish, discover intelligence, and access your dashboard.");
    console.log("  Without one, your agent can still browse and search all public OOS files.");
    console.log("");
    console.log(`  Get your API key at: ${OTP_BASE_URL}/settings/api`);
    console.log("");
    const apiKey = await ask(rl, "  Paste your OTP API key (or press Enter to skip): ");
    const trimmedKey = apiKey.trim();

    if (trimmedKey && !trimmedKey.startsWith("otp_")) {
      console.log("");
      console.log("  Warning: OTP API keys start with 'otp_'. This doesn't look right.");
      const proceed = await ask(rl, "  Continue anyway? (y/N) ");
      if (proceed.toLowerCase() !== "y") {
        console.log("  Aborted.");
        process.exit(0);
      }
    }

    // Step 3: Verify connection
    console.log("");
    process.stdout.write("  Verifying connection...");
    const result = await verifyConnection(trimmedKey);

    if (!result.ok) {
      console.log(" FAILED");
      console.log(`  Error: ${result.error}`);
      console.log("");
      const proceed = await ask(rl, "  Write config anyway? (y/N) ");
      if (proceed.toLowerCase() !== "y") {
        console.log("  Aborted.");
        process.exit(1);
      }
    } else {
      console.log(" OK");
      if (result.org) {
        console.log(`  Organization: ${result.org}`);
      }
    }

    // Step 4: Write config
    console.log("");
    writeConfig(platform, trimmedKey);
    console.log(`  Config written to: ${platform.configPath}`);

    // Step 5: Summary
    console.log("");
    console.log("  Setup complete. Your agent now has these OTP tools:");
    console.log("");
    console.log("    browse_oos        Browse published organizational operating systems");
    console.log("    search_claims     Search across all published claims");
    console.log("    search_intelligence  Deep faceted search with filters");
    console.log("    get_oos           Get a specific OOS file");
    console.log("    get_claims        Get claims from an OOS file");
    console.log("    compare_oos       Diff two OOS files side-by-side");
    console.log("    get_patterns      Cross-org coordination patterns");
    console.log("    get_publishers    Browse publishers with reputation data");
    if (trimmedKey) {
      console.log("    publish_oos       Publish your OOS to the platform");
      console.log("    my_dashboard      Your publisher dashboard");
      console.log("    discover_intelligence  Run the Scout for recommendations");
      console.log("    get_inbox         View your intelligence inbox");
      console.log("    review_recommendation  Act on recommendations");
    }
    console.log("");
    console.log("  Try asking your agent:");
    console.log('    "Search OTP for how other organizations handle agent escalation"');
    console.log('    "Show me coordination patterns in digital marketing agencies"');
    if (trimmedKey) {
      console.log('    "Publish our OOS to OTP"');
      console.log('    "Run the Scout to discover intelligence from other orgs"');
    }
    console.log("");
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
