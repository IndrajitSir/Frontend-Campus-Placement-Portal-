import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// Icons
import { Copy } from 'lucide-react';
// Shadcn Components
import { Card, CardContent } from '../../components/ui/card';
// Components
import CodeEditor from '../../components/Interview/CodeEditor';
import ChatBox from '../../components/Interview/ChatBox.jsx';
import { InterviewQuestionsBox } from './InterviewQuestionBox';
// CONTEXT api
import { useSocket } from '../../context/SocketContext/SocketContext.jsx';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL

function InterviewRoom({ user, isInterviewer, roomId }) {
  const { socket } = useSocket();
  const [copied, setCopied] = useState(false);
  const [showCopyText, setShowCopyText] = useState(false);
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
    <div className="p-6 space-y-6">
      <div className='flex items-center justify-around gap-y-2'>
        <h2 className="text-2xl font-bold text-center text-yellow-700">Live Interview Room</h2>
        <div className="flex gap-x-6 text-sm items-center">
          <div onMouseEnter={() => setShowCopyText(true)} onMouseLeave={() => setShowCopyText(false)}
            className="flex items-center gap-x-2 relative group"
          >
            <span>Room ID: <span className="font-semibold">{roomId}</span></span>
            {showCopyText && (
              <span className="absolute top-[-20px] right-[-20px] text-xs text-gray-600">
                {copied ? "Copied" : "Copy"}
              </span>
            )}
            {
              isInterviewer &&
              <Copy size={19} onClick={handleCopyIdToClipboard} className="cursor-pointer hover:bg-gray-200 p-1 rounded" />
            }
          </div>

          <span className="text-green-600 font-semibold flex items-center">🟢 Live</span>

          {timerStarted ? (
            <span className="text-blue-600 font-semibold">{/*`⏱ ${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`*/}{`⏱ ${formatTime(timeLeft)}`}</span>
          ) : (
            isInterviewer && !timerStarted &&
            <button
              onClick={handleStartTimer}
              className="px-3 py-1 text-white bg-blue-600 hover:bg-blue-500 rounded text-xs cursor-pointer"
            >
              Start Timer
            </button>
          )}
        </div>
      </div>
      {/* Main Content */}
      <main className="flex-1 pt-6 grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Panel */}
        <div className="space-y-6 md:col-span-2">
          {/* Question Box */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <InterviewQuestionsBox roomId={roomId} socket={socket} isInterviewer={isInterviewer}/>
            </CardContent>
          </Card>

          {/* Chat Box */}
          <Card className="flex flex-col h-[400px]">
            <CardContent className="p-4 flex flex-col flex-1">
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                <ChatBox roomId={roomId} userName={user.name} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel (Editor + Controls) */}
        <div className="md:col-span-3 flex flex-col">
          <div className="flex-1 mb-4">
            <div className="rounded-lg overflow-hidden shadow-lg bg-white h-full">
              <div className="h-[610px]">
                <CodeEditor onFinalSubmit={handleFinalSubmission} userId={user._id} interviewId={roomId} defaultCode={`console.log("hello world")`} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default InterviewRoom