// ---------------------------------------------------------------------------
// E2EE helpers — Web Crypto API only, zero dependencies.
//
// Scheme: static ECDH P-256 keypair per user + HKDF-SHA256 + AES-256-GCM.
//   - The private key NEVER leaves this browser (localStorage).
//   - The public key is uploaded to the server (User.e2eePublicKey).
//   - Each message is encrypted twice: to the receiver's public key and to
//     the sender's own public key, so both sides can read history.
// Envelope: { iv, salt, data } (all base64 strings).
//
// Key storage is SCOPED PER USER so multiple accounts on one browser never
// share a keypair. Policy on login: "server key wins" — if the server holds
// a different key for this user (e.g. they last logged in elsewhere), the
// local key is dead and a fresh keypair is generated + uploaded.
// ---------------------------------------------------------------------------

const API_URL = import.meta.env.VITE_API_URL;
const HKDF_INFO = new TextEncoder().encode("campusplace-e2ee-v1");

// Legacy global keys (pre user-scoping) — read once for one-time migration.
const LEGACY_PRIVATE_KEY = "campusplace-e2ee-private";
const LEGACY_PUBLIC_KEY = "campusplace-e2ee-public";
const LEGACY_KEY_VERSION = "campusplace-e2ee-keyversion";
const LEGACY_UPLOADED_FLAG = "campusplace-e2ee-uploaded";

// Per-user scoped keys.
const scopedKey = (userId, suffix) => `campusplace-e2ee:${userId}:${suffix}`;
const privateKey = (userId) => scopedKey(userId, "private"); // JWK JSON string
const publicKey = (userId) => scopedKey(userId, "public"); // JWK JSON string
const versionKey = (userId) => scopedKey(userId, "version");
const uploadedKey = (userId) => scopedKey(userId, "uploaded"); // holds the uploaded public JWK JSON
const keepOnLogoutKey = (userId) => scopedKey(userId, "keep-on-logout"); // "1" | "0"

export const e2eeAvailable = () =>
  typeof window !== "undefined" &&
  window.isSecureContext === true &&
  typeof window.crypto?.subtle === "object";

// --- base64 <-> bytes (browser-safe) -------------------------------------

const b64encode = (bytes) => {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
};

const b64decode = (str) => {
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

// --- key lifecycle --------------------------------------------------------

const generateKeyPair = async () => {
  const { publicKey: pub, privateKey: priv } = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true, // extractable so the private key can be persisted as JWK
    ["deriveBits"]
  );
  const publicJwk = await crypto.subtle.exportKey("jwk", pub);
  const privateJwk = await crypto.subtle.exportKey("jwk", priv);
  return { publicJwk, privateJwk };
};

const persistKeyPair = (userId, pair) => {
  try {
    localStorage.setItem(privateKey(userId), JSON.stringify(pair.privateJwk));
    localStorage.setItem(publicKey(userId), JSON.stringify(pair.publicJwk));
    localStorage.setItem(versionKey(userId), String(pair.keyVersion));
  } catch (e) {
    /* private mode — keys won't persist across reloads */
  }
};

const readKeyPair = (userId) => {
  try {
    const priv = localStorage.getItem(privateKey(userId));
    const pub = localStorage.getItem(publicKey(userId));
    if (!priv || !pub) return null;
    const v = parseInt(localStorage.getItem(versionKey(userId)) || "1", 10);
    return {
      privateJwk: JSON.parse(priv),
      publicJwk: JSON.parse(pub),
      keyVersion: Number.isInteger(v) && v >= 1 ? v : 1,
    };
  } catch (e) {
    return null; // corrupted storage — regenerate below
  }
};

/**
 * Returns this user's browser keypair, generating + persisting one on first
 * use. Scoped by userId so multiple accounts on one browser stay isolated.
 * Returns null when E2EE is unavailable (non-secure context).
 */
export const getOrCreateKeyPair = async (userId) => {
  if (!e2eeAvailable() || !userId) return null;
  const existing = readKeyPair(userId);
  if (existing) return existing;

  const pair = await generateKeyPair();
  persistKeyPair(userId, { ...pair, keyVersion: 1 });
  return { ...pair, keyVersion: 1 };
};

const uploadedJwkFor = (userId) => {
  try {
    return localStorage.getItem(uploadedKey(userId));
  } catch (e) {
    return null;
  }
};

const markUploaded = (userId, pair) => {
  try {
    localStorage.setItem(uploadedKey(userId), JSON.stringify(pair.publicJwk));
  } catch (e) {
    /* ignore */
  }
};

export const getKeyVersion = (userId) => {
  if (!userId) return 1;
  const v = parseInt(localStorage.getItem(versionKey(userId)) || "1", 10);
  return Number.isInteger(v) && v >= 1 ? v : 1;
};

/**
 * One-time migration from the pre-scoping global keys: if a legacy keypair
 * exists AND its public key matches the server's current key for this user,
 * adopt it into the user-scoped slot (preserves existing chat history).
 * Returns the adopted pair, or null when there is nothing to migrate.
 */
const migrateLegacyKey = (userId, serverJwk) => {
  try {
    const legacyPublic = localStorage.getItem(LEGACY_PUBLIC_KEY);
    const legacyPrivate = localStorage.getItem(LEGACY_PRIVATE_KEY);
    if (!legacyPublic || !legacyPrivate) return null;

    const legacyPublicJwk = JSON.parse(legacyPublic);
    // Only adopt when it is genuinely this user's key (matches the server).
    if (!serverJwk || JSON.stringify(legacyPublicJwk) !== JSON.stringify(serverJwk)) {
      return null;
    }

    const v = parseInt(localStorage.getItem(LEGACY_KEY_VERSION) || "1", 10);
    const pair = {
      publicJwk: legacyPublicJwk,
      privateJwk: JSON.parse(legacyPrivate),
      keyVersion: Number.isInteger(v) && v >= 1 ? v : 1,
    };
    persistKeyPair(userId, pair);
    localStorage.removeItem(LEGACY_PRIVATE_KEY);
    localStorage.removeItem(LEGACY_PUBLIC_KEY);
    localStorage.removeItem(LEGACY_KEY_VERSION);
    localStorage.removeItem(LEGACY_UPLOADED_FLAG);
    return pair;
  } catch (e) {
    return null;
  }
};

/**
 * Verifies/establishes the E2EE key for a session:
 *  1. Fetch the server's current key for this user (self).
 *  2. Server key wins — a different server key means the local key is dead:
 *     migrate the legacy key if it matches, otherwise regenerate + upload.
 *  3. Upload the public half (idempotent) when this exact key isn't uploaded.
 * Call after login / session bootstrap. Fire-and-forget safe.
 */
export const ensureEncryptionKey = async (accessToken, userId) => {
  if (!accessToken || !userId || !e2eeAvailable()) return false;

  let pair = await getOrCreateKeyPair(userId);
  if (!pair) return false;

  // Fetch the server's current key for this user.
  let serverJwk = null;
  let serverKeyVersion = null;
  try {
    const res = await fetch(`${API_URL}/api/v2/users/${userId}/e2ee-key`, {
      method: "GET",
      credentials: "include",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const response = await res.json();
    const raw = response?.data?.publicKey;
    if (raw) {
      const jwk = JSON.parse(raw);
      serverJwk = jwk?.kty ? jwk : null;
    }
    const sv = Number(response?.data?.keyVersion);
    serverKeyVersion = Number.isInteger(sv) && sv >= 1 ? sv : null;
  } catch (err) {
    console.error("E2EE server key fetch failed:", err?.message);
    // Continue to upload (idempotent) so the session still works.
  }

  const localJwkStr = JSON.stringify(pair.publicJwk);
  const serverJwkStr = serverJwk ? JSON.stringify(serverJwk) : null;

  if (serverJwkStr && serverJwkStr !== localJwkStr) {
    // Server key wins — the local key is stale (another device took over).
    const adopted = migrateLegacyKey(userId, serverJwk);
    if (adopted) {
      pair = adopted;
    } else {
      // Regenerate a fresh identity for THIS browser.
      const nextVersion = Math.max(pair.keyVersion, serverKeyVersion || 1) + 1;
      const fresh = await generateKeyPair();
      pair = { ...fresh, keyVersion: nextVersion };
      persistKeyPair(userId, pair);
    }
  }

  // Upload (idempotent) unless this exact key was already uploaded.
  if (uploadedJwkFor(userId) === JSON.stringify(pair.publicJwk)) return true;

  try {
    const res = await fetch(`${API_URL}/api/v2/users/e2ee-key`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        publicKey: JSON.stringify(pair.publicJwk),
        keyVersion: pair.keyVersion,
      }),
    });
    const response = await res.json();
    if (response?.success) {
      markUploaded(userId, pair);
      return true;
    }
    console.error("E2EE key upload failed:", response?.message);
    return false;
  } catch (err) {
    console.error("E2EE key upload error:", err?.message);
    return false;
  }
};

/**
 * Removes this user's keypair from the browser (logout in strict mode).
 * Local-only — the server key is left intact so other devices keep working.
 */
export const clearUserKeys = (userId) => {
  if (!userId) return;
  try {
    localStorage.removeItem(privateKey(userId));
    localStorage.removeItem(publicKey(userId));
    localStorage.removeItem(versionKey(userId));
    localStorage.removeItem(uploadedKey(userId));
  } catch (e) {
    /* ignore */
  }
};

/**
 * Per-user preference (default ON): keep the key in this browser across
 * logouts so encrypted history stays readable after re-login. When OFF,
 * the key is cleared at logout and old chats appear locked afterwards.
 */
export const getKeepKeyOnLogout = (userId) => {
  if (!userId) return true;
  try {
    return localStorage.getItem(keepOnLogoutKey(userId)) !== "0";
  } catch (e) {
    return true;
  }
};

export const setKeepKeyOnLogout = (userId, keep) => {
  if (!userId) return;
  try {
    localStorage.setItem(keepOnLogoutKey(userId), keep ? "1" : "0");
  } catch (e) {
    /* ignore */
  }
};

/**
 * Fetches another user's public key (JWK JSON string) or null for legacy
 * users who never generated one.
 */
export const fetchPublicKey = async (userId, accessToken) => {
  if (!userId || !accessToken) return null;
  try {
    const res = await fetch(`${API_URL}/api/v2/users/${userId}/e2ee-key`, {
      method: "GET",
      credentials: "include",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const response = await res.json();
    const raw = response?.data?.publicKey;
    if (!raw) return null;
    const jwk = JSON.parse(raw);
    return jwk?.kty ? jwk : null;
  } catch (err) {
    console.error("Failed to fetch public key:", err?.message);
    return null;
  }
};

// --- crypto primitives ----------------------------------------------------

const sharedSecret = async (myPrivateJwk, theirPublicJwk) => {
  const priv = await crypto.subtle.importKey(
    "jwk",
    myPrivateJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveBits"]
  );
  const pub = await crypto.subtle.importKey(
    "jwk",
    theirPublicJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  return crypto.subtle.deriveBits({ name: "ECDH", public: pub }, priv, 256);
};

const deriveAesKey = async (shared, salt) => {
  const base = await crypto.subtle.importKey("raw", shared, "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt, info: HKDF_INFO },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * Encrypts plaintext so that the holder of `theirPublicJwk`'s matching
 * private key can decrypt it. Returns a base64 envelope { iv, salt, data }.
 */
export const encryptFor = async (theirPublicJwk, myPrivateJwk, plaintext) => {
  const shared = await sharedSecret(myPrivateJwk, theirPublicJwk);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(shared, salt);
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return {
    iv: b64encode(iv),
    salt: b64encode(salt),
    data: b64encode(new Uint8Array(data)),
  };
};

/**
 * Decrypts an envelope produced for the partner whose public key is
 * `theirPublicJwk`, using my private key (ECDH shared secret is symmetric).
 * Throws on tampering / wrong key — callers should fall back gracefully.
 */
export const decryptFrom = async (theirPublicJwk, myPrivateJwk, envelope) => {
  const shared = await sharedSecret(myPrivateJwk, theirPublicJwk);
  const salt = b64decode(envelope.salt);
  const iv = b64decode(envelope.iv);
  const key = await deriveAesKey(shared, salt);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    b64decode(envelope.data)
  );
  return new TextDecoder().decode(plain);
};

/**
 * Builds the double-encrypted payload for a message: one copy for the
 * receiver, one for the sender's own history.
 */
export const buildCiphertexts = async ({ myPrivateJwk, myPublicJwk, theirPublicJwk, text }) => {
  const toReceiver = await encryptFor(theirPublicJwk, myPrivateJwk, text);
  const toSender = await encryptFor(myPublicJwk, myPrivateJwk, text);
  return { toSender, toReceiver };
};

/**
 * Decrypts a stored message entry and reports WHY it could not be decrypted:
 *  - { status: "ok", text }            — decrypted (or legacy plaintext)
 *  - { status: "no_partner_key" }      — incoming message, partner has no key
 *  - { status: "old_key" }             — key was rotated since this was sent
 *  - { status: "corrupt" }             — envelope missing / tampered / wrong key
 *
 * Envelope selection: my own message → `toSender` (my key), incoming →
 * `toReceiver` (needs the SENDER's public key).
 */
export const decryptMessageForMe = async ({
  message,
  myId,
  keyPair, // { publicJwk, privateJwk, keyVersion } — my keypair
  partnerPublicJwk, // the other party's public JWK (may be null)
}) => {
  if (!message || !keyPair?.privateJwk) return { status: "corrupt", text: null };
  if (!message.encrypted) return { status: "ok", text: message.text || "" };

  const mine = String(message.senderId) === String(myId);
  const envelope = mine ? message.ciphertexts?.toSender : message.ciphertexts?.toReceiver;
  if (!envelope) return { status: "corrupt", text: null };

  // The public key needed for the shared secret is always the sender's.
  const senderPublicJwk = mine ? keyPair.publicJwk : partnerPublicJwk;
  if (!senderPublicJwk) return { status: "no_partner_key", text: null };

  // Key rotation: message encrypted under an older key version.
  if (
    Number.isInteger(message.keyVersion) &&
    Number.isInteger(keyPair.keyVersion) &&
    message.keyVersion < keyPair.keyVersion
  ) {
    return { status: "old_key", text: null };
  }

  try {
    const plain = await decryptFrom(senderPublicJwk, keyPair.privateJwk, envelope);
    return { status: "ok", text: plain };
  } catch (err) {
    console.error("Message decrypt failed:", err?.message);
    return { status: "corrupt", text: null };
  }
};
