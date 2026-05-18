/**
 * Review period label, e.g. "Q2-2026".
 *
 * The People Review feature (seat fit + value reviews) keys every row on a
 * period string. API writes and page reads must compute it the same way, so
 * this is the single source of truth.
 */
export function currentPeriod(d: Date = new Date()): string {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q}-${d.getFullYear()}`;
}
