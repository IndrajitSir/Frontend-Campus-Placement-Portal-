import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
// Icons
import { Copy, Check, Video, Timer, MessageSquare, FileQuestion } from 'lucide-react';
// Shadcn Components
import { Card } from '../../Components/ui/card';
// Components
import CodeEditor from '../../Components/Interview/CodeEditor';
import ChatBox from '../../Components/Interview/ChatBox.jsx';
import { InterviewQuestionsBox } from './InterviewQuestionBox';
// CONTEXT api
import { useSocket } from '../../context/SocketContext/SocketContext.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL

function InterviewRoom({ user, isInterviewer, roomId }) {
  const { socket } = useSocket();
  const [copied, setCopied] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour = 3600 seconds

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

  useEffect(() => {
    if (!socket) return;

    socket.on("chat:timerStarted", ({ startedAt }) => {
      setTimerStarted(true);
      setStartedAt(startedAt);
    });

    return () => {
      socket.off("chat:timerStarted");
    }
  }, [socket]);

  useEffect(() => {
    if (!startedAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setElapsed(Math.floor((now - startedAt) / 1000));
    }, 1000);

    return () => {
      clearInterval(interval);
    }
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
                {isInterviewer && (
                  <button
                    onClick={handleCopyIdToClipboard}
                    title="Copy room ID"
                    className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
            <CodeEditor onFinalSubmit={handleFinalSubmission} userId={user._id} interviewId={roomId} defaultCode={`console.log("hello world")`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default InterviewRoom
