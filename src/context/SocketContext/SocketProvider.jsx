import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { useUserData } from "../AuthContext/AuthContext";
import { SocketContext } from "./SocketContext";
const API_URL = import.meta.env.VITE_API_URL;

export const SocketProvider = ({ children }) => {
    const { role } = useUserData();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!role) return;

        const newSocket = io(API_URL, {
            query: { role }
        });

        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, [role]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};