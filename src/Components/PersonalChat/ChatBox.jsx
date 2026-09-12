import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, LoaderCircle, ClockFading, Check, CheckCheck, TriangleAlert, Paperclip, Mic } from "lucide-react";
import { toast } from "react-toastify";

// CONTEXT
import { useSocket } from "../../context/SocketContext/SocketContext";
import { useUserData } from "../../context/AuthContext/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Flatten the array of ChatMessage documents (each has a sender, receiver,
 * and a nested message[] array) into a flat list of individual messages.
 *
 * Each subdocument now has a `senderId` field which tells us who sent it.
 * For legacy messages that pre-date the senderId field, we fall back to
 * the thread-level `sender` as before.
 */
const flatten = (docs) =>
  (Array.isArray(docs) ? docs : [])
    .flatMap((doc) => {
      const threadSenderId = String(doc?.sender?._id || doc?.sender || "");
      const threadReceiverId = String(doc?.receiver?._id || doc?.receiver || "");

      return (Array.isArray(doc?.message) ? doc.message : []).map((m) => {
        // Per-message senderId (added when we updated the schema).
        // Fall back to thread sender for legacy messages.
        const msgSenderId = m?.senderId
          ? String(m.senderId)
          : threadSenderId;

        // The receiver of this individual message is whoever is NOT the sender
        const msgReceiverId =
          msgSenderId === threadSenderId ? threadReceiverId : threadSenderId;

        return {
          _id: m?._id || `${doc?._id}-${Math.random().toString(36).slice(2)}`,
          text: m?.text,
          sentAt: m?.sentAt,
          senderId: msgSenderId,
          receiverId: msgReceiverId,
          status: "delivered",
          reactions: m?.reactions || {},
        };
      });
    })
    .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
};

export default function ChatBox({ isOpen, onClose, user, currentUser }) {
  const { socket } = useSocket();
  const { accessToken } = useUserData();

  // Resolve my own ID — currentUser is { user: { _id, name, ... }, student: {...} }
  const myId = String(
    currentUser?.user?._id || currentUser?._id || ""
  );
  const myName =
    currentUser?.user?.name || currentUser?.name || "You";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const endRef = useRef(null);
  const typingTimeout = useRef(null);
  // Track IDs of messages we optimistically added so socket echoes are ignored
  const pendingLocalIds = useRef(new Set());

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
      pendingLocalIds.current.clear();
      loadConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?._id, myId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket event listeners — only add INCOMING messages from the other user
  useEffect(() => {
    if (!socket || !myId || !user?._id) return;

    const onNewMessage = (doc) => {
      const threadSenderId = String(doc?.sender?._id || doc?.sender || "");
      const threadReceiverId = String(doc?.receiver?._id || doc?.receiver || "");

      // Only process this conversation
      const isThisConversation =
        (threadSenderId === myId && threadReceiverId === String(user._id)) ||
        (threadSenderId === String(user._id) && threadReceiverId === myId);

      if (!isThisConversation) return;

      const incoming = flatten([doc]);

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => String(m._id)));

        const newMsgs = incoming.filter((m) => {
          // Skip if already exists by real _id
          if (existingIds.has(String(m._id))) return false;
          // Skip if this is one of our optimistic messages (we sent it, server echoed)
          // We match by senderId + text + approximate time
          return true;
        });

        if (!newMsgs.length) return prev;

        // Replace any optimistic "sending" messages from US with the confirmed ones
        // The socket echo for our own sent message — replace optimistic entry
        const myNewMsgs = newMsgs.filter((m) => String(m.senderId) === myId);
        const theirNewMsgs = newMsgs.filter((m) => String(m.senderId) !== myId);

        let updated = [...prev];

        // For our echoed messages: replace the last "sending" optimistic entry
        for (const msg of myNewMsgs) {
          const optimisticIdx = updated.findIndex(
            (m) => m.status === "sending" && m.text === msg.text
          );
          if (optimisticIdx !== -1) {
            // Replace optimistic with confirmed
            updated[optimisticIdx] = { ...msg, status: "sent" };
          }
          // If no optimistic found (shouldn't happen), just deduplicate
        }

        // For their messages: append if not already present
        for (const msg of theirNewMsgs) {
          if (!updated.find((m) => String(m._id) === String(msg._id))) {
            updated = [...updated, msg];
          }
        }

        return updated;
      });
    };

    const onTyping = ({ senderId }) => {
      if (String(senderId) === String(user._id)) {
        setIsTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
          setIsTyping(false);
        }, 2500);
      }
    };

    socket.on("personalChat:newMessage", onNewMessage);
    socket.on("personalChat:typing", onTyping);

    return () => {
      socket.off("personalChat:newMessage", onNewMessage);
      socket.off("personalChat:typing", onTyping);
    };
  }, [socket, user?._id, myId]);

  const handleSend = async (textOverride) => {
    const text = (textOverride || message).trim();
    if (!text || sending || !myId || !user?._id) return;
    setSending(true);

    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimistic = {
      _id: localId,
      text,
      sentAt: new Date().toISOString(),
      senderId: myId,
      receiverId: String(user._id),
      senderName: myName,
      status: "sending",
      reactions: {},
    };

    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), optimistic]);
    if (!textOverride) setMessage("");

    try {
      const res = await axios.post(
        `${API_URL}/api/v2/messages/send`,
        // senderId is NOT sent — the backend reads it from the JWT via verifyUser
        { receiverId: user._id, text },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        }
      );

      const realMessageId = res?.data?.data?.messageId || localId;

      // Update the optimistic message: give it the real _id and mark as "sent"
      setMessages((prev) =>
        prev.map((m) =>
          m._id === localId ? { ...m, _id: realMessageId, status: "sent" } : m
        )
      );
    } catch (err) {
      console.error("Failed to send message", err?.response?.data || err);
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to send message";
      toast.error(errMsg);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === localId ? { ...m, status: "failed" } : m
        )
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

  const renderStatusIcon = (status) => {
    switch (status) {
      case "sending": return <ClockFading size={10} strokeWidth={3} />;
      case "failed": return <TriangleAlert size={10} strokeWidth={3} className="text-red-400" />;
      case "sent": return <Check size={10} strokeWidth={3} />;
      case "delivered": return <CheckCheck size={10} strokeWidth={3} />;
      case "seen": return <CheckCheck size={10} strokeWidth={3} className="text-blue-500" />;
      default: return null;
    }
  };

  const quickReplies = ["👍 Thanks!", "Can we hop on a quick call?", "Share system logs"];

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F9FAFB] dark:bg-[#0b1020]">
      {/* Date Separator */}
      <div className="flex items-center justify-center pt-4 pb-2 relative">
         <div className="absolute w-full h-[1px] bg-slate-200 dark:bg-white/10"></div>
         <span className="relative z-10 bg-white dark:bg-[#0b1020] border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
      </div>

      {/* Message List */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-2">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
            <LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" /> Loading messages…
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, index) => {
            const mine = String(msg.senderId) === String(myId);
            const showAvatar = !mine && (index === 0 || String(messages[index - 1].senderId) !== String(msg.senderId));

            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}
              >
                {!mine && (
                  <div className="w-8 shrink-0 mr-3">
                    {showAvatar && (
                       <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-semibold text-white shadow-sm shadow-indigo-500/25 mt-5">
                          {getInitials(user?.name)}
                       </div>
                    )}
                  </div>
                )}

                <div className={`flex flex-col ${mine ? "items-end" : "items-start"} max-w-[70%]`}>
                  {!mine && showAvatar && (
                    <span className="ml-1 mb-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {user?.name || "Friend"}
                    </span>
                  )}

                  <div
                    className={`relative rounded-2xl px-4 py-2.5 text-[13px] shadow-sm ${
                      mine
                        ? "rounded-br-sm bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-indigo-500/25"
                        : "rounded-bl-sm bg-white dark:bg-white/[0.06] border border-slate-100 dark:border-white/10 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <p className="break-words leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="absolute -bottom-2 right-2 bg-white dark:bg-[#1a2235] rounded-full border border-slate-200 dark:border-white/10 px-1 py-0.5 text-[10px] shadow-sm flex items-center gap-1 z-10">
                         <span>{Object.keys(msg.reactions)[0]}</span>
                         <span className="text-slate-600 dark:text-slate-300 font-medium">1</span>
                      </div>
                    )}
                  </div>

                  <div
                    className={`mt-1 flex items-center gap-1 text-[10px] ${mine ? "mr-1 text-slate-400 dark:text-slate-500" : "ml-1 text-slate-400 dark:text-slate-500"}`}
                  >
                    <span>{formatTime(msg.sentAt)}</span>
                    {mine && (
                       <span className="ml-0.5 text-indigo-500 dark:text-indigo-400">{renderStatusIcon(msg.status)}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 pl-11 text-[11px] text-slate-400 dark:text-slate-500"
          >
            <span className="flex items-center gap-1 rounded-full bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 px-2.5 py-1.5 shadow-sm">
              <span className="h-1.5 w-1.5 animate-[bounce_1.2s_infinite_0s] rounded-full bg-indigo-500" />
              <span className="h-1.5 w-1.5 animate-[bounce_1.2s_infinite_0.2s] rounded-full bg-violet-500" />
              <span className="h-1.5 w-1.5 animate-[bounce_1.2s_infinite_0.4s] rounded-full bg-fuchsia-500" />
            </span>
            {user?.name || "Friend"} is typing…
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-6 py-2 flex flex-wrap gap-2">
         {quickReplies.map((reply, i) => (
            <button key={i} onClick={() => handleSend(reply)} className="bg-white dark:bg-white/[0.06] hover:bg-indigo-50 dark:hover:bg-white/10 transition text-slate-600 dark:text-slate-300 text-[11px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer border border-slate-200 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/30">
               {reply}
            </button>
         ))}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 px-6 pb-6 pt-1 bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB] dark:from-[#0b1020] dark:via-[#0b1020] to-transparent">
        <div className="flex items-center bg-white dark:bg-white/[0.06] rounded-full border border-slate-200 dark:border-white/10 pr-1.5 pl-3 py-1.5 shadow-md shadow-slate-200/60 dark:shadow-black/30 focus-within:border-indigo-300 dark:focus-within:border-indigo-500/40 focus-within:ring-2 focus-within:ring-indigo-500/15 transition">
          <button className="p-2 text-slate-400 hover:text-indigo-500 transition">
             <Paperclip className="h-4 w-4" />
          </button>

          <input
            type="text"
            placeholder="Type a message or press '/' for commands..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1 bg-transparent px-2 text-[13px] text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />

          <button className="p-2 text-slate-400 hover:text-indigo-500 transition">
             <Smile className="h-4 w-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-indigo-500 transition mr-1">
             <Mic className="h-4 w-4" />
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSend()}
            disabled={sending || !message.trim()}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110 disabled:opacity-50"
          >
            {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
