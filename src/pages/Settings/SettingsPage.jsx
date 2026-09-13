import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, KeyRound, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
import {
  e2eeAvailable,
  getOrCreateKeyPair,
  getKeepKeyOnLogout,
  setKeepKeyOnLogout,
} from "../../lib/crypto.js";

function SettingsPage() {
  const { userInfo } = useUserData();
  const myId = userInfo?.user?._id;

  const [keepKey, setKeepKey] = useState(true);
  const [keyVersion, setKeyVersion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!myId) return;
    let cancelled = false;
    (async () => {
      setKeepKey(getKeepKeyOnLogout(myId));
      if (e2eeAvailable()) {
        const pair = await getOrCreateKeyPair(myId);
        if (!cancelled) setKeyVersion(pair?.keyVersion ?? null);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [myId]);

  const onToggleKeepKey = (next) => {
    if (!myId) return;
    setKeepKey(next);
    setKeepKeyOnLogout(myId, next);
    toast.success(
      next
        ? "Encrypted history will stay readable after logout on this browser"
        : "Key will be removed at logout — older chats will appear locked after re-login"
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Privacy and encryption preferences for this account.
        </p>
      </motion.div>

      {/* End-to-end encryption */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-md shadow-indigo-500/25">
            <ShieldCheck className="h-5 w-5 text-white" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              End-to-end encryption
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Chat messages are encrypted on your device with a key that never leaves this
              browser. Contacts without a key can&apos;t decrypt your messages.
            </p>
          </div>
        </div>

        {/* Key status */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
          <KeyRound className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          {loading ? (
            <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking key…
            </span>
          ) : e2eeAvailable() ? (
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Key stored in this browser{" "}
              {keyVersion ? <span className="font-medium text-slate-900 dark:text-white">(v{keyVersion})</span> : null}
            </span>
          ) : (
            <span className="text-sm text-amber-600 dark:text-amber-400">
              Encryption unavailable — open this site over HTTPS.
            </span>
          )}
        </div>

        {/* Keep-on-logout toggle */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Keep encrypted history readable after logout
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              ON: this browser keeps your key, so past chats stay readable when you log back in.
              OFF: the key is removed at logout for maximum privacy — older chats will appear
              locked after re-login (a new key is generated on next login).
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={keepKey}
            disabled={loading || !myId}
            onClick={() => onToggleKeepKey(!keepKey)}
            className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:opacity-50 ${
              keepKey
                ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                : "bg-slate-300 dark:bg-white/15"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                keepKey ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </motion.div>

      <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Changing devices? A new key is generated and old messages remain locked — this is by
        design so ciphertext in the database can never be read without the right key.
      </p>
    </div>
  );
}

export default SettingsPage;
