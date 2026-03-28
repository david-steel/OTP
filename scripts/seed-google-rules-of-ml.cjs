const { Client } = require('pg');
const { readFileSync } = require('fs');

const DATABASE_URL = "postgresql://postgres:HbBbFblNwLUoNCCuFMhBKRyEOMAXglvy@shortline.proxy.rlwy.net:15335/railway";
const data = JSON.parse(readFileSync('/Users/dsteel/otp-platform/data/google-rules-of-ml.json', 'utf-8'));
const c = new Client({ connectionString: DATABASE_URL });

c.connect().then(async () => {
  const pub = await c.query("SELECT id, slug FROM consultant_profiles WHERE slug = 'google'");
  console.log('Publisher lookup:', pub.rows);
  const pubId = pub.rows[0]?.id || null;

  let inserted = 0;
  let skipped = 0;
  for (const t of data.terms) {
    try {
      const res = await c.query(
        'INSERT INTO best_practices (publisher_profile_id, slug, term, definition, category, related_terms, source_url, canonical_url, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$7,$8) ON CONFLICT DO NOTHING RETURNING id',
        [pubId, t.slug, t.term, t.definition, t.category, t.relatedTerms || [], t.sourceUrl, JSON.stringify({ source: data.source.name })]
      );
      if (res.rowCount > 0) inserted++;
      else skipped++;
    } catch (e) {
      console.error('Error inserting', t.slug, e.message);
    }
  }
  console.log('Inserted: ' + inserted + ', Skipped (already existed): ' + skipped + ', Total attempted: ' + data.terms.length);

  if (pubId) {
    const cnt = await c.query('SELECT COUNT(*) as c FROM best_practices WHERE publisher_profile_id = $1', [pubId]);
    await c.query('UPDATE consultant_profiles SET content_count = $1, updated_at = NOW() WHERE id = $2', [parseInt(cnt.rows[0].c), pubId]);
    console.log('Updated Google content count to ' + cnt.rows[0].c);
  } else {
    console.log('WARNING: No Google publisher profile found. Rules inserted without publisher_profile_id.');
  }
  await c.end();
}).catch(e => { console.error(e); c.end(); });
