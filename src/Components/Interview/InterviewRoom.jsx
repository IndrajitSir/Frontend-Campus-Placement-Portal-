import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
// Icons
import { Copy, Check, Video, Timer, MessageSquare, FileQuestion, UserPlus, X, Users, ChevronDown, Search } from 'lucide-react';
// Shadcn Components
import { Card } from '../../Components/ui/card';
import { Button } from '../../Components/ui/button';
import { Input } from '../../Components/ui/input';
// Components
import CodeEditor from '../../Components/Interview/CodeEditor';
import ChatBox from '../../Components/Interview/ChatBox.jsx';
import { InterviewQuestionsBox } from './InterviewQuestionBox';
// CONTEXT api
import { useSocket } from '../../context/SocketContext/SocketContext.jsx';
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

const SIDEBAR_TABS = [
  { id: "questions", label: "Questions", icon: FileQuestion },
  { id: "chat", label: "Chat", icon: MessageSquare },
];

function InterviewRoom({ user, isInterviewer, roomId, language, setLanguage }) {
  const { socket } = useSocket();
  const { accessToken } = useUserData();
  const [copied, setCopied] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteResults, setInviteResults] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const inviteBtnRef = useRef(null);
  const [inviteBtnPos, setInviteBtnPos] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("questions");
  const [questionCount, setQuestionCount] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);

  const handleFinalSubmission = async ({ fullCode, explanation, snapshot, language, userId, interviewId }) => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/interview`, {
        fullCode, language, snapshot, explanation, userId, interviewId,
        questionForSnapshot: "Explain the highlighted section of code.",
      });
      toast.success("Submitted successfully!");
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  const handleCopyIdToClipboard = () => {
    window.navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Search users for invite
  const handleInviteSearch = async (query) => {
    setInviteSearch(query);
    if (!query.trim()) { setInviteResults([]); return; }
    try {
      const res = await fetch(`${API_URL}/api/v1/users/all-users-nameAndEmail`, {
        method: "GET", credentials: "include",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      });
      const data = await res.json();
      const users = (Array.isArray(data?.data) ? data.data : []).filter(u =>
        (u.name || "").toLowerCase().includes(query.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(query.toLowerCase())
      );
      setInviteResults(users);
    } catch (err) { console.error("Search failed", err); }
  };

  const handleInviteUser = (targetUser) => {
    if (!socket || !targetUser) return;
    if (invitedUsers.some(u => u._id === targetUser._id)) { toast.info("Already invited"); return; }
    socket.emit("interview:invite", {
      roomId, targetUserId: targetUser._id, targetUserName: targetUser.name,
      inviterName: user.name, inviterRole: user.role,
    });
    setInvitedUsers(prev => [...prev, targetUser]);
    setInviteSearch(""); setInviteResults([]);
    toast.success(`Invite sent to ${targetUser.name}`);
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    socket.on("interview:participantJoined", ({ userId, name, role }) => {
      setParticipants(prev => prev.some(p => p.userId === userId) ? prev : [...prev, { userId, name, role }]);
      toast.info(`${name} joined the interview`);
    });
    socket.on("interview:participantLeft", ({ userId, name }) => {
      setParticipants(prev => prev.filter(p => p.userId !== userId));
      toast.info(`${name} left the interview`);
    });
    socket.on("interview:invited", ({ roomId: invitedRoomId, inviterName }) => {
      toast.info(`${inviterName} invited you to an interview! Room: ${invitedRoomId}`);
    });
    return () => {
      socket.off("interview:participantJoined");
      socket.off("interview:participantLeft");
      socket.off("interview:invited");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("interview:joined", { roomId, userId: user._id, name: user.name, role: user.role });
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket) return;
    socket.on("chat:timerStarted", ({ startedAt }) => { setTimerStarted(true); setStartedAt(startedAt); });
    return () => { socket.off("chat:timerStarted"); };
  }, [socket]);

  useEffect(() => {
    if (!startedAt) return;
    const interval = setInterval(() => { setTimeLeft(Math.max(0, 3600 - Math.floor((Date.now() - startedAt) / 1000))); }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const handleStartTimer = () => { if (socket) socket.emit("chat:timerStarts", { roomId }); };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex h-[calc(100vh-6rem)] flex-col gap-4">

      {/* ── Header ── */}
      <div className="relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e1f] px-5 py-3 shadow-lg shadow-black/30">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md shadow-indigo-500/25">
              <Video className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-white">Live Interview</h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-indigo-300 ring-1 ring-inset ring-white/10">{roomId?.slice(0, 8)}…</code>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopyIdToClipboard} className="flex cursor-pointer items-center gap-0.5 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 transition hover:border-indigo-400/40 hover:text-indigo-300">
                  {copied ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                  {copied ? "Copied" : "Copy"}
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Participants */}
            {participants.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3 w-3 text-slate-500" />
                <div className="flex -space-x-1">
                  {participants.slice(0, 4).map((p, i) => (
                    <div key={p.userId || i} title={p.name} className="relative flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[8px] font-bold text-indigo-200 ring-1.5 ring-[#0a0e1f]">
                      {(p.name || "?")[0].toUpperCase()}
                      <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-[#0a0e1f]" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{participants.length}</span>
              </div>
            )}

            {/* Invite */}
            {isInterviewer && (
              <div className="relative">
                <button ref={inviteBtnRef} onClick={() => {
                  if (inviteBtnRef.current) {
                    setInviteBtnPos(inviteBtnRef.current.getBoundingClientRect());
                  }
                  setShowInvite(!showInvite);
                }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300 shadow-sm transition hover:border-indigo-400/40 hover:bg-white/[0.08] hover:text-indigo-300">
                  <UserPlus className="h-3 w-3" /> Invite
                </button>
              </div>
            )}

            {/* Invite dropdown rendered via Portal to escape stacking contexts */}
            {isInterviewer && showInvite && createPortal(
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setShowInvite(false)} />
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="fixed z-[9999] w-80 overflow-hidden rounded-xl border border-white/10 bg-[#0f1530] shadow-2xl shadow-black/50"
                  style={{ top: inviteBtnPos?.bottom ? inviteBtnPos.bottom + 8 : 100, right: 16 }}>
                  <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
                    <h4 className="text-xs font-bold text-white">Invite to Interview</h4>
                    <button onClick={() => setShowInvite(false)} className="cursor-pointer rounded p-0.5 text-slate-400 hover:text-slate-200"><X className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="p-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                      <input placeholder="Search by name or email..."
                        value={inviteSearch}
                        onChange={(e) => handleInviteSearch(e.target.value)}
                        autoFocus
                        className="h-8 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                    {inviteResults.length > 0 && (
                      <div className="mt-2 max-h-56 overflow-y-auto">
                        {inviteResults.map((u) => (
                          <button key={u._id} onClick={() => handleInviteUser(u)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-white/[0.06]">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[10px] font-bold text-white">
                              {(u.name || "?")[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-white">{u.name}</p>
                              <p className="truncate text-[10px] text-slate-500">{u.email}</p>
                            </div>
                            {invitedUsers.some(iu => iu._id === u._id) && <span className="ml-auto shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/25">Invited</span>}
                          </button>
                        ))}
                      </div>
                    )}
                    {inviteSearch && inviteResults.length === 0 && <p className="mt-3 text-center text-xs text-slate-500">No users found</p>}
                    {!inviteSearch && <p className="mt-2 text-center text-[10px] text-slate-600">Type a name or email to search</p>}
                  </div>
                  {invitedUsers.length > 0 && (
                    <div className="border-t border-white/10 px-3 py-2.5">
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Invited ({invitedUsers.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {invitedUsers.map((u) => (
                          <span key={u._id} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/25">
                            {(u.name || "?")[0].toUpperCase()} {u.name}
                            <button onClick={() => setInvitedUsers(prev => prev.filter(p => p._id !== u._id))} className="cursor-pointer text-emerald-400/70 hover:text-emerald-300"><X className="h-2.5 w-2.5" /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </>,
              document.body
            )}

            {/* Live + Timer */}
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-inset ring-emerald-500/25">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" /></span>
              Live
            </span>
            {timerStarted ? (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ring-1 ring-inset transition-colors ${
                timeLeft <= 120
                  ? "animate-pulse bg-amber-500/15 text-amber-300 ring-amber-500/40"
                  : "bg-indigo-500/15 text-indigo-300 ring-indigo-500/25"
              }`}>
                <Timer className="h-3 w-3" /> {formatTime(timeLeft)}
              </span>
            ) : isInterviewer && (
              <button onClick={handleStartTimer}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:brightness-110">
                <Timer className="h-3 w-3" /> Start
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main: Sidebar + Editor ── */}
      <div className="flex min-h-0 flex-1 gap-4">

        {/* Left sidebar — tabbed */}
        <div className="flex w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e1f] shadow-lg shadow-black/30">
          {/* Tab bar */}
          <div className="flex border-b border-white/10 bg-white/[0.03]">
            {SIDEBAR_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = sidebarTab === tab.id;
              return (
                <button key={tab.id} onClick={() => {
                  setSidebarTab(tab.id);
                  if (tab.id === "chat") setChatUnread(0);
                }}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${active ? "border-b-2 border-indigo-400 text-indigo-300" : "text-slate-500 hover:text-slate-300"}`}>
                  <Icon className="h-3.5 w-3.5" /> {tab.label}
                  {tab.id === "chat" && chatUnread > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[8px] font-bold text-white">{chatUnread}</span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Tab content */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {sidebarTab === "questions" ? (
                <motion.div key="q" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }} className="h-full">
                  <InterviewQuestionsBox roomId={roomId} socket={socket} isInterviewer={isInterviewer} onNewQuestion={() => setQuestionCount(c => c + 1)} />
                </motion.div>
              ) : (
                <motion.div key="c" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15 }} className="flex h-full flex-col">
                  <div className="min-h-0 flex-1 p-2">
                    <ChatBox roomId={roomId} userName={user?.name || "User"} onNewMessage={() => { if (sidebarTab !== "chat") setChatUnread(c => c + 1); }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: code editor — fills remaining space */}
        <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#1e1e1e] shadow-lg shadow-black/40">
          <CodeEditor
            onFinalSubmit={handleFinalSubmission}
            userId={user._id}
            interviewId={roomId}
            language={language}
            setLanguage={setLanguage}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default InterviewRoom
