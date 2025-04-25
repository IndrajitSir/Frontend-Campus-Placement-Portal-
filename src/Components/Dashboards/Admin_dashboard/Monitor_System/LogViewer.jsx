import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../../../context/SocketContext/SocketContext.jsx";

const LogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState("all");
    const [autoScroll, setAutoScroll] = useState(false);
    const logEndRef = useRef(null);
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;
        socket.on("connect", () => {
            console.log("Socket connected: ", socket.id);
        });
        return () => { socket.off("connect"); }
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        socket.emit("log:requestView");
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        socket.on("log:view", (newLogs) => {
            setLogs((prev) => [...prev, ...newLogs]);
        });
        socket.on("log:update", (newLogs) => {
            setLogs((prev) => [...prev, ...newLogs]);
        });

        return () => {
            socket.off("log:view");
            socket.off("log:update");
        }
    }, [socket]);

    useEffect(() => {
        if (autoScroll && logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs, autoScroll]);

    const filteredLogs = logs.filter((line) => {
        if (filter === "all") return true;
        if (filter === "info") return line.toLowerCase().includes("info");
        if (filter === "error") return line.toLowerCase().includes("error");
        return true;
    });

    return (
        <div className="text-black-400 p-4 rounded overflow-y-auto h-80 font-mono text-xl shadow-lg relative">
            <div className="absolute top-2 right-2 flex gap-2">
                <select
                    className="text-black text-xs rounded p-1 cursor-pointer hover:bg-gray-200"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="info">Info</option>
                    <option value="error">Error</option>
                </select>
                <button onClick={() => setLogs([])} className="rounded border cursor-pointer hover:bg-gray-200">Clear Logs</button>
                <button
                    className={`cursor-pointer text-xs px-2 py-1 rounded ${autoScroll ? "bg-green-600 hover:bg-green-500" : "bg-gray-400 hover:bg-gray-300"}`}
                    onClick={() => setAutoScroll(!autoScroll)}
                >
                    Auto-Scroll: {autoScroll ? "On" : "Off"}
                </button>
            </div>

            <div className="mt-8 space-y-2">
                {filteredLogs.map((line, index) => {
                    try {
                        const parsed = JSON.parse(line);
                        const timestamp = new Date(parsed.timestamp).toLocaleString();
                        const message = parsed.message || parsed.req?.route || "No message";
                        const method = parsed.req?.method || "";
                        const route = parsed.req?.route || "";

                        return (
                            <div
                                key={index}
                                className="bg-black/90 text-white px-4 py-2 rounded shadow border-l-4 border-green-500"
                            >
                                <p className="text-xs text-gray-400">{timestamp}</p>
                                <p className="font-semibold">{message}</p>
                                {route && (
                                    <p className="text-xs text-gray-300 mt-1">
                                        <span className="font-bold">{method}</span> {route}
                                    </p>
                                )}
                            </div>
                        );
                    } catch (err) {
                        console.error("Error in logviewer: ", err)
                        return (
                            <div key={index} className="text-red-400 font-mono">
                                {line}
                            </div>
                        );
                    }
                })}
                <div ref={logEndRef}></div>
            </div>
        </div>
    );
};

export default LogViewer;
