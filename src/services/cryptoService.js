const PBKDF2_ITERATIONS = 310000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

let dataKey = null;

function toBase64Url(bytes) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeText(value) {
  return new TextEncoder().encode(value);
}

function decodeText(value) {
  return new TextDecoder().decode(value);
}

async function deriveWrappingKey(password, salt) {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encodeText(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function wrapDataKey(password, salt) {
  const wrappingKey = await deriveWrappingKey(password, salt);
  const rawDataKey = await crypto.subtle.exportKey('raw', dataKey);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encryptedDataKey = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    wrappingKey,
    rawDataKey,
  );
  return `${toBase64Url(iv)}.${toBase64Url(new Uint8Array(encryptedDataKey))}`;
}

async function unwrapDataKey(password, salt, encryptedDataKey) {
  const [encodedIv, encodedCiphertext] = encryptedDataKey.split('.');
  if (!encodedIv || !encodedCiphertext) throw new Error('La clave de cifrado no es válida.');

  const wrappingKey = await deriveWrappingKey(password, salt);
  const rawDataKey = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64Url(encodedIv) },
    wrappingKey,
    fromBase64Url(encodedCiphertext),
  );
  return crypto.subtle.importKey(
    'raw',
    rawDataKey,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt'],
  );
}

export async function createEncryptionMetadata(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  dataKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
  return {
    encryptionSalt: toBase64Url(salt),
    encryptedDataKey: await wrapDataKey(password, salt),
  };
}

export async function unlockEncryption(password, metadata) {
  if (!metadata?.encryptionSalt || !metadata?.encryptedDataKey) {
    return createEncryptionMetadata(password);
  }

  const salt = fromBase64Url(metadata.encryptionSalt);
  dataKey = await unwrapDataKey(password, salt, metadata.encryptedDataKey);
  return metadata;
}

export async function preparePasswordChange(password) {
  if (!dataKey) throw new Error('Debes desbloquear tus notas antes de cambiar la contraseña.');
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return {
    encryptionSalt: toBase64Url(salt),
    encryptedDataKey: await wrapDataKey(password, salt),
  };
}

export function isUnlocked() {
  return Boolean(dataKey);
}

export function clearEncryptionKey() {
  dataKey = null;
}

export async function encryptText(value) {
  if (!dataKey) throw new Error('Debes desbloquear tus notas antes de continuar.');
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    dataKey,
    encodeText(value),
  );
  return `${toBase64Url(iv)}.${toBase64Url(new Uint8Array(ciphertext))}`;
}

export async function decryptText(value) {
  if (!dataKey) throw new Error('Debes desbloquear tus notas antes de continuar.');
  const [encodedIv, encodedCiphertext] = value.split('.');
  if (!encodedIv || !encodedCiphertext) throw new Error('El contenido cifrado no es válido.');

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64Url(encodedIv) },
    dataKey,
    fromBase64Url(encodedCiphertext),
  );
  return decodeText(plaintext);
}