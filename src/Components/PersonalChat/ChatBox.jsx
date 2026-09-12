import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, LoaderCircle, ClockFading, Check, CheckCheck, TriangleAlert, Paperclip, Mic } from "lucide-react";
import { toast } from "react-toastify";

// CONTEXT
import { useSocket } from "../../context/SocketContext/SocketContext";
import { useUserData } from "../../context/AuthContext/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const flatten = (docs) =>
  (Array.isArray(docs) ? docs : [])
    .flatMap((doc) =>
      (Array.isArray(doc?.message) ? doc.message : []).map((m) => ({
        _id: m?._id || `${doc?._id}-${Math.random().toString(36).slice(2)}`,
        text: m?.text,
        sentAt: m?.sentAt,
        senderId: String(m?.senderId || doc?.sender?._id || doc?.sender || ""),
        receiverId: String(m?.senderId ? (String(m.senderId) === String(doc?.sender?._id || doc?.sender) ? (doc?.receiver?._id || doc?.receiver) : (doc?.sender?._id || doc?.sender)) : (doc?.receiver?._id || doc?.receiver || "")),
        senderName: m?.senderId && String(m.senderId) === String(doc?.receiver?._id || doc?.receiver) ? (doc?.receiver?.name || "Unknown") : (doc?.sender?.name || "Unknown"),
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

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
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
        (msg) => String(msg.senderId) === String(user._id) && (msg.receiverId ? String(msg.receiverId) === String(myId) : true)
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
    if (!textOverride) setMessage("");

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
    <div className="flex h-full min-h-0 flex-col bg-[#F9FAFB]">
      {/* Date Separator */}
      <div className="flex items-center justify-center pt-4 pb-2 relative">
         <div className="absolute w-full h-[1px] bg-slate-200"></div>
         <span className="relative z-10 bg-white border border-slate-200 text-slate-400 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
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
                       <div className="h-8 w-8 rounded-full bg-[#6B46C1] flex items-center justify-center text-xs font-semibold text-white shadow-sm mt-5">
                          {getInitials(msg.senderName || user?.name)}
                       </div>
                    )}
                  </div>
                )}
                
                <div className={`flex flex-col ${mine ? "items-end" : "items-start"} max-w-[70%]`}>
                  {!mine && showAvatar && (
                    <span className="ml-1 mb-1 text-[11px] font-semibold text-[#6B46C1]">
                      {msg.senderName || user?.name || "Friend"}
                    </span>
                  )}

                  <div
                    className={`relative rounded-2xl px-4 py-2.5 text-[13px] shadow-sm ${
                      mine
                        ? "rounded-br-sm bg-[#6B46C1] text-white"
                        : "rounded-bl-sm bg-white border border-slate-100 text-slate-700"
                    }`}
                  >
                    <p className="break-words leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="absolute -bottom-2 right-2 bg-white rounded-full border border-slate-200 px-1 py-0.5 text-[10px] shadow-sm flex items-center gap-1 z-10">
                         <span>{Object.keys(msg.reactions)[0]}</span>
                         <span className="text-slate-600 font-medium">1</span>
                      </div>
                    )}
                  </div>

                  <div
                    className={`mt-1 flex items-center gap-1 text-[10px] ${mine ? "mr-1 text-slate-400" : "ml-1 text-slate-400"}`}
                  >
                    <span>{formatTime(msg.sentAt)}</span>
                    {mine && (
                       <span className="ml-0.5 text-[#6B46C1]">{renderStatusIcon(msg.status)}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isTyping && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400 italic pl-11">
             {user?.name || "Friend"} is typing...
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-6 py-2 flex flex-wrap gap-2">
         {quickReplies.map((reply, i) => (
            <button key={i} onClick={() => handleSend(reply)} className="bg-slate-100 hover:bg-slate-200 transition text-slate-600 text-[11px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer border border-slate-200">
               {reply}
            </button>
         ))}
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-1">
        <div className="flex items-center bg-white rounded-full border border-slate-200 pr-1.5 pl-3 py-1.5 shadow-sm">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition">
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
            className="flex-1 bg-transparent px-2 text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
          />
          
          <button className="p-2 text-slate-400 hover:text-slate-600 transition">
             <Smile className="h-4 w-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition mr-1">
             <Mic className="h-4 w-4" />
          </button>

          <button
            onClick={() => handleSend()}
            disabled={sending || !message.trim()}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#6B46C1] text-white shadow-md transition hover:bg-[#553C9A] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
