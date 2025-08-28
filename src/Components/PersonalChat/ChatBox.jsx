import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
// CONTEXT
import { useSocket } from '../../context/SocketContext/SocketContext';
import { useUserData } from '../../context/AuthContext/AuthContext';
// Shadcn Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
// Icons
import { Send } from "lucide-react";
import { ClockFading, Check, CheckCheck, TriangleAlert } from 'lucide-react';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

export default function ChatBox({ isOpen, onClose, user, currentUser }) {
    const { socket } = useSocket();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const endRef = useRef(null);
    const { accessToken } = useUserData();
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [message]);

    useEffect(() => {
        if (isOpen) {
            axios.get(`${API_URL}/api/v2/messages/conversation/${currentUser}/${user._id}`)
                .then(res => setMessages(res.data))
                .catch(err => console.error(err));
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!message) return;
        const newMsg = { senderId: currentUser.user._id, receiverId: user._id, text: message };
        const res = await axios.post(`${API_URL}/api/v2/messages/send`, newMsg, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            }
        });
        setMessages([...messages, res.data]);
        setMessage("");
    };

    const handleTyping = () => {
        console.log("typing");
    }
    useEffect(() => {
        if (!socket) return;

        socket.on("personalChat:newMessage", (newMessage) => {
            setMessages((prev) => {
                const exists = prev?.find(m => m.message._id === newMessage.message._id);
                if (!exists) { return [...prev, { ...newMessage, status: newMessage.sender === currentUser._id ? "sent" : "delivered" }]; }
                return prev.map(m => m.message._id === newMessage.message._id ? { ...m, status: newMessage.sender === currentUser._id ? "sent" : "delivered" } : m);
            });
            // if (newMessage.senderName !== userName) {
            //     socket.emit("personalChat:delivered", { messageId: newMessage.id, roomId });
            // }
        });
        // socket.on("personalChat:typing", ({ sender }) => {
        //     if (sender !== userName) {
        //         setIsTyping(true);
        //         setTimeout(() => {
        //             setIsTyping(false)
        //         }, 2000);
        //     }
        // });
    }, [socket, currentUser._id])
    //     socket.on("personalChat:delivered", ({ messageId }) => {
    //         setMessages(prev => { return prev.map(m => m.id === messageId ? { ...m, status: "delivered" } : m) });
    //     });
    //     socket.on("personalChat:seen", ({ messageId }) => {
    //         setMessages(prev => { return prev.map(m => m.id === messageId ? { ...m, status: "seen" } : m) });
    //     });
    //     return () => {
    //         socket.off("personalChat:newMessage");
    //         socket.off("personalChat:typing");
    //         socket.off("personalChat:delivered");
    //         socket.off("personalChat:seen");
    //     };
    // }, [socket, userName, roomId]);

    // const handleSend = () => {
    //     if (!message.trim()) return;
    //     const msgObj = { text: message, senderName: userName, id: uuidv4(), status: "sending" };
    //     setMessages((prev) => [...prev, msgObj]);
    //     setMessage("");
    //     socket.emit("personalChat:sendMessage", { roomId, message: msgObj }, (res) => {
    //         if (!res?.success) {
    //             toast.error(res?.message);
    //         } else {
    //             setMessages(prev => {
    //                 if (!Array.isArray(prev)) { return []; }
    //                 return prev.map(m => {
    //                     if (m.id === msgObj.id && m.status === "sending") {
    //                         return { ...m, status: "sent" }
    //                     }
    //                     return m;
    //                 });
    //             })
    //         }
    //     });

    //     setTimeout(() => {
    //         setMessages(prev => {
    //             if (!Array.isArray(prev)) { return []; }
    //             return prev.map(m => {
    //                 if (m.id === msgObj.id && m.status === "sending") {
    //                     return { ...m, status: "failed" }
    //                 }
    //                 return m;
    //             });
    //         });
    //     }, 5000);
    // };

    // const handleTyping = () => {
    //     socket.emit("personalChat:typing", { roomId, sender: userName })
    // };

    // const markAsSeen = () => {
    //     if (!Array.isArray(messages)) { return; }
    //     messages.forEach(msg => {
    //         if (msg.status === "delivered" && msg.senderName !== userName) {
    //             socket.emit("personalChat:seen", { messageId: msg.id, roomId });
    //         }
    //     });
    // }
    // useEffect(() => {
    //     if (Array.isArray(messages) && messages.some(m => m.status === "delivered")) {
    //         markAsSeen();
    //     }
    // }, [messages]);
    return (

        <div className="flex flex-col h-[650px] bg-white rounded-lg shadow-md p-4">
            {/* Message List */}
            {isOpen && <div className="flex-1 overflow-y-auto space-y-2">
                <AnimatePresence>
                    {Array.isArray(messages) && messages.map((msg, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`p-2 rounded max-w-[70%] ${msg?.sender?.name === currentUser?.name ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}
                        >
                            <span className='text-[10px] relative'>{msg?.sender?.name}</span>
                            <div className='relative left-2 pr-4'>
                                <p className="text-sm break-words">{msg?.message?.text}</p>
                            </div>
                            {
                                msg?.sender?.name === currentUser?.name &&
                                <span className='text-sm text-gray-400 capitalize flex justify-end'>
                                    {msg?.message?.status === "sending" && <ClockFading size={10} strokeWidth={3} /> ||
                                        msg?.message?.status === "failed" && <TriangleAlert size={10} strokeWidth={3} className='text-red-500' /> ||
                                        msg?.message?.status === "sent" && <Check size={10} strokeWidth={3} /> ||
                                        msg?.message?.status === "delivered" && <CheckCheck size={10} strokeWidth={3} /> ||
                                        msg?.message?.status === "seen" && <CheckCheck size={10} strokeWidth={3} className="text-blue-800" />
                                    }
                                </span>
                            }
                        </motion.div>
                    ))}
                </AnimatePresence>
                {/* <div ref={endRef}></div> */}
            </div>}
            {
                isTyping && <p className='text-xs text-gray-400 italic mb-2'>Typing...</p>
            }
            {/* Input */}
            {
                isOpen &&
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
            }
        </div>
    );
}