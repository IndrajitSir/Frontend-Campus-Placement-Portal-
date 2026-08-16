import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../../../context/SocketContext/SocketContext.jsx";
import { Eraser, ArrowDownToLine } from "lucide-react";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "info", label: "Info" },
  { value: "error", label: "Error" },
];

const LogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState("all");
    const [autoScroll, setAutoScroll] = useState(false);
    const logEndRef = useRef(null);
    const { socket, setIsSocketReady } = useSocket();

    useEffect(() => {
        if (!socket) return;
        socket.on("connect", () => {
            setIsSocketReady(true);
        });
        socket.on("disconnect", () => {
            setIsSocketReady(false);
        });
        return () => {
            socket.off("connect");
            socket.off("disconnect");
        }
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

    const levelFor = (text) => {
        const t = text.toLowerCase();
        if (t.includes("error")) return "error";
        if (t.includes("warn")) return "warn";
        return "info";
    };

    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1020]">
            {/* Terminal bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/5 px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <span className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    </span>
                    <span className="ml-2 font-mono text-xs text-slate-400">live logs</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-0.5 rounded-lg bg-white/5 p-0.5">
                        {FILTERS.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                                    filter === f.value ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            autoScroll ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                        }`}
                    >
                        <ArrowDownToLine className="h-3 w-3" /> Auto-scroll
                    </button>
                    <button
                        onClick={() => setLogs([])}
                        className="flex cursor-pointer items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-400 transition hover:bg-red-500/20 hover:text-red-300"
                    >
                        <Eraser className="h-3 w-3" /> Clear
                    </button>
                </div>
            </div>

            {/* Log body */}
            <div className="h-80 overflow-y-auto p-4 font-mono text-xs">
                {filteredLogs.length === 0 && (
                    <p className="text-slate-500 italic">Waiting for logs…</p>
                )}
                {filteredLogs.map((line, index) => {
                    const level = levelFor(line);
                    try {
                        const parsed = JSON.parse(line);
                        const timestamp = parsed.timestamp ? new Date(parsed.timestamp).toLocaleTimeString() : "";
                        const message = parsed.message || parsed.req?.route || "No message";
                        const method = parsed.req?.method || "";
                        const route = parsed.req?.route || "";
                        return (
                            <div key={index} className="mb-1.5 flex items-start gap-2">
                                <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                                    level === "error" ? "bg-red-400" : level === "warn" ? "bg-amber-400" : "bg-emerald-400"
                                }`} />
                                <span className="shrink-0 text-slate-500">{timestamp}</span>
                                <span className={`break-all ${level === "error" ? "text-red-300" : "text-slate-300"}`}>
                                    {message}
                                    {route && <span className="text-slate-500"> — <span className="font-bold text-indigo-300">{method}</span> {route}</span>}
                                </span>
                            </div>
                        );
                    } catch (err) {
                        return (
                            <div key={index} className="mb-1.5 flex items-start gap-2">
                                <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                                    level === "error" ? "bg-red-400" : "bg-slate-500"
                                }`} />
                                <span className="break-all text-slate-400">{line}</span>
                            </div>
                        );
                    }
                })}
                <div ref={logEndRef} />
            </div>
        </div>
    );
};

export default LogViewer;
