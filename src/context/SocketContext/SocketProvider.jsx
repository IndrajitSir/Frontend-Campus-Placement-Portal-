import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { useUserData } from "../AuthContext/AuthContext";
import { SocketContext } from "./SocketContext";
const API_URL = import.meta.env.VITE_API_URL;

export const SocketProvider = ({ children }) => {
    const { role, userInfo, accessToken } = useUserData();
    const [socket, setSocket] = useState(null);
    const [isSocketReady, setIsSocketReady] = useState(false);

    // userInfo is normally { user, student }, but be tolerant of a raw user object too
    const userId = userInfo?.user?._id || userInfo?._id;

    useEffect(() => {
        if (!role || !userInfo?.user?._id || !accessToken) return;

        const newSocket = io(API_URL, {
            auth: { token: accessToken },
            query: { role: role, userId: userId },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        setSocket(newSocket);
        setIsSocketReady(false);

        newSocket.on("connect", () => setIsSocketReady(true));
        newSocket.on("disconnect", () => setIsSocketReady(false));
        newSocket.on("connect_error", (err) => {
            console.warn("Socket connection error:", err.message);
            setIsSocketReady(false);
        });

        return () => {
            newSocket.off("connect");
            newSocket.off("disconnect");
            newSocket.off("connect_error");
            newSocket.disconnect();
        };
    }, [role, userId, accessToken]);

    return (
        <SocketContext.Provider value={{ socket, isSocketReady, setIsSocketReady }}>
            {children}
        </SocketContext.Provider>
    );
};
