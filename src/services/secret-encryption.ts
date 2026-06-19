import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

/**
 * At-rest encryption utility for customer secrets (e.g. BYOK AI keys).
 *
 * Uses authenticated symmetric encryption (AES-256-GCM) via Node's built-in
 * `crypto` module — no external dependencies.
 *
 * The master key comes from `process.env.AI_KEYS_ENCRYPTION_KEY`, accepted as
 * either 64 hex chars or base64 decoding to exactly 32 bytes. The key is parsed
 * and validated LAZILY inside each function so the application still boots when
 * the env var is absent; only operations that actually need the key throw.
 *
 * Packed format (compact, self-describing, forward-compatible):
 *   `v1:` + base64( iv[12] | authTag[16] | ciphertext )
 *
 * Security notes:
 *   - Plaintext and the master key are NEVER logged or included in errors.
 *   - The GCM auth tag is verified on decrypt; tampering/mismatch throws.
 */

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32; // AES-256
const IV_BYTES = 12; // GCM standard nonce length
const TAG_BYTES = 16; // GCM auth tag length
const VERSION_PREFIX = 'v1:';
const ENV_VAR = 'AI_KEYS_ENCRYPTION_KEY';

/**
 * Resolve and validate the master key from the environment.
 * Returns the 32-byte key Buffer, or null if absent/invalid.
 * Never throws and never logs the key material.
 */
function resolveMasterKey(): Buffer | null {
  const raw = process.env[ENV_VAR];
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // 64 hex chars -> 32 bytes
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    const buf = Buffer.from(trimmed, 'hex');
    return buf.length === KEY_BYTES ? buf : null;
  }

  // Otherwise attempt base64 decode; must yield exactly 32 bytes.
  try {
    const buf = Buffer.from(trimmed, 'base64');
    return buf.length === KEY_BYTES ? buf : null;
  } catch {
    return null;
  }
}

/**
 * True iff the encryption key is present and decodes to exactly 32 bytes.
 */
export function isEncryptionConfigured(): boolean {
  return resolveMasterKey() !== null;
}

/**
 * Encrypt a UTF-8 plaintext secret. Returns a compact packed string:
 *   `v1:` + base64( iv | authTag | ciphertext )
 *
 * @throws Error('AI_KEYS_ENCRYPTION_KEY not configured') if no valid key.
 */
export function encryptSecret(plaintext: string): string {
  const key = resolveMasterKey();
  if (!key) {
    throw new Error('AI_KEYS_ENCRYPTION_KEY not configured');
  }

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const packed = Buffer.concat([iv, authTag, ciphertext]);
  return VERSION_PREFIX + packed.toString('base64');
}

/**
 * Decrypt a packed string produced by `encryptSecret`. Verifies the GCM auth
 * tag; throws on tamper, truncation, or wrong key.
 *
 * @throws Error('AI_KEYS_ENCRYPTION_KEY not configured') if no valid key.
 * @throws Error if the packed payload is malformed or authentication fails.
 */
export function decryptSecret(packed: string): string {
  const key = resolveMasterKey();
  if (!key) {
    throw new Error('AI_KEYS_ENCRYPTION_KEY not configured');
  }

  if (typeof packed !== 'string' || !packed.startsWith(VERSION_PREFIX)) {
    throw new Error('Malformed encrypted secret: unsupported or missing version prefix');
  }

  const b64 = packed.slice(VERSION_PREFIX.length);
  const buf = Buffer.from(b64, 'base64');

  if (buf.length < IV_BYTES + TAG_BYTES) {
    throw new Error('Malformed encrypted secret: payload too short');
  }

  const iv = buf.subarray(0, IV_BYTES);
  const authTag = buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = buf.subarray(IV_BYTES + TAG_BYTES);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  try {
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return plaintext.toString('utf8');
  } catch {
    // Auth tag mismatch or corrupted ciphertext. Do not leak any detail.
    throw new Error('Decryption failed: authentication tag mismatch or corrupted data');
  }
}

/**
 * Return the last 4 characters of a secret for masked display.
 * Never logs or exposes the full value. Returns fewer than 4 chars if the
 * input is shorter (or '' for empty input).
 */
export function last4(plaintext: string): string {
  if (!plaintext) return '';
  return plaintext.slice(-4);
}
