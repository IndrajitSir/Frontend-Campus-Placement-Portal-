import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { useUserData } from "../AuthContext/AuthContext";
import { SocketContext } from "./SocketContext";
const API_URL = import.meta.env.VITE_API_URL;

export const SocketProvider = ({ children }) => {
    const { role, userInfo } = useUserData();
    const [socket, setSocket] = useState(null);
    const [isSocketReady, setIsSocketReady] = useState(false);

    // userInfo is normally { user, student }, but be tolerant of a raw user object too
    const userId = userInfo?.user?._id || userInfo?._id;

    useEffect(() => {
        // Only connect once we have both a role and a user id
        if (!role || !userId) return;

        const newSocket = io(API_URL, {
            query: { role: role, userId: userId },
        });

        setSocket(newSocket);
        setIsSocketReady(false);

        newSocket.on("connect", () => setIsSocketReady(true));
        newSocket.on("disconnect", () => setIsSocketReady(false));

        return () => {
            newSocket.off("connect");
            newSocket.off("disconnect");
            newSocket.disconnect();
        };
    }, [role, userId]);

    return (
        <SocketContext.Provider value={{ socket, isSocketReady, setIsSocketReady }}>
            {children}
        </SocketContext.Provider>
    );
};
