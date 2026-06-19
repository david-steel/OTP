-- Public API v1 backfill. Run AFTER db:push. Idempotent.
UPDATE organizations
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9 -]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

UPDATE organizations
SET public = true
WHERE name IN ('Sneeze It', 'Clear Skies Title Agency');
