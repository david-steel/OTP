import { db } from '../config/database.js';
import { consultantProfiles, workspaces } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

/**
 * Converts a name into a URL-friendly slug.
 * Lowercases, replaces spaces/underscores with hyphens, strips non-alphanumeric characters,
 * collapses consecutive hyphens, and trims leading/trailing hyphens.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Ensures a slug is unique within the specified table.
 * If the base slug is taken, appends -2, -3, etc. until a unique one is found.
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  table: 'consultant_profiles' | 'workspaces'
): Promise<string> {
  const targetTable = table === 'consultant_profiles' ? consultantProfiles : workspaces;

  // Check if base slug is available
  const existing = await db
    .select({ slug: targetTable.slug })
    .from(targetTable)
    .where(eq(targetTable.slug, baseSlug))
    .limit(1);

  if (existing.length === 0) {
    return baseSlug;
  }

  // Find all slugs that match the pattern baseSlug or baseSlug-N
  const pattern = `${baseSlug}-%`;
  const conflicts = await db
    .select({ slug: targetTable.slug })
    .from(targetTable)
    .where(
      sql`${targetTable.slug} = ${baseSlug} OR ${targetTable.slug} LIKE ${pattern}`
    );

  // Extract the highest numeric suffix
  let maxSuffix = 1;
  for (const row of conflicts) {
    const match = row.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSuffix) {
        maxSuffix = num;
      }
    }
  }

  return `${baseSlug}-${maxSuffix + 1}`;
}
