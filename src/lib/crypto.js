// ---------------------------------------------------------------------------
// E2EE helpers — Web Crypto API only, zero dependencies.
//
// Scheme: static ECDH P-256 keypair per user + HKDF-SHA256 + AES-256-GCM.
//   - The private key NEVER leaves this browser (localStorage).
//   - The public key is uploaded to the server (User.e2eePublicKey).
//   - Each message is encrypted twice: to the receiver's public key and to
//     the sender's own public key, so both sides can read history.
// Envelope: { iv, salt, data } (all base64 strings).
// ---------------------------------------------------------------------------

const PRIVATE_KEY_KEY = "campusplace-e2ee-private"; // JWK JSON string
const PUBLIC_KEY_KEY = "campusplace-e2ee-public"; // JWK JSON string
const KEY_VERSION_KEY = "campusplace-e2ee-keyversion";
const UPLOADED_FLAG_KEY = "campusplace-e2ee-uploaded";

const API_URL = import.meta.env.VITE_API_URL;
const HKDF_INFO = new TextEncoder().encode("campusplace-e2ee-v1");

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
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true, // extractable so the private key can be persisted as JWK
    ["deriveBits"]
  );
  const publicJwk = await crypto.subtle.exportKey("jwk", publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", privateKey);
  return { publicJwk, privateJwk };
};

/**
 * Returns the browser's keypair, generating + persisting one on first use.
 * Returns null when E2EE is unavailable (non-secure context).
 */
export const getOrCreateKeyPair = async () => {
  if (!e2eeAvailable()) return null;
  try {
    const storedPrivate = localStorage.getItem(PRIVATE_KEY_KEY);
    const storedPublic = localStorage.getItem(PUBLIC_KEY_KEY);
    const storedVersion = parseInt(localStorage.getItem(KEY_VERSION_KEY) || "1", 10);
    if (storedPrivate && storedPublic) {
      return {
        privateJwk: JSON.parse(storedPrivate),
        publicJwk: JSON.parse(storedPublic),
        keyVersion: Number.isInteger(storedVersion) && storedVersion >= 1 ? storedVersion : 1,
      };
    }
  } catch (e) {
    /* corrupted storage — regenerate below */
  }

  const pair = await generateKeyPair();
  const keyVersion = 1;
  try {
    localStorage.setItem(PRIVATE_KEY_KEY, JSON.stringify(pair.privateJwk));
    localStorage.setItem(PUBLIC_KEY_KEY, JSON.stringify(pair.publicJwk));
    localStorage.setItem(KEY_VERSION_KEY, String(keyVersion));
    localStorage.removeItem(UPLOADED_FLAG_KEY);
  } catch (e) {
    /* private mode — keys won't persist across reloads */
  }
  return { ...pair, keyVersion };
};

const getKeyVersion = () => {
  const v = parseInt(localStorage.getItem(KEY_VERSION_KEY) || "1", 10);
  return Number.isInteger(v) && v >= 1 ? v : 1;
};

const isUploaded = () => {
  try {
    return localStorage.getItem(UPLOADED_FLAG_KEY) === "true";
  } catch (e) {
    return false;
  }
};

const markUploaded = () => {
  try {
    localStorage.setItem(UPLOADED_FLAG_KEY, "true");
  } catch (e) {
    /* ignore */
  }
};

/**
 * Generates the E2EE keypair if missing and uploads the public half to the
 * server. Called after login / session bootstrap. Fire-and-forget safe.
 */
export const ensureEncryptionKey = async (accessToken) => {
  if (!accessToken || !e2eeAvailable()) return false;
  const pair = await getOrCreateKeyPair();
  if (!pair) return false;
  if (isUploaded()) return true;

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
      markUploaded();
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
 * Decrypts a stored message entry:
 *  - receiver copy (`toReceiver`): encrypted with senderPriv × receiverPub →
 *    decrypt with receiverPriv × senderPub (needs the SENDER's public key).
 *  - sender copy (`toSender`): encrypted with senderPriv × senderPub → decrypt
 *    with senderPriv × senderPub (needs the SENDER's own public key).
 * So the public key required is always the *sender's* — which is either the
 * conversation partner (when I'm the receiver) or my own keypair (when I'm
 * the sender).
 * Returns plaintext, or null when it cannot be decrypted (wrong device
 * key / tampered).
 */
export const decryptMessageForMe = async ({
  message,
  myId,
  keyPair, // { publicJwk, privateJwk } — my keypair
  partnerPublicJwk, // the other party's public JWK (may be null)
}) => {
  if (!message || !keyPair?.privateJwk) return null;
  if (!message.encrypted) return message.text || null;

  const mine = String(message.senderId) === String(myId);
  const envelope = mine ? message.ciphertexts?.toSender : message.ciphertexts?.toReceiver;
  if (!envelope) return null;

  // The public key needed for the shared secret is always the sender's.
  const senderPublicJwk = mine ? keyPair.publicJwk : partnerPublicJwk;
  if (!senderPublicJwk) return null;

  try {
    return await decryptFrom(senderPublicJwk, keyPair.privateJwk, envelope);
  } catch (err) {
    console.error("Message decrypt failed:", err?.message);
    return null;
  }
};

export { getKeyVersion };
