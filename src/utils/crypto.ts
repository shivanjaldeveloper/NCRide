// AES-256-CBC encrypt/decrypt helpers, output/input as base58 (not base64 or
// hex) — ported in from another project's implementation for the same key
// scheme. Logic is unchanged; only typing and the secret placeholder differ.
//
// Wire format per encrypted string: [16 random IV bytes][ciphertext bytes],
// base58-encoded as a single string. A fresh random IV is generated on every
// encrypt() call (required for CBC mode — never reuse an IV with the same
// key), and is carried alongside the ciphertext so decrypt() doesn't need it
// passed separately.
//
// react-native-get-random-values MUST be imported once, at the very top of
// your app entry point (index.js), before anything else — it polyfills
// crypto.getRandomValues, which CryptoJS.lib.WordArray.random() depends on
// under the hood. Importing it here again is harmless (it's idempotent) but
// doesn't substitute for the entry-point import: by the time this module
// loads, other modules may already have been evaluated and cached a
// reference to the unpolyfilled crypto object.
import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';
import bs58 from 'bs58';

// TODO: replace with the real shared secret for this project — do NOT reuse
// a key from another project/environment. Get this from whoever owns the
// aloapp.shop backend's encryption config.
const SHARED_SECRET = 'REPLACE_ME_WITH_ALOAPP_SHOP_SHARED_SECRET';

// Single switch for "is encryption actually ready to use yet". Stays false
// until the real SHARED_SECRET above is in place — every caller that goes
// through postEncrypted() (see authApi.ts) checks this flag and falls back
// to sending/receiving data untouched while it's false, so nothing breaks
// in the meantime. Flip this to true in the SAME commit as swapping in the
// real key, not before — otherwise requests will be "encrypted" with the
// placeholder key and the backend won't be able to decrypt them.
export const ENCRYPTION_ENABLED = false;

export const getAesKey = (): CryptoJS.lib.WordArray => {
  return CryptoJS.SHA256(SHARED_SECRET);
};

export function encrypt(plainText: unknown): string {
  const text = `${plainText}`; // Ensure plainText is a string
  const key = getAesKey();
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const ivBytes = CryptoJS.enc.Hex.parse(iv.toString());
  const cipherBytes = CryptoJS.enc.Base64.parse(encrypted.toString());
  const combinedBytes = ivBytes.concat(cipherBytes);

  const byteArray = Uint8Array.from(
    combinedBytes.words.flatMap(word => [
      (word >> 24) & 0xff,
      (word >> 16) & 0xff,
      (word >> 8) & 0xff,
      word & 0xff,
    ]),
  ).slice(0, combinedBytes.sigBytes);

  return bs58.encode(byteArray);
}

export function decrypt(base58Str: string): string {
  const combinedBytes = bs58.decode(base58Str);

  const iv = CryptoJS.lib.WordArray.create(combinedBytes.slice(0, 16) as any);
  const cipher = CryptoJS.lib.WordArray.create(combinedBytes.slice(16) as any);

  const key = getAesKey();

  const decrypted = CryptoJS.AES.decrypt(
    // @ts-expect-error - CryptoJS's CipherParams type wants more fields than
    // we have at hand, but ciphertext + iv/mode/padding in the options is
    // sufficient at runtime.
    { ciphertext: cipher },
    key,
    { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 },
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Recursive: decrypts every string leaf in a JSON value, leaving numbers,
// booleans, null, array/object structure untouched.
export const decryptJson = (data: any): any => {
  if (typeof data === 'string') {
    return decrypt(data);
  } else if (Array.isArray(data)) {
    return data.map(decryptJson);
  } else if (typeof data === 'object' && data !== null) {
    const decryptedObj: Record<string, any> = {};
    for (const key in data) {
      decryptedObj[key] = decryptJson(data[key]);
    }
    return decryptedObj;
  }
  return data; // For non-string primitives like numbers or booleans
};

// Recursive: encrypts every string leaf in a JSON value, leaving numbers,
// booleans, null, array/object structure untouched.
export const encryptJson = (data: any): any => {
  if (typeof data === 'string') {
    return encrypt(data);
  } else if (Array.isArray(data)) {
    return data.map(encryptJson);
  } else if (typeof data === 'object' && data !== null) {
    const encryptedObj: Record<string, any> = {};
    for (const key in data) {
      encryptedObj[key] = encrypt(data[key]);
    }
    return encryptedObj;
  }
  return data; // For non-string primitives like numbers or booleans
};
