import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, LoaderCircle } from "lucide-react";
import { useUserData } from "../../context/AuthContext/AuthContext";
import { useSocket } from "../../context/SocketContext/SocketContext";
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
  const myId = currentUser?.user?._id;

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!myId || !accessToken) return;
    try {
      const res = await axios.get(`${API_URL}/api/v2/messages/conversations/${myId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setConversations(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  }, [myId, accessToken]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Listen for real-time messages to update the conversation list
  useEffect(() => {
    if (!socket || !myId) return;

    const onNewMessage = (doc) => {
      const senderId = doc?.sender?._id;
      const receiverId = doc?.receiver?._id;
      if (!senderId || !receiverId) return;

      const otherUserId = senderId === myId ? receiverId : senderId;
      const otherUser = senderId === myId ? doc?.receiver : doc?.sender;
      const lastMsg = doc?.message?.[doc.message.length - 1];

      setConversations((prev) => {
        const existing = prev.find((c) => c.user?._id === otherUserId);
        const updatedEntry = {
          user: {
            _id: otherUserId,
            name: otherUser?.name || "Unknown",
            email: otherUser?.email || "",
          },
          lastMessage: lastMsg?.text || "",
          lastMessageAt: lastMsg?.sentAt || new Date().toISOString(),
          unreadCount: senderId !== myId
            ? (existing?.unreadCount || 0) + 1
            : existing?.unreadCount || 0,
        };

        // Remove the existing entry if present, and prepend the updated one
        const filtered = prev.filter((c) => c.user?._id !== otherUserId);
        return [updatedEntry, ...filtered];
      });
    };

    socket.on("personalChat:newMessage", onNewMessage);
    return () => socket.off("personalChat:newMessage", onNewMessage);
  }, [socket, myId]);

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
    <aside className="flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
          <MessageSquare className="h-4 w-4 text-indigo-600" /> Messages
        </h2>
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
          {conversations.length}
        </span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
            <LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" /> Loading…
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
              <MessageSquare className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium text-slate-400">No messages yet</p>
            <p className="px-4 text-xs text-slate-300">
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
                    : "text-slate-700 hover:bg-indigo-50"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={avatarOf(conv.user)}
                    alt={nameOf(conv.user)}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold">{nameOf(conv.user)}</p>
                    <span
                      className={`ml-1 shrink-0 text-[10px] ${
                        isActive ? "text-indigo-100" : "text-slate-400"
                      }`}
                    >
                      {formatTimestamp(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p
                    className={`truncate text-xs ${
                      isActive ? "text-indigo-100" : "text-slate-400"
                    } ${conv.unreadCount > 0 && !isActive ? "font-medium text-slate-600" : ""}`}
                  >
                    {conv.lastMessage || "Start chatting…"}
                  </p>
                </div>
              </motion.button>
            );
          })}
      </div>
    </aside>
  );
}
