import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

/* RFC 6238 time-based one-time passwords (SHA-1, 6 digits, 30 second steps). */

const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const stepSeconds = 30;
const digits = 6;

export function generateTotpSecret() {
  return base32Encode(randomBytes(20));
}

export function base32Encode(buffer: Buffer) {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += base32Alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += base32Alphabet[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(input: string) {
  const clean = input.replace(/[\s=]/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const character of clean) {
    const index = base32Alphabet.indexOf(character);
    if (index < 0) throw new Error('Invalid authenticator secret.');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function totpCode(secret: string, step: number) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary = ((hmac[offset] & 0x7f) << 24)
    | (hmac[offset + 1] << 16)
    | (hmac[offset + 2] << 8)
    | hmac[offset + 3];
  return String(binary % 10 ** digits).padStart(digits, '0');
}

export function currentTotpStep(now = Date.now()) {
  return Math.floor(now / 1000 / stepSeconds);
}

/**
 * Checks a code against the current step and one step either side (clock drift).
 * Returns the matched step so the caller can refuse to accept it twice.
 */
export function verifyTotp(secret: string, code: string, lastUsedStep = -1) {
  if (!/^\d{6}$/.test(code)) return null;
  const step = currentTotpStep();
  const codeBuffer = Buffer.from(code);
  for (const candidate of [step, step - 1, step + 1]) {
    if (candidate <= lastUsedStep) continue;
    if (timingSafeEqual(Buffer.from(totpCode(secret, candidate)), codeBuffer)) return candidate;
  }
  return null;
}

export function otpauthUri(secret: string, accountLabel: string, issuer: string) {
  const label = encodeURIComponent(`${issuer}:${accountLabel}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${digits}&period=${stepSeconds}`;
}

function encryptionKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is required to store two-step verification secrets.');
  return createHash('sha256').update(`totp:${secret}`).digest();
}

/** Encrypts a TOTP secret at rest with AES-256-GCM, keyed from AUTH_SECRET. */
export function encryptTotpSecret(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join('.');
}

export function decryptTotpSecret(value: string) {
  const [iv, tag, encrypted] = value.split('.').map((part) => Buffer.from(part, 'base64'));
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
