import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext/SocketContext';
import { Button } from '../../Components/ui/button';
import { Input } from '../../Components/ui/input';
import { Send, SmilePlus } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { ClockFading, Check, CheckCheck, TriangleAlert } from 'lucide-react';
import { toast } from 'react-toastify';

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🔥", "👀", "✅", "💯"];

export default function ChatBox({ roomId, userName, onNewMessage }) {
    const { socket } = useSocket();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState("");
    const [showReactionPicker, setShowReactionPicker] = useState(null);
    const endRef = useRef(null);
    const typingTimeout = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        socket.on("chat:newMessage", (newMessage) => {
            if (onNewMessage && newMessage.senderName !== userName) onNewMessage();
            setMessages((prev) => {
                const exists = prev?.find(m => m.id === newMessage.id);
                if (!exists) {
                    return [...prev, {
                        ...newMessage,
                        status: newMessage.senderName === userName ? "sent" : "delivered",
                        reactions: {},
                    }];
                }
                return prev;
            });
            if (newMessage.senderName !== userName) {
                socket.emit("chat:delivered", { messageId: newMessage.id, roomId });
            }
        });

        socket.on("chat:typing", ({ sender }) => {
            if (sender !== userName) {
                setTypingUser(sender);
                setIsTyping(true);
                clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => {
                    setIsTyping(false);
                    setTypingUser("");
                }, 2500);
            }
        });

        socket.on("chat:delivered", ({ messageId }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: "delivered" } : m));
        });

        socket.on("chat:seen", ({ messageId }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: "seen" } : m));
        });

        socket.on("chat:reaction", ({ messageId, emoji, userId, userName: reactorName }) => {
            setMessages(prev => prev.map(m => {
                if (m.id !== messageId) return m;
                const reactions = { ...m.reactions };
                if (!reactions[emoji]) reactions[emoji] = [];
                // Toggle: if user already reacted with this emoji, remove it
                if (reactions[emoji].includes(userId)) {
                    reactions[emoji] = reactions[emoji].filter(id => id !== userId);
                    if (reactions[emoji].length === 0) delete reactions[emoji];
                } else {
                    reactions[emoji] = [...reactions[emoji], userId];
                }
                return { ...m, reactions };
            }));
        });

        return () => {
            socket.off("chat:newMessage");
            socket.off("chat:typing");
            socket.off("chat:delivered");
            socket.off("chat:seen");
            socket.off("chat:reaction");
        };
    }, [socket, userName, roomId]);

    useEffect(() => {
        if (!socket || !roomId) return;
        socket.emit("interview:joined", { roomId, userId: "chat-user", name: userName, role: "chat" });
    }, [socket, roomId]);

    const handleSend = () => {
        if (!message.trim()) return;
        const msgObj = { text: message, senderName: userName, id: uuidv4(), status: "sending", reactions: {} };
        setMessages((prev) => [...prev, msgObj]);
        setMessage("");
        socket.emit("chat:sendMessage", { roomId, message: msgObj }, (res) => {
            if (!res?.success) {
                toast.error(res?.message);
            } else {
                setMessages(prev => prev.map(m =>
                    m.id === msgObj.id && m.status === "sending" ? { ...m, status: "sent" } : m
                ));
            }
        });

        setTimeout(() => {
            setMessages(prev => prev.map(m =>
                m.id === msgObj.id && m.status === "sending" ? { ...m, status: "failed" } : m
            ));
        }, 5000);
    };

    const handleTyping = () => {
        socket.emit("chat:typing", { roomId, sender: userName });
    };

    const handleReact = (messageId, emoji) => {
        socket.emit("chat:react", { roomId, messageId, emoji });
        setShowReactionPicker(null);
    };

    const markAsSeen = () => {
        if (!Array.isArray(messages)) return;
        messages.forEach(msg => {
            if (msg.status === "delivered" && msg.senderName !== userName) {
                socket.emit("chat:seen", { messageId: msg.id, roomId });
            }
        });
    };

    useEffect(() => {
        if (Array.isArray(messages) && messages.some(m => m.status === "delivered")) {
            markAsSeen();
        }
    }, [messages]);

    const renderStatusIcon = (status) => {
        switch (status) {
            case "sending": return <ClockFading size={10} strokeWidth={3} />;
            case "failed": return <TriangleAlert size={10} strokeWidth={3} className='text-red-400' />;
            case "sent": return <Check size={10} strokeWidth={3} />;
            case "delivered": return <CheckCheck size={10} strokeWidth={3} />;
            case "seen": return <CheckCheck size={10} strokeWidth={3} className="text-blue-500" />;
            default: return null;
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* Message List */}
            <div className="flex-1 overflow-y-auto space-y-1 px-2 py-2">
                <AnimatePresence>
                    {Array.isArray(messages) && messages.map((msg, idx) => {
                        const isMine = msg.senderName === userName;
                        return (
                            <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                className={`relative max-w-[80%] group ${isMine ? 'ml-auto' : ''}`}>
                                {/* Sender name */}
                                {!isMine && <span className="text-[10px] font-semibold text-indigo-500 ml-1 mb-0.5 block">{msg.senderName}</span>}

                                {/* Message bubble */}
                                <div className={`relative rounded-2xl px-3 py-2 text-sm shadow-sm
                                    ${isMine
                                        ? 'rounded-br-md bg-gradient-to-r from-indigo-500 to-violet-500 text-white'
                                        : 'rounded-bl-md bg-slate-100 text-slate-800'
                                    }`}>
                                    <p className="text-[13px] break-words leading-relaxed">{msg.text}</p>

                                    {/* Timestamp + status */}
                                    <div className={`flex items-center justify-end gap-1 mt-0.5 ${isMine ? 'text-white/60' : 'text-slate-400'}`}>
                                        {msg.timestamp && <span className="text-[9px]">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                        {isMine && renderStatusIcon(msg.status)}
                                    </div>

                                    {/* Reaction trigger */}
                                    <button onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)}
                                        className={`absolute -bottom-1 ${isMine ? '-left-6' : '-right-6'} hidden group-hover:flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white shadow-md border border-slate-200 transition hover:scale-110`}>
                                        <SmilePlus className="h-3 w-3 text-slate-400" />
                                    </button>
                                </div>

                                {/* Reactions display */}
                                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                    <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                                            <button key={emoji}
                                                onClick={() => handleReact(msg.id, emoji)}
                                                className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] transition hover:scale-105
                                                    ${users.length > 0 ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
                                                <span>{emoji}</span>
                                                <span className="text-[9px] font-semibold text-slate-600">{users.length}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Reaction picker */}
                                <AnimatePresence>
                                    {showReactionPicker === msg.id && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowReactionPicker(null)} />
                                            <motion.div initial={{ opacity: 0, scale: 0.8, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                                                className={`absolute z-50 -bottom-10 ${isMine ? 'right-0' : 'left-0'} flex items-center gap-0.5 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-xl`}>
                                                {QUICK_REACTIONS.map(emoji => (
                                                    <button key={emoji} onClick={() => handleReact(msg.id, emoji)}
                                                        className="cursor-pointer rounded-full p-1 text-sm transition hover:scale-125 hover:bg-slate-100">
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

            {/* Typing indicator */}
            {isTyping && (
                <div className="px-3 pb-1">
                    <span className="text-[11px] text-slate-400 italic">
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
            <div className="flex gap-2 border-t border-slate-100 p-2">
                <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="text-sm"
                />
                <Button size="icon" onClick={handleSend} disabled={!message.trim()}
                    className="cursor-pointer bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-40">
                    <Send size={16} />
                </Button>
            </div>
        </div>
    );
}
