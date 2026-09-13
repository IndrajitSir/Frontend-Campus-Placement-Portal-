import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, LoaderCircle, Lock } from "lucide-react";
import { useUserData } from "../../context/AuthContext/AuthContext";
import { useSocket } from "../../context/SocketContext/SocketContext";
import { getOrCreateKeyPair, fetchPublicKey, decryptFrom } from "../../lib/crypto.js";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const DEFAULT_AVATAR = "/defaultUserAvatar.jpeg";

const avatarOf = (u) => u?.avatar || u?.student_id?.avatar || DEFAULT_AVATAR;
const nameOf = (u) => u?.name || u?.student_id?.name || "Unknown";

const formatTimestamp = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

export default function MessagesContainer({ activeConversationId, onSelectConversation }) {
  const { userInfo: currentUser, accessToken } = useUserData();
  const { socket } = useSocket();
  const myId = typeof currentUser === "object"
    ? (currentUser?.user?._id || currentUser?._id)
    : currentUser;

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  // Decrypted previews keyed by conversation user id (null = could not decrypt).
  const [previews, setPreviews] = useState({});

  // Best-effort decrypt of a conversation's E2EE preview ciphertext.
  const decryptPreview = useCallback(
    async (conv) => {
      if (!conv?.lastMessageCipher || !accessToken) return null;
      const pair = await getOrCreateKeyPair(myId);
      if (!pair) return null;
      try {
        // My own last message → sender copy, decrypt with MY public key.
        // Incoming message → receiver copy, decrypt with the partner's key.
        const senderPublicJwk = conv.lastMessageMine ? pair.publicJwk : null;
        const publicJwk =
          senderPublicJwk || (await fetchPublicKey(conv.user?._id, accessToken));
        if (!publicJwk) return null;
        return await decryptFrom(publicJwk, pair.privateJwk, conv.lastMessageCipher);
      } catch (err) {
        console.error("Preview decrypt failed:", err?.message);
        return null;
      }
    },
    [myId, accessToken]
  );

  const fetchConversations = useCallback(async () => {
    if (!myId || !accessToken) return;
    try {
      const res = await axios.get(`${API_URL}/api/v2/messages/conversations/${myId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const list = res?.data?.data || [];
      setConversations(list);

      // Decrypt previews for E2EE entries (non-blocking).
      const encryptedOnes = list.filter((c) => c.lastMessageEncrypted && c.lastMessageCipher);
      if (encryptedOnes.length) {
        const results = await Promise.all(
          encryptedOnes.map(async (c) => [c.user?._id, await decryptPreview(c)])
        );
        setPreviews((prev) => ({ ...prev, ...Object.fromEntries(results) }));
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  }, [myId, accessToken, decryptPreview]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Listen for real-time messages to update the conversation list
  useEffect(() => {
    if (!socket || !myId) return;

    const onNewMessage = (doc) => {
      const senderId = doc?.sender?._id || doc?.sender;
      const receiverId = doc?.receiver?._id || doc?.receiver;
      if (!senderId || !receiverId) return;

      const isSender = String(senderId) === String(myId);
      const otherUserId = isSender ? String(receiverId) : String(senderId);
      const otherUser = isSender ? doc?.receiver : doc?.sender;
      const lastMsg = doc?.message?.[doc.message.length - 1];

      const updatedEntry = {
        user: {
          _id: otherUserId,
          name: typeof otherUser === "object" ? (otherUser?.name || "Unknown") : "Unknown",
          email: typeof otherUser === "object" ? (otherUser?.email || "") : "",
        },
        lastMessage: lastMsg?.text || "",
        lastMessageEncrypted: Boolean(lastMsg?.encrypted),
        lastMessageMine: isSender,
        // Viewer-aware copy: my own message → toSender, incoming → toReceiver.
        lastMessageCipher: lastMsg?.encrypted
          ? (isSender ? lastMsg?.ciphertexts?.toSender : lastMsg?.ciphertexts?.toReceiver) || null
          : null,
        lastMessageAt: lastMsg?.sentAt || new Date().toISOString(),
      };

      // Remove the existing entry if present, and prepend the updated one.
      setConversations((prev) => {
        const existing = prev.find((c) => String(c.user?._id) === otherUserId);
        const unreadCount = !isSender
          ? (existing?.unreadCount || 0) + 1
          : existing?.unreadCount || 0;
        const filtered = prev.filter((c) => String(c.user?._id) !== otherUserId);
        return [{ ...updatedEntry, unreadCount }, ...filtered];
      });

      // Decrypt the preview of the moved conversation (best-effort).
      if (updatedEntry.lastMessageCipher) {
        decryptPreview(updatedEntry).then((plain) => {
          setPreviews((prev) => ({ ...prev, [otherUserId]: plain }));
        });
      }
    };

    socket.on("personalChat:newMessage", onNewMessage);
    return () => socket.off("personalChat:newMessage", onNewMessage);
  }, [socket, myId, decryptPreview]);

  // When a conversation is opened, reset its unread count
  useEffect(() => {
    if (!activeConversationId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.user?._id === activeConversationId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, [activeConversationId]);

  return (
    <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
          <LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" /> Loading…
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/[0.04] text-slate-300 dark:text-slate-600 ring-1 ring-slate-100 dark:ring-white/10">
            <MessageSquare className="h-6 w-6" />
          </span>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No messages yet</p>
          <p className="px-4 text-xs text-slate-300 dark:text-slate-600">
            Start a conversation from the people list.
          </p>
        </div>
      )}

      {!loading &&
        conversations.map((conv) => {
          const isActive = activeConversationId === conv.user?._id;
          return (
            <motion.button
              key={conv.user?._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelectConversation(conv.user)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-2.5 text-left transition-all ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-white/[0.06]"
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={avatarOf(conv.user)}
                  alt={nameOf(conv.user)}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-500/25"
                />
                {conv.unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#111827]">
                    {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className={`truncate text-sm ${conv.unreadCount > 0 && !isActive ? "font-bold" : "font-semibold"}`}>{nameOf(conv.user)}</p>
                  <span
                    className={`ml-1 shrink-0 text-[10px] ${
                      isActive ? "text-indigo-100" : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {formatTimestamp(conv.lastMessageAt)}
                  </span>
                </div>
                <p
                  className={`truncate text-xs ${
                    isActive ? "text-indigo-100" : "text-slate-400 dark:text-slate-500"
                  } ${conv.unreadCount > 0 && !isActive ? "font-semibold text-slate-700 dark:text-slate-200" : ""}`}
                >
                  {conv.lastMessageEncrypted ? (
                    previews[conv.user?._id] ?? (
                      <span className="inline-flex items-center gap-1">
                        <Lock className="h-3 w-3" /> New message
                      </span>
                    )
                  ) : (
                    conv.lastMessage || "Start chatting…"
                  )}
                </p>
              </div>
            </motion.button>
          );
        })}
    </div>
  );
}
