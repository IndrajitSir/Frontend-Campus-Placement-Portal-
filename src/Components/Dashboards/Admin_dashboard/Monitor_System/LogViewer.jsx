import { useEffect, useState, useRef } from "react";
import { useUserData } from "../../../../context/AuthContext/AuthContext.jsx";
import { Eraser, ArrowDownToLine } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const MAX_LINES = 1000;

const FILTERS = [
  { value: "all", label: "All" },
  { value: "info", label: "Info" },
  { value: "error", label: "Error" },
];

const LogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState("all");
    const [autoScroll, setAutoScroll] = useState(false);
    const [connected, setConnected] = useState(false);
    const logEndRef = useRef(null);
    const { accessToken } = useUserData();

    // Live logs arrive over Server-Sent Events (no socket.io involved).
    // EventSource can't set an Authorization header, so the backend authenticates
    // via the httpOnly accessToken cookie (same one /users/current-user uses) and
    // enforces the admin role. The token is deliberately NOT put in the URL since
    // request URLs end up in the access logs.
    useEffect(() => {
        if (!accessToken) return;
        const url = `${API_URL}/api/v1/system/logs/stream`;
        const source = new EventSource(url, { withCredentials: true });

        const onLog = (event) => {
            let line = event.data;
            try {
                line = JSON.parse(event.data);
            } catch {
                // Non-JSON line — render it as-is.
            }
            setLogs((prev) => {
                const next = [...prev, line];
                return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
            });
        };

        source.onopen = () => setConnected(true);
        source.onerror = () => setConnected(false);
        source.addEventListener("log", onLog);

        return () => {
            source.removeEventListener("log", onLog);
            source.close();
        };
    }, [accessToken]);

    useEffect(() => {
        if (autoScroll && logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs, autoScroll]);

    const filteredLogs = logs.filter((line) => {
        if (filter === "all") return true;
        if (typeof line !== "string") return false;
        if (filter === "info") return line.toLowerCase().includes("info");
        if (filter === "error") return line.toLowerCase().includes("error");
        return true;
    });

    const levelFor = (text) => {
        const t = typeof text === "string" ? text.toLowerCase() : "";
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
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                        <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400"}`} />
                        {connected ? "streaming" : "connecting…"}
                    </span>
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
                    } catch {
                        return (
                            <div key={index} className="mb-1.5 flex items-start gap-2">
                                <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                                    level === "error" ? "bg-red-400" : "bg-slate-500"
                                }`} />
                                <span className="break-all text-slate-400">{String(line)}</span>
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
