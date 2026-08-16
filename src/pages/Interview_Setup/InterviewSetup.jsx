import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
// Shadcn Components
import { Button } from '../../Components/ui/button';
import { Input } from '../../Components/ui/input';
// Components
import InterviewRoom from '../../Components/Interview/InterviewRoom.jsx';
// CONTEXT api
import { useSocket } from '../../context/SocketContext/SocketContext.jsx';
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
// Icons
import { Video, PlusCircle, KeyRound, LoaderCircle } from 'lucide-react';

function InterviewSetup() {
  const [roomId, setRoomID] = useState(localStorage.getItem("roomId") || "");
  const [joinId, setJoinId] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const { role, userInfo } = useUserData();
  const { socket } = useSocket();
  const isInterviewer = ["placement_staff", "admin", "super_admin"].includes(role);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("roomId");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // If a room id is present (created earlier or restored), check whether it is
  // still live and listen for the interviewer's "isLive" broadcast.
  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("isLive", { roomId }, (res) => {
      if (res?.success) setIsLive(true);
    });
    const onLive = () => setIsLive(true);
    socket.on("isLive", onLive);
    return () => socket.off("isLive", onLive);
  }, [socket, roomId]);

  const handleCreateNewRoom = () => {
    if (!socket) return;
    setCreating(true);
    socket.emit("create-room", (res) => {
      setCreating(false);
      if (!res?.success) return;
      setRoomID(res?.roomId);
      localStorage.setItem("roomId", res?.roomId);
      toast.success(res?.message || "Room created — share the ID with the candidate.");
      socket.emit("join-room", { roomId: res?.roomId, role, name: userInfo?.user?.name }, (jr) => {
        if (!jr?.success) {
          toast.error(jr?.message || "Could not join the room");
          return;
        }
        setIsLive(true);
      });
    });
  };

  const handleJoinRoom = () => {
    const id = joinId.trim();
    if (!id) {
      toast.warning("Enter a room ID first");
      return;
    }
    if (!socket) {
      toast.error("Socket not connected — refresh and try again");
      return;
    }
    setJoining(true);
    socket.emit("join-room", { roomId: id, role, name: userInfo?.user?.name }, (res) => {
      setJoining(false);
      if (res?.success) {
        setRoomID(id);
        localStorage.setItem("roomId", id);
        setIsLive(true);
      } else {
        toast.error(res?.message || "Invalid room ID");
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-2">
      {isLive ? (
        <InterviewRoom user={userInfo?.user} isInterviewer={isInterviewer} roomId={roomId} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12"
        >
          <div className="bg-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30">
              <Video className="h-8 w-8" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold text-slate-900">Technical Interview</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {isInterviewer
                ? "Create a room to start an interview, or join one with an invite ID."
                : "Join your interview using the room ID shared by the interviewer."}
            </p>

            <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
              {isInterviewer && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <PlusCircle className="mx-auto h-6 w-6 text-indigo-600" />
                  <h3 className="mt-2 font-display text-sm font-semibold text-slate-900">Create a new room</h3>
                  <p className="mt-1 text-xs text-slate-400">Start a live interview room and share the ID with the candidate.</p>
                  <Button
                    onClick={handleCreateNewRoom}
                    disabled={creating}
                    className="mt-4 w-full cursor-pointer bg-gradient-to-r from-indigo-500 to-violet-500"
                  >
                    {creating ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Creating…</> : "Create Interview Room"}
                  </Button>
                </div>
              )}
              <div className={`rounded-2xl border border-slate-200 bg-slate-50 p-5 ${isInterviewer ? "" : "mx-auto w-full sm:col-span-2"}`}>
                <KeyRound className="mx-auto h-6 w-6 text-fuchsia-600" />
                <h3 className="mt-2 font-display text-sm font-semibold text-slate-900">Join with a room ID</h3>
                <p className="mt-1 text-xs text-slate-400">Enter the ID the interviewer gave you.</p>
                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder="Room ID"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                  />
                  <Button onClick={handleJoinRoom} disabled={joining} variant="outline" className="shrink-0 cursor-pointer">
                    {joining ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Join"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default InterviewSetup;
