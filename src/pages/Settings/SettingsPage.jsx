import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BellRing, ShieldCheck, KeyRound, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
import {
  e2eeAvailable,
  getOrCreateKeyPair,
  getKeepKeyOnLogout,
  setKeepKeyOnLogout,
} from "../../lib/crypto.js";

const API_URL = import.meta.env.VITE_API_URL;

const NOTIFICATION_ROWS = [
  { type: "application_status", label: "Application updates", hint: "Shortlist, selection and rejection decisions" },
  { type: "friend_request", label: "Friend requests", hint: "New requests and accepted connections" },
  { type: "announcement", label: "Announcements & deadlines", hint: "Placement drives closing soon" },
];

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:opacity-50 ${
        checked ? "bg-gradient-to-r from-indigo-600 to-teal-500" : "bg-slate-300 dark:bg-white/15"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SettingsPage() {
  const { userInfo, accessToken } = useUserData();
  const myId = userInfo?.user?._id;

  const [keepKey, setKeepKey] = useState(true);
  const [keyVersion, setKeyVersion] = useState(null);
  const [loading, setLoading] = useState(true);

  const [preferences, setPreferences] = useState(null);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsError, setPrefsError] = useState("");
  const [saving, setSaving] = useState("");

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

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    (async () => {
      setPrefsLoading(true);
      setPrefsError("");
      try {
        const res = await fetch(`${API_URL}/api/v1/users/notification-preferences`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const response = await res.json();
        if (!res.ok || !response?.success) throw new Error(response?.message || "Unable to load preferences");
        if (!cancelled) setPreferences(response.data.preferences);
      } catch (err) {
        if (!cancelled) setPrefsError(err?.message || "Unable to load notification preferences");
      } finally {
        if (!cancelled) setPrefsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

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

  const updatePreference = async (channel, type, value) => {
    if (!accessToken || !preferences) return;
    const previous = preferences;
    const next = {
      ...preferences,
      [channel]: { ...preferences[channel], [type]: value },
    };
    // Optimistic UI; revert if the server rejects the change.
    setPreferences(next);
    setSaving(`${channel}:${type}`);
    try {
      const res = await fetch(`${API_URL}/api/v1/users/notification-preferences`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ [channel]: { [type]: value } }),
      });
      const response = await res.json();
      if (!res.ok || !response?.success) throw new Error(response?.message || "Update failed");
      setPreferences(response.data.preferences);
    } catch (err) {
      setPreferences(previous);
      toast.error(err?.message || "Could not save notification preference");
    } finally {
      setSaving("");
    }
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
          Notification and encryption preferences for this account.
        </p>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.03, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 shadow-md shadow-indigo-500/25">
            <BellRing className="h-5 w-5 text-white" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Notifications</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Choose which events reach you in the app and by email. In-app is the default channel;
              email requires your opt-in.
            </p>
          </div>
        </div>

        {prefsLoading ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading preferences…
          </p>
        ) : prefsError ? (
          <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {prefsError}
          </p>
        ) : preferences ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/70 dark:border-white/10">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
              <span>Event</span>
              <span className="w-14 text-center">In-app</span>
              <span className="w-14 text-center">Email</span>
            </div>
            {NOTIFICATION_ROWS.map((row) => (
              <div
                key={row.type}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-slate-100 px-4 py-3 dark:border-white/10"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{row.label}</p>
                  <p className="truncate text-xs text-slate-400 dark:text-slate-500">{row.hint}</p>
                </div>
                <div className="flex w-14 justify-center">
                  <Toggle
                    checked={preferences.inApp?.[row.type] !== false}
                    disabled={saving === `inApp:${row.type}`}
                    onChange={(value) => updatePreference("inApp", row.type, value)}
                    label={`${row.label} in-app notifications`}
                  />
                </div>
                <div className="flex w-14 justify-center">
                  <Toggle
                    checked={preferences.email?.[row.type] === true}
                    disabled={saving === `email:${row.type}`}
                    onChange={(value) => updatePreference("email", row.type, value)}
                    label={`${row.label} email notifications`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </motion.div>

      {/* End-to-end encryption */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 shadow-md shadow-indigo-500/25">
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
          <KeyRound className="h-4 w-4 text-teal-500 dark:text-teal-400" />
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
          <Toggle
            checked={keepKey}
            onChange={onToggleKeepKey}
            disabled={loading || !myId}
            label="Keep encryption key after logout"
          />
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
