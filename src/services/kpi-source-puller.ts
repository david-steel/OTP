/**
 * kpi-source-puller.ts -- server-side KPI ingestion (Inc 4). The customer-facing
 * twin of Tally: map a scorecard KPI to a connected tool + read + extract spec,
 * then pull the value on demand and write it to the scorecard via the SAME
 * writeKpiValue path manual entry uses. Read-only (executeOrgTool only runs
 * read-scoped tools). user_id == orgId.
 *
 * Storage is the kpi_sources table (one row per KPI, unique on kpi_id). Secrets
 * never live here -- the connection is a reference into Composio's vault.
 */
import { db } from '../config/database.js';
import { sql } from 'drizzle-orm';
import { getKpi, writeKpiValue } from './kpi.js';
import { executeOrgTool } from './composio-tools.js';
import { extractValue, type ExtractSpec } from '../shared/kpi-extract.js';

export class KpiSourceError extends Error {
  constructor(readonly code: string, readonly httpStatus: number, message: string) {
    super(message);
    this.name = 'KpiSourceError';
  }
}

export interface KpiSourceInput {
  connectionId: string;
  action: string; // Composio tool slug (read-only)
  params: Record<string, unknown>; // tool arguments
  extract: ExtractSpec;
  cadence?: string | null;
}

export interface KpiSourceRow {
  id: string;
  kpi_id: string;
  provider: string;
  connection_id: string;
  action: string;
  params: Record<string, unknown>;
  extract: ExtractSpec;
  cadence: string | null;
  last_value: number | null;
  last_pulled_at: string | null;
  last_error: string | null;
}

/** Create or replace the source mapping for a KPI. Validates org + connection. */
export async function upsertKpiSource(
  orgId: string,
  kpiId: string,
  input: KpiSourceInput,
  userId: string | null,
): Promise<KpiSourceRow> {
  await getKpi(orgId, kpiId); // throws KpiError if the KPI isn't this org's

  const [conn] = (await db.execute(sql`
    SELECT id, provider, status FROM integration_connections
    WHERE id = ${input.connectionId} AND org_id = ${orgId} LIMIT 1
  `)).rows as Array<{ id: string; provider: string; status: string }>;
  if (!conn) throw new KpiSourceError('CONNECTION_NOT_FOUND', 404, 'No such connection for this org');
  if (conn.status !== 'active') throw new KpiSourceError('CONNECTION_INACTIVE', 409, 'Connection is not active');

  const [row] = (await db.execute(sql`
    INSERT INTO kpi_sources
      (org_id, kpi_id, connection_id, provider, action, params, extract, cadence, created_by_user_id, updated_at)
    VALUES (
      ${orgId}, ${kpiId}, ${input.connectionId}, ${conn.provider}, ${input.action},
      ${JSON.stringify(input.params || {})}::jsonb, ${JSON.stringify(input.extract || {})}::jsonb,
      ${input.cadence || null}, ${userId}, now()
    )
    ON CONFLICT (kpi_id) DO UPDATE SET
      connection_id = EXCLUDED.connection_id,
      provider = EXCLUDED.provider,
      action = EXCLUDED.action,
      params = EXCLUDED.params,
      extract = EXCLUDED.extract,
      cadence = EXCLUDED.cadence,
      last_error = NULL,
      updated_at = now()
    RETURNING id, kpi_id, provider, connection_id, action, params, extract, cadence, last_value, last_pulled_at, last_error
  `)).rows as unknown as KpiSourceRow[];
  return row;
}

export async function getKpiSource(orgId: string, kpiId: string): Promise<KpiSourceRow | null> {
  const [row] = (await db.execute(sql`
    SELECT id, kpi_id, provider, connection_id, action, params, extract, cadence, last_value, last_pulled_at, last_error
    FROM kpi_sources WHERE org_id = ${orgId} AND kpi_id = ${kpiId} LIMIT 1
  `)).rows as unknown as KpiSourceRow[];
  return row || null;
}

export async function deleteKpiSource(orgId: string, kpiId: string): Promise<boolean> {
  const res = await db.execute(sql`
    DELETE FROM kpi_sources WHERE org_id = ${orgId} AND kpi_id = ${kpiId}
  `);
  return (res.rowCount ?? 0) > 0;
}

export interface RefreshResult {
  value: number;
  note: string;
}

/**
 * Pull the mapped source now: execute the read tool, extract the number, write
 * it to the scorecard, and stamp the source row. Throws KpiSourceError with a
 * specific code on each failure mode so the route maps to the right HTTP status.
 */
export async function refreshKpiSource(orgId: string, kpiId: string, now: Date = new Date()): Promise<RefreshResult> {
  const src = await getKpiSource(orgId, kpiId);
  if (!src) throw new KpiSourceError('NO_SOURCE', 404, 'This KPI has no connected source');

  const exec = await executeOrgTool(orgId, src.action, src.params);
  if (!exec.successful) {
    await stampError(src.id, exec.error || 'tool execution failed');
    throw new KpiSourceError('PULL_FAILED', 502, exec.error || 'tool execution failed');
  }

  const { value, note } = extractValue(exec.data, src.extract, now);
  if (value === null) {
    await stampError(src.id, note);
    throw new KpiSourceError('EXTRACT_FAILED', 422, note);
  }

  await writeKpiValue(
    orgId, kpiId,
    { periodStart: now, value, notes: `integration pull: ${note}`, source: 'api' },
    'integration',
  );
  await db.execute(sql`
    UPDATE kpi_sources SET last_value = ${value}, last_error = NULL, last_pulled_at = now(), updated_at = now()
    WHERE id = ${src.id}
  `);
  return { value, note };
}

async function stampError(sourceId: string, error: string): Promise<void> {
  await db.execute(sql`
    UPDATE kpi_sources SET last_error = ${error.slice(0, 500)}, last_pulled_at = now(), updated_at = now()
    WHERE id = ${sourceId}
  `);
}
