import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, SmilePlus, LoaderCircle, ClockFading, Check, CheckCheck, TriangleAlert } from "lucide-react";
import { toast } from "react-toastify";

// CONTEXT
import { useSocket } from "../../context/SocketContext/SocketContext";
import { useUserData } from "../../context/AuthContext/AuthContext";

// Shadcn Components
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";

const API_URL = import.meta.env.VITE_API_URL;
const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🔥", "👀", "✅", "💯"];

const flatten = (docs) =>
  (Array.isArray(docs) ? docs : [])
    .flatMap((doc) =>
      (Array.isArray(doc?.message) ? doc.message : []).map((m) => ({
        _id: m?._id || `${doc?._id}-${Math.random().toString(36).slice(2)}`,
        text: m?.text,
        sentAt: m?.sentAt,
        senderId: String(doc?.sender?._id || doc?.sender || ""),
        receiverId: String(doc?.receiver?._id || doc?.receiver || ""),
        senderName: doc?.sender?.name || "Unknown",
        status: "delivered",
        reactions: m?.reactions || {},
      }))
    )
    .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function ChatBox({ isOpen, onClose, user, currentUser }) {
  const { socket } = useSocket();
  const { accessToken } = useUserData();

  const myId = typeof currentUser === "object"
    ? (currentUser?.user?._id || currentUser?._id)
    : currentUser;
  const myName = typeof currentUser === "object"
    ? (currentUser?.user?.name || currentUser?.name || "You")
    : "You";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [showReactionPicker, setShowReactionPicker] = useState(null);

  const endRef = useRef(null);
  const typingTimeout = useRef(null);

  const loadConversation = async () => {
    if (!myId || !user?._id) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/v2/messages/conversation/${myId}/${user._id}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setMessages(flatten(res?.data?.data));
    } catch (err) {
      console.error("Failed to load conversation", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && myId && user?._id) {
      setMessages([]);
      loadConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?._id, myId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !myId || !user?._id) return;

    const onNewMessage = (doc) => {
      const incoming = flatten([doc]);

      const conversationMessages = incoming.filter(
        (msg) =>
          String(msg.senderId) === String(user._id) && (msg.receiverId ? String(msg.receiverId) === String(myId) : true)
      );

      if (!conversationMessages.length) return;

      setMessages((prev) => {
        const existing = new Set(prev.map((m) => String(m._id)));
        const fresh = conversationMessages.filter(
          (m) => !existing.has(String(m._id))
        );
        return fresh.length ? [...prev, ...fresh] : prev;
      });
    };

    const onTyping = ({ senderId, senderName }) => {
      if (String(senderId) === String(user._id)) {
        setTypingUser(senderName || user?.name || "Someone");
        setIsTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
          setIsTyping(false);
          setTypingUser("");
        }, 2500);
      }
    };

    const onReaction = ({ messageId, emoji, userId }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id !== messageId) return m;
          const reactions = { ...m.reactions };
          if (!reactions[emoji]) reactions[emoji] = [];
          if (reactions[emoji].includes(userId)) {
            reactions[emoji] = reactions[emoji].filter((id) => id !== userId);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            reactions[emoji] = [...reactions[emoji], userId];
          }
          return { ...m, reactions };
        })
      );
    };

    socket.on("personalChat:newMessage", onNewMessage);
    socket.on("personalChat:typing", onTyping);
    socket.on("personalChat:reaction", onReaction);

    return () => {
      socket.off("personalChat:newMessage", onNewMessage);
      socket.off("personalChat:typing", onTyping);
      socket.off("personalChat:reaction", onReaction);
    };
  }, [socket, user?._id, myId]);

  const handleSend = async () => {
    const text = message.trim();
    if (!text || sending || !myId || !user?._id) return;
    setSending(true);

    const localId = `local-${Date.now()}`;
    const optimistic = {
      _id: localId,
      text,
      sentAt: new Date().toISOString(),
      senderId: String(myId),
      receiverId: String(user._id),
      senderName: myName,
      status: "sending",
      reactions: {},
    };

    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), optimistic]);
    setMessage("");

    try {
      const res = await axios.post(
        `${API_URL}/api/v2/messages/send`,
        { senderId: myId, receiverId: user._id, text },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        }
      );
      
      const realMessageId = res?.data?.data?._id || localId;

      setMessages((prev) =>
        prev.map((m) => (m._id === localId ? { ...m, _id: realMessageId, status: "sent" } : m))
      );
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to send message");
      setMessages((prev) =>
        prev.map((m) => (m._id === localId ? { ...m, status: "failed" } : m))
      );
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (socket && myId && user?._id) {
      socket.emit("personalChat:typing", {
        senderId: myId,
        receiverId: user._id,
        senderName: myName,
      });
    }
  };

  const handleReact = (messageId, emoji) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m._id !== messageId) return m;
        const reactions = { ...(m.reactions || {}) };
        if (!reactions[emoji]) reactions[emoji] = [];
        if (reactions[emoji].includes(myId)) {
          reactions[emoji] = reactions[emoji].filter((id) => id !== myId);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji] = [...reactions[emoji], myId];
        }
        return { ...m, reactions };
      })
    );
    if (socket) {
      socket.emit("personalChat:react", {
        messageId,
        emoji,
        userId: myId,
        receiverId: user._id,
      });
    }
    setShowReactionPicker(null);
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case "sending":
        return <ClockFading size={10} strokeWidth={3} />;
      case "failed":
        return <TriangleAlert size={10} strokeWidth={3} className="text-red-400" />;
      case "sent":
        return <Check size={10} strokeWidth={3} />;
      case "delivered":
        return <CheckCheck size={10} strokeWidth={3} />;
      case "seen":
        return <CheckCheck size={10} strokeWidth={3} className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Message List */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
            <LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" /> Loading messages…
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-3xl">👋</p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Say hello to {String(myId) === String(user?._id) ? "yourself" : user?.name || "your friend"}!
            </p>
            <p className="mt-1 text-xs text-slate-400">Messages appear here in real time.</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => {
            const mine = String(msg.senderId) === String(myId);
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`group relative max-w-[80%] ${mine ? "ml-auto" : ""}`}
              >
                {/* Sender Name */}
                {!mine && (
                  <span className="mb-0.5 ml-1 block text-[10px] font-semibold text-indigo-500">
                    {msg.senderName || user?.name || "Friend"}
                  </span>
                )}

                {/* Message Bubble */}
                <div
                  className={`relative rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                    mine
                      ? "rounded-br-md bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                      : "rounded-bl-md bg-slate-100 text-slate-800"
                  }`}
                >
                  <p className="break-words text-[13px] leading-relaxed">{msg.text}</p>

                  {/* Timestamp & Status */}
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      mine ? "text-indigo-100" : "text-slate-400"
                    }`}
                  >
                    <span>{formatTime(msg.sentAt)}</span>
                    {mine && renderStatusIcon(msg.status)}
                  </div>

                  {/* Quick Reaction Button on Hover */}
                  <button
                    onClick={() =>
                      setShowReactionPicker(showReactionPicker === msg._id ? null : msg._id)
                    }
                    className={`absolute -bottom-1 ${
                      mine ? "-left-6" : "-right-6"
                    } hidden group-hover:flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition hover:scale-110`}
                  >
                    <SmilePlus className="h-3 w-3 text-slate-400" />
                  </button>
                </div>

                {/* Display Reactions */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div
                    className={`mt-1 flex flex-wrap gap-1 ${
                      mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    {Object.entries(msg.reactions).map(([emoji, users]) => (
                      <button
                        key={emoji}
                        onClick={() => handleReact(msg._id, emoji)}
                        className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] transition hover:scale-105 ${
                          users.length > 0
                            ? "border-indigo-200 bg-indigo-50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="text-[9px] font-semibold text-slate-600">
                          {users.length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Reaction Picker Overlay */}
                <AnimatePresence>
                  {showReactionPicker === msg._id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowReactionPicker(null)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`absolute z-50 -bottom-10 ${
                          mine ? "right-0" : "left-0"
                        } flex items-center gap-0.5 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-xl`}
                      >
                        {QUICK_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReact(msg._id, emoji)}
                            className="cursor-pointer rounded-full p-1 text-sm transition hover:scale-125 hover:bg-slate-100"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 pb-1">
          <span className="text-[11px] italic text-slate-400">
            {typingUser || "Someone"} is typing
            <span className="inline-flex w-6 overflow-hidden">
              <span className="animate-[bounce_1.2s_infinite_0s]">.</span>
              <span className="animate-[bounce_1.2s_infinite_0.2s]">.</span>
              <span className="animate-[bounce_1.2s_infinite_0.4s]">.</span>
            </span>
          </span>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message…"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="text-sm"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="cursor-pointer bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-40"
            title="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
