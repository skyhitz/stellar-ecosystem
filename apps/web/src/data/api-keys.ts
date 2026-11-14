const KEY_PREFIX = "ses_live_";
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const SECRET_LENGTH = 22;
/** How much of a key stays visible in the list after creation: the prefix plus four characters. */
const VISIBLE_LENGTH = KEY_PREFIX.length + 4;

/**
 * Makes a key-shaped placeholder in the browser. Real keys must be issued and
 * stored (hashed) by the backend; this exists only so the demo flow works.
 */
export function createDemoKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SECRET_LENGTH));
  return KEY_PREFIX + Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

export function visiblePrefix(key: string): string {
  return key.slice(0, VISIBLE_LENGTH);
}

/** Today's date as YYYY-MM-DD (UTC). */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
