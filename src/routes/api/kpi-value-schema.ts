// src/routes/api/kpi-value-schema.ts
// Validation for KPI value writes (POST /api/v1/kpis/:id/values).
//
// Lives in its own DB-free module (no import chain reaching
// config/database.ts) so unit tests can import it directly -- see
// kpi-value-schema.test.ts, which pins the falsy-zero regression from
// 2026-06-10: 0 is real data ("0 sales" / "0 close rate") and must
// always validate. Only null/'' mean "no value".
import { z } from 'zod';

export const valueWriteSchema = z.object({
  periodStart: z.string().min(8).max(40),
  // .finite() rejects NaN/Infinity; 0 and negatives are valid measurements.
  // null clears the period's value.
  value: z.number().finite().nullable(),
  notes: z.string().max(1000).nullable().optional(),
});

export type KpiValueWriteBody = z.infer<typeof valueWriteSchema>;
