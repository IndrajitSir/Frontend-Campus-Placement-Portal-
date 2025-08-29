import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
// Shadcn Components
import { Button } from '../../Components/ui/button';
// Components
import InterviewRoom from '../../Components/Interview/InterviewRoom.jsx';
// CONTEXT api
import { useSocket } from '../../context/SocketContext/SocketContext.jsx';
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';

function InterviewSetup() {
  const [roomId, setRoomID] = useState('');
  const [isLive, setIsLive] = useState(false);
  const { role, userInfo } = useUserData();
  const { socket } = useSocket();
  const isInterviewer = (role === "placement_staff" || role === "admin" || role === "super_admin") ? true : false;

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("roomId");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
  useEffect(() => {
    if (socket) {
      console.log(`User Info: ${JSON.stringify(userInfo?.user)}`)
      if (roomId === '') {
        setRoomID(localStorage.getItem("roomId"));
        socket.emit("isLive", { roomId }, (res) => {
          if (res?.success) {
            setIsLive(true);
          } else {
            socket.on("isLive", () => {
              setIsLive(true);
            });
          }
        });
      } else {
        socket.emit("isLive", { roomId }, (res) => {
          if (res?.success) {
            setIsLive(true);
          } else {
            socket.on("isLive", () => {
              setIsLive(true);
            });
          }
        });
      }
    }
    return () => socket.off("isLive");
  }, [socket, roomId]);

  const handleCreateNewRoom = () => {
    if (!socket) return;

    if (socket) {
      socket.emit("create-room", (res) => {
        if (res?.success) {
          setRoomID(res?.roomId);
          localStorage.setItem("roomId", res?.roomId);
          toast.success(res?.message);
          socket.emit("join-room", { roomId: res?.roomId, role: role, name: userInfo?.user?.name }, (res) => {
            if (!res.success) {
              toast.error(res?.message || "Invalid ID");
              return;
            }
            setIsLive(true);
          });
        }
      });
    }
  }

  return (
    <div className="min-w-full min-h-screen p-6 px-10 bg-gray-50 mx-auto space-y-6">
      <div className='max-w-7xl mx-auto'>
        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-700">Technical Interview</h2>
        {
          isLive ?
            <InterviewRoom user={userInfo.user} isInterviewer={isInterviewer} roomId={roomId} />
            :
            (role === "placement_staff" &&
              <div className="flex justify-center">
                <Button onClick={handleCreateNewRoom} className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer">Create New Interview Room</Button>
              </div>
            )
        }
      </div>
    </div>
  );
}

export default InterviewSetup;
