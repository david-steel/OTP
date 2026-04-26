// Staleness logic for OOS draft cleanup.
//
// A draft is "stale" if ANY of:
//   1. Empty:           claim_count = 0 AND word_count < 200
//   2. Exact duplicate: another draft in same org has identical
//                       (template, claim_count, word_count, raw_content)
//                       -- keep the newest, rest are stale.
//
// Published files are never stale.

export interface OosRow {
  id: string;
  orgId: string;
  template: string;
  version: number;
  status: string;
  claimCount: number;
  wordCount: number;
  rawContent: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  [key: string]: any;
}

export interface AnnotatedOos extends OosRow {
  isStale: boolean;
  staleReason?: string;
}

const EMPTY_WORD_THRESHOLD = 200;

export function annotateOosStaleness<T extends OosRow>(files: T[]): (T & { isStale: boolean; staleReason?: string })[] {
  // Group drafts by dedup key (same template + claimCount + wordCount + raw content hash)
  const draftKey = (f: OosRow) => `${f.template}|${f.claimCount}|${f.wordCount}|${f.rawContent?.length || 0}|${(f.rawContent || '').slice(0, 500)}`;
  const byKey = new Map<string, T[]>();
  for (const f of files) {
    if (f.status !== 'draft') continue;
    const k = draftKey(f);
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(f);
  }

  // For each group with >1, keep the newest (by version desc, updatedAt desc) and mark rest duplicate
  const duplicateIds = new Set<string>();
  for (const group of byKey.values()) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => {
      if (a.version !== b.version) return b.version - a.version;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    // sorted[0] is newest -- keep; rest are duplicates
    for (let i = 1; i < sorted.length; i++) duplicateIds.add(sorted[i].id);
  }

  return files.map(f => {
    if (f.status !== 'draft') return { ...f, isStale: false };
    if (f.claimCount === 0 && f.wordCount < EMPTY_WORD_THRESHOLD) {
      return { ...f, isStale: true, staleReason: 'empty draft (no claims, <200 words)' };
    }
    if (duplicateIds.has(f.id)) {
      return { ...f, isStale: true, staleReason: 'exact duplicate of a newer draft' };
    }
    return { ...f, isStale: false };
  });
}

export function getStaleDraftIds<T extends OosRow>(files: T[]): string[] {
  return annotateOosStaleness(files).filter(f => f.isStale).map(f => f.id);
}
