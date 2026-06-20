/**
 * Drift guard for the Remote MCP tools.
 *
 * The hosted endpoint (src/mcp/otp-tools.ts) and the standalone npm package
 * (mcp-server/src/index.ts) expose the same tools by design, but ship as
 * separate artifacts (the package is not in the prod Docker image). This test
 * asserts their tool-name sets stay identical so they can't silently diverge.
 *
 * It also smoke-tests that the canonical module loads and registers cleanly
 * (no DB required -- it only pulls in the MCP SDK + zod).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerOtpTools } from './otp-tools.js';

function captureCanonicalToolNames(): string[] {
  const names: string[] = [];
  const stub = {
    tool: (name: string) => {
      names.push(name);
    },
  } as unknown as McpServer;
  registerOtpTools(stub, {
    otpFetch: async () => ({}),
    OTP_API_KEY: 'otp_test',
    OTP_BASE_URL: 'https://orgtp.com',
  });
  return names;
}

function stdioToolNames(): string[] {
  const src = readFileSync(join(process.cwd(), 'mcp-server/src/index.ts'), 'utf8');
  return [...src.matchAll(/server\.tool\(\s*"([a-z_]+)"/g)].map((m) => m[1]);
}

describe('Remote MCP tool registry', () => {
  it('registers every tool cleanly (smoke)', () => {
    const names = captureCanonicalToolNames();
    expect(names.length).toBeGreaterThan(0);
    // No duplicate tool names.
    expect(new Set(names).size).toBe(names.length);
  });

  it('matches the standalone stdio package tool-for-tool (no drift)', () => {
    const canonical = new Set(captureCanonicalToolNames());
    const stdio = new Set(stdioToolNames());
    const missingFromCanonical = [...stdio].filter((n) => !canonical.has(n));
    const extraInCanonical = [...canonical].filter((n) => !stdio.has(n));
    expect({ missingFromCanonical, extraInCanonical }).toEqual({
      missingFromCanonical: [],
      extraInCanonical: [],
    });
  });
});
