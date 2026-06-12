import { describe, it, expect } from 'vitest';
import { canScheduleWith, type ScheduleGateDeps } from './schedule-gate-logic.js';

function deps(over: Partial<{ balance: number; hasKey: boolean; metering: boolean }>): ScheduleGateDeps {
  return {
    getBalanceCents: async () => over.balance ?? 0,
    hasActiveApiKey: async () => over.hasKey ?? false,
    meteringOn: () => over.metering ?? false,
  };
}

describe('canScheduleWith', () => {
  it('NO_WALLET when balance is zero', async () => {
    const r = await canScheduleWith('org', deps({ balance: 0, hasKey: true }));
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('NO_WALLET');
  });

  it('NO_WALLET when balance is negative (defensive)', async () => {
    const r = await canScheduleWith('org', deps({ balance: -50, hasKey: true }));
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('NO_WALLET');
  });

  it('NO_API_KEY when funded but no active key', async () => {
    const r = await canScheduleWith('org', deps({ balance: 500, hasKey: false }));
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('NO_API_KEY');
    expect(r.balanceCents).toBe(500);
  });

  it('ok when funded AND active key', async () => {
    const r = await canScheduleWith('org', deps({ balance: 500, hasKey: true }));
    expect(r.ok).toBe(true);
    expect(r.reason).toBeUndefined();
    expect(r.hasActiveKey).toBe(true);
  });

  it('gate does not relax when metering is OFF (still requires wallet + key)', async () => {
    const r1 = await canScheduleWith('org', deps({ balance: 0, hasKey: true, metering: false }));
    expect(r1.ok).toBe(false);
    const r2 = await canScheduleWith('org', deps({ balance: 500, hasKey: true, metering: false }));
    expect(r2.ok).toBe(true);
    expect(r2.meteringOn).toBe(false);
  });

  it('surfaces metering state on the result', async () => {
    const r = await canScheduleWith('org', deps({ balance: 500, hasKey: true, metering: true }));
    expect(r.meteringOn).toBe(true);
  });
});
