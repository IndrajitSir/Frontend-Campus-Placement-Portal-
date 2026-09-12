import React, { useState } from "react";
import ChatBox from "./ChatBox";
import ChatIconButton from "./ChatIconButton";
import FriendRequestButton from "./FriendRequestButton";
import { X } from "lucide-react";

export const UserCard = ({ user, currentUser }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const currentUserId = typeof currentUser === 'object' ? (currentUser?.user?._id || currentUser?._id) : currentUser;

  return (
    <div className="border rounded p-4 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition">
      <div>
        <h3 className="font-semibold text-slate-800">{user?.name || "User"}</h3>
        {user?.email && <p className="text-xs text-slate-400">{user.email}</p>}
      </div>
      <div className="flex items-center gap-2">
        <FriendRequestButton
          onClick={() => {
            if (!user?._id) {
              toast.error("User ID is missing. Cannot open chat.");
              return;
            }
          }}
          receiverId={user?._id}
        />

        <ChatIconButton
          onClick={() => {
            if (!user?._id) {
              toast.error("User ID is missing. Cannot open chat.");
              return;
            }

            setChatOpen(true);
          }}
        />
      </div>

      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="flex h-[520px] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{user?.name || "Chat"}</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="cursor-pointer rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <ChatBox
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
                user={user}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

