import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, X } from "lucide-react";
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext/SocketContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 12;

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : new Date(iso).toLocaleDateString();
};

const typeAccent = {
  application_status: "bg-indigo-500",
  friend_request: "bg-fuchsia-500",
  announcement: "bg-amber-500",
};

const NotificationBell = () => {
  const { accessToken } = useUserData();
  const socketCtx = useSocket();
  const socket = socketCtx?.socket;
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }),
    [accessToken]
  );

  const fetchNotifications = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/api/v2/notifications?page=1&limit=${PAGE_SIZE}`, {
        method: "GET",
        credentials: "include",
        headers: authHeaders(),
      });
      const response = await res.json();
      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err?.message);
    }
  }, [accessToken, authHeaders]);

  // Initial load + fallback poll every 60s.
  useEffect(() => {
    if (!accessToken) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [accessToken, fetchNotifications]);

  // Real-time pushes (server emits to the user's room).
  useEffect(() => {
    if (!socket) return;
    const handler = (doc) => {
      if (!doc?._id) return;
      setNotifications((prev) =>
        prev.some((n) => n._id === doc._id) ? prev : [doc, ...prev].slice(0, PAGE_SIZE)
      );
      setUnreadCount((c) => c + 1);
    };
    socket.on("notification:new", handler);
    return () => socket.off("notification:new", handler);
  }, [socket]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markAllRead = async () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch(`${API_URL}/api/v2/notifications/mark-read`, {
        method: "PUT",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify({ all: true }),
      });
    } catch (err) {
      console.error("Mark-all-read failed:", err?.message);
    }
  };

  const openNotification = async (n) => {
    setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    setUnreadCount((c) => Math.max(0, c - (n.read ? 0 : 1)));
    setOpen(false);
    if (!n.read) {
      try {
        await fetch(`${API_URL}/api/v2/notifications/mark-read`, {
          method: "PUT",
          credentials: "include",
          headers: authHeaders(),
          body: JSON.stringify({ ids: [n._id] }),
        });
      } catch (err) {
        console.error("Mark-read failed:", err?.message);
      }
    }
    if (n.link) navigate(n.link);
  };

  if (!accessToken) return null;

  return (
    <div className="relative" ref={panelRef}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Bell className="h-[18px] w-[18px]" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-1 text-[10px] font-bold text-white shadow-md shadow-rose-500/40"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-[#10162b] dark:shadow-black/50"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/10">
              <span className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                    {unreadCount} new
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={markAllRead}
                  title="Mark all as read"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-white/10 dark:hover:text-indigo-300"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? null : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                  <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-400">You're all caught up</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => openNotification(n)}
                    className="flex w-full cursor-pointer items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        n.read ? "bg-slate-200 dark:bg-slate-700" : typeAccent[n.type] || "bg-indigo-500"
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {n.title}
                      </span>
                      {n.body && (
                        <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          {n.body}
                        </span>
                      )}
                      <span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
