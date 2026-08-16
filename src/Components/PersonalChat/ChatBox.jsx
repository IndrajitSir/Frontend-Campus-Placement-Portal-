import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// CONTEXT
import { useSocket } from '../../context/SocketContext/SocketContext';
import { useUserData } from '../../context/AuthContext/AuthContext';
// Shadcn Components
import { Button } from '../../Components/ui/button';
import { Input } from '../../Components/ui/input';
// Icons
import { Send, LoaderCircle } from "lucide-react";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Flattens the backend's ChatMessage documents (each holds a message array)
// into a simple list of { _id, text, sentAt, senderId, senderName }.
const flatten = (docs) =>
  (Array.isArray(docs) ? docs : [])
    .flatMap((doc) =>
      (Array.isArray(doc?.message) ? doc.message : []).map((m) => ({
        _id: m?._id || `${doc?._id}-${Math.random().toString(36).slice(2)}`,
        text: m?.text,
        sentAt: m?.sentAt,
        senderId: doc?.sender?._id,
        senderName: doc?.sender?.name || "Unknown",
      }))
    );

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function ChatBox({ isOpen, onClose, user, currentUser }) {
  const { socket } = useSocket();
  const { accessToken } = useUserData();
  const myId = currentUser?.user?._id;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const loadConversation = async () => {
    if (!myId || !user?._id) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/v2/messages/conversation/${myId}/${user._id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
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

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (doc) => {
      setMessages((prev) => {
        const incoming = flatten([doc]);
        const existing = new Set((Array.isArray(prev) ? prev : []).map((m) => m._id));
        const fresh = incoming.filter((m) => !existing.has(m._id));
        return fresh.length ? [...(Array.isArray(prev) ? prev : []), ...fresh] : prev;
      });
    };

    socket.on("personalChat:newMessage", onNewMessage);
    return () => socket.off("personalChat:newMessage", onNewMessage);
  }, [socket]);

  const handleSend = async () => {
    const text = message.trim();
    if (!text || sending || !myId || !user?._id) return;
    setSending(true);
    const optimistic = {
      _id: `local-${Date.now()}`,
      text,
      sentAt: new Date().toISOString(),
      senderId: myId,
      senderName: currentUser?.user?.name || "You",
      pending: true,
    };
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), optimistic]);
    setMessage("");
    try {
      await axios.post(
        `${API_URL}/api/v2/messages/send`,
        { senderId: myId, receiverId: user._id, text },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        }
      );
      // Refetch to sync ordering and replace the optimistic bubble with the
      // server-acknowledged message.
      await loadConversation();
    } catch (err) {
      console.error("Failed to send message", err);
      setMessages((prev) =>
        (Array.isArray(prev) ? prev : []).map((m) =>
          m._id === optimistic._id ? { ...m, pending: false, failed: true } : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Message list */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
            <LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" /> Loading messages…
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-3xl">👋</p>
            <p className="mt-2 text-sm font-medium text-slate-500">Say hello to {currentUser?.user?._id === user?._id ? "yourself" : user?.name || "your new friend"}!</p>
            <p className="mt-1 text-xs text-slate-400">Messages appear here in real time.</p>
          </div>
        )}
        {messages.map((msg) => {
          const mine = msg.senderId === myId;
          return (
            <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                  mine
                    ? "rounded-br-md bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                    : "rounded-bl-md bg-slate-100 text-slate-800"
                }`}
              >
                {!mine && (
                  <p className="mb-0.5 text-[10px] font-semibold text-indigo-500">{msg.senderName}</p>
                )}
                <p className="break-words leading-relaxed">{msg.text}</p>
                <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? "text-indigo-100" : "text-slate-400"}`}>
                  <span>{formatTime(msg.sentAt)}</span>
                  {mine && (msg.pending ? <span>sending…</span> : msg.failed ? <span className="text-red-300">failed</span> : <span>✓</span>)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
