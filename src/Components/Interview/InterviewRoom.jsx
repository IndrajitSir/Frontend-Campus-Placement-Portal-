import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
// Icons
import { Copy, Check, Video, Timer, MessageSquare, FileQuestion, UserPlus, X, Users } from 'lucide-react';
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
const API_URL = import.meta.env.VITE_API_URL

function InterviewRoom({ user, isInterviewer, roomId, language, setLanguage }) {
  const { socket } = useSocket();
  const { accessToken } = useUserData();
  const [copied, setCopied] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteResults, setInviteResults] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [participants, setParticipants] = useState([]);


  const handleFinalSubmission = async ({ fullCode, explanation, snapshot, language, userId, interviewId }) => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/interview`, {
        fullCode,
        language,
        snapshot,
        explanation,
        userId,
        interviewId,
        questionForSnapshot: "Explain the highlighted section of code.",
      });
      toast.success("Submitted successfully!");
      console.log(response.data);
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
    if (!query.trim()) {
      setInviteResults([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/v1/users/all-users-nameAndEmail`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
      const data = await res.json();
      const users = (Array.isArray(data?.data) ? data.data : []).filter(u =>
        (u.name || "").toLowerCase().includes(query.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(query.toLowerCase())
      );
      setInviteResults(users);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  // Send invite via socket
  const handleInviteUser = (targetUser) => {
    if (!socket || !targetUser) return;
    if (invitedUsers.some(u => u._id === targetUser._id)) {
      toast.info("Already invited");
      return;
    }
    socket.emit("interview:invite", {
      roomId,
      targetUserId: targetUser._id,
      targetUserName: targetUser.name,
      inviterName: user.name,
      inviterRole: user.role,
    });
    setInvitedUsers(prev => [...prev, targetUser]);
    setInviteSearch("");
    setInviteResults([]);
    toast.success(`Invite sent to ${targetUser.name}`);
  };

  // Listen for participants joining
  useEffect(() => {
    if (!socket) return;

    socket.on("interview:participantJoined", ({ userId, name, role }) => {
      setParticipants(prev => {
        if (prev.some(p => p.userId === userId)) return prev;
        return [...prev, { userId, name, role }];
      });
      toast.info(`${name} joined the interview`);
    });

    socket.on("interview:participantLeft", ({ userId, name }) => {
      setParticipants(prev => prev.filter(p => p.userId !== userId));
      toast.info(`${name} left the interview`);
    });

    // Listen for invites (candidate side)
    socket.on("interview:invited", ({ roomId: invitedRoomId, inviterName }) => {
      toast.info(`${inviterName} invited you to an interview! Room: ${invitedRoomId}`);
    });

    return () => {
      socket.off("interview:participantJoined");
      socket.off("interview:participantLeft");
      socket.off("interview:invited");
    };
  }, [socket]);

  // Notify room on join
  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("interview:joined", {
      roomId,
      userId: user._id,
      name: user.name,
      role: user.role,
    });
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket) return;
    socket.on("chat:timerStarted", ({ startedAt }) => {
      setTimerStarted(true);
      setStartedAt(startedAt);
    });
    return () => {
      socket.off("chat:timerStarted");
    };
  }, [socket]);

  useEffect(() => {
    if (!startedAt) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setElapsed(Math.floor((now - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const handleStartTimer = () => {
    if (socket) {
      socket.emit("chat:timerStarts", { roomId });
    }
  };

  useEffect(() => {
    let interval;
    if (timerStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerStarted, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="w-full space-y-5">
      {/* Header bar */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30">
              <Video className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Live Interview Room</h2>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                <span className="hidden sm:inline">Room ID:</span>
                <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-indigo-600">{roomId}</code>
                <button
                  onClick={handleCopyIdToClipboard}
                  title="Copy room ID"
                  className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Participants */}
            {participants.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <div className="flex -space-x-1.5">
                  {participants.slice(0, 5).map((p, i) => (
                    <div
                      key={p.userId || i}
                      title={p.name}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 ring-2 ring-white"
                    >
                      {(p.name || "?")[0].toUpperCase()}
                    </div>
                  ))}
                  {participants.length > 5 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 ring-2 ring-white">
                      +{participants.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Invite button (interviewer only) */}
            {isInterviewer && (
              <div className="relative">
                <button
                  onClick={() => setShowInvite(!showInvite)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Invite
                </button>

                {/* Invite dropdown */}
                <AnimatePresence>
                  {showInvite && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                        <h4 className="text-xs font-bold text-slate-900">Invite to Interview</h4>
                        <button onClick={() => setShowInvite(false)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="p-3">
                        <Input
                          placeholder="Search by name or email..."
                          value={inviteSearch}
                          onChange={(e) => handleInviteSearch(e.target.value)}
                          className="h-8 text-xs"
                        />
                        {inviteResults.length > 0 && (
                          <div className="mt-2 max-h-48 overflow-y-auto">
                            {inviteResults.map((u) => (
                              <button
                                key={u._id}
                                onClick={() => handleInviteUser(u)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-indigo-50"
                              >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
                                  {(u.name || "?")[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-slate-900">{u.name}</p>
                                  <p className="truncate text-[10px] text-slate-400">{u.email}</p>
                                </div>
                                {invitedUsers.some(iu => iu._id === u._id) && (
                                  <span className="ml-auto shrink-0 text-[10px] font-semibold text-emerald-500">Invited</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                        {inviteSearch && inviteResults.length === 0 && (
                          <p className="mt-2 text-center text-xs text-slate-400">No users found</p>
                        )}
                      </div>
                      {/* Invited list */}
                      {invitedUsers.length > 0 && (
                        <div className="border-t border-slate-100 px-3 py-2.5">
                          <p className="mb-1.5 text-[10px] font-bold text-slate-500">Invited</p>
                          <div className="flex flex-wrap gap-1.5">
                            {invitedUsers.map((u) => (
                              <span key={u._id} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                {u.name}
                                <button onClick={() => setInvitedUsers(prev => prev.filter(p => p._id !== u._id))} className="cursor-pointer text-emerald-400 hover:text-emerald-600">
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Live indicator */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
            {timerStarted ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 font-mono text-xs font-bold text-indigo-600">
                <Timer className="h-3.5 w-3.5" /> {formatTime(timeLeft)}
              </span>
            ) : (
              isInterviewer && (
                <button
                  onClick={handleStartTimer}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110"
                >
                  <Timer className="h-3.5 w-3.5" /> Start Timer
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Left: questions + chat */}
        <div className="space-y-5 lg:col-span-2">
          <Card className="border-slate-200/80 p-0">
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
              <FileQuestion className="h-4 w-4 text-indigo-600" />
              <h3 className="font-display text-sm font-bold text-slate-900">Questions</h3>
            </div>
            <div className="p-2">
              <InterviewQuestionsBox roomId={roomId} socket={socket} isInterviewer={isInterviewer} />
            </div>
          </Card>

          <Card className="flex h-[380px] flex-col border-slate-200/80 p-0">
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
              <MessageSquare className="h-4 w-4 text-fuchsia-600" />
              <h3 className="font-display text-sm font-bold text-slate-900">Chat</h3>
            </div>
            <div className="min-h-0 flex-1 p-2">
              <ChatBox roomId={roomId} userName={user.name} />
            </div>
          </Card>
        </div>

        {/* Right: code editor */}
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#1e1e1e] shadow-lg">
            <CodeEditor
              onFinalSubmit={handleFinalSubmission}
              userId={user._id}
              interviewId={roomId}
              language={language}
              setLanguage={setLanguage}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default InterviewRoom
