import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext/SocketContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Send } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { ClockFading, Check, CheckCheck, TriangleAlert } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ChatBox({ roomId, userName }) {
    const { socket } = useSocket();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const endRef = useRef(null);
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [message]);

    useEffect(() => {
        if (!socket) return;

        socket.on("chat:newMessage", (newMessage) => {
            setMessages((prev) => {
                const exists = prev?.find(m => m.id === newMessage.id);
                if (!exists) { return [...prev, { ...newMessage, status: newMessage.senderName === userName ? "sent" : "delivered" }]; }
                return prev.map(m => m.id === newMessage.id ? { ...m, status: newMessage.senderName === userName ? "sent" : "delivered" } : m);
            });
            if (newMessage.senderName !== userName) {
                socket.emit("chat:delivered", { messageId: newMessage.id, roomId });
            }
        });
        socket.on("chat:typing", ({ sender }) => {
            if (sender !== userName) {
                setIsTyping(true);
                setTimeout(() => {
                    setIsTyping(false)
                }, 2000);
            }
        });
        socket.on("chat:delivered", ({ messageId }) => {
            setMessages(prev => { return prev.map(m => m.id === messageId ? { ...m, status: "delivered" } : m) });
        });
        socket.on("chat:seen", ({ messageId }) => {
            setMessages(prev => { return prev.map(m => m.id === messageId ? { ...m, status: "seen" } : m) });
        });
        return () => {
            socket.off("chat:newMessage");
            socket.off("chat:typing");
            socket.off("chat:delivered");
            socket.off("chat:seen");
        };
    }, [socket, userName, roomId]);

    const handleSend = () => {
        if (!message.trim()) return;
        const msgObj = { text: message, senderName: userName, id: uuidv4(), status: "sending" };
        setMessages((prev) => [...prev, msgObj]);
        setMessage("");
        socket.emit("chat:sendMessage", { roomId, message: msgObj }, (res) => {
            if (!res?.success) {
                toast.error(res?.message);
            } else {
                setMessages(prev => {
                    if (!Array.isArray(prev)) { return []; }
                    return prev.map(m => {
                        if (m.id === msgObj.id && m.status === "sending") {
                            return { ...m, status: "sent" }
                        }
                        return m;
                    });
                })
            }
        });

        setTimeout(() => {
            setMessages(prev => {
                if (!Array.isArray(prev)) { return []; }
                return prev.map(m => {
                    if (m.id === msgObj.id && m.status === "sending") {
                        return { ...m, status: "failed" }
                    }
                    return m;
                });
            });
        }, 5000);
    };

    const handleTyping = () => {
        socket.emit("chat:typing", { roomId, sender: userName })
    };

    const markAsSeen = () => {
        if (!Array.isArray(messages)) { return; }
        messages.forEach(msg => {
            if (msg.status === "delivered" && msg.senderName !== userName) {
                socket.emit("chat:seen", { messageId: msg.id, roomId });
            }
        });
    }
    useEffect(() => {
        if (Array.isArray(messages) && messages.some(m => m.status === "delivered")) {
            markAsSeen();
        }
    }, [messages]);
    return (
        <div className="flex flex-col h-[400px] bg-white rounded-lg shadow-md p-4">
            {/* Message List */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                <AnimatePresence>
                    {Array.isArray(messages) && messages.map((msg, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`p-2 rounded max-w-[70%] ${msg.senderName === userName ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}
                        >
                            <span className='text-[10px] relative top-[-8px]'>{msg.senderName}</span>
                            <div className='relative left-2 pr-4'>
                                <p className="text-sm break-words">{msg.text}</p>
                            </div>
                            {
                                msg.senderName === userName &&
                                <span className='text-sm text-gray-400 capitalize flex justify-end'>
                                    {msg.status === "sending" && <ClockFading size={10} strokeWidth={3} /> ||
                                        msg.status === "failed" && <TriangleAlert size={10} strokeWidth={3} className='text-red-500' /> ||
                                        msg.status === "sent" && <Check size={10} strokeWidth={3} /> ||
                                        msg.status === "delivered" && <CheckCheck size={10} strokeWidth={3} /> ||
                                        msg.status === "seen" && <CheckCheck size={10} strokeWidth={3} className="text-blue-800" />
                                    }
                                </span>
                            }
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={endRef}></div>
            </div>
            {
                isTyping && <p className='text-xs text-gray-400 italic mb-2'>Typing...</p>
            }
            {/* Input */}
            <div className="flex gap-2 mb-4">
                <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button variant="outline" size="icon" onClick={handleSend} className="cursor-pointer">
                    <Send size={18} />
                </Button>
            </div>
        </div>
    );
}