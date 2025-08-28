import React, { useState } from "react";
import ChatBox from "./ChatBox";
import ChatIconButton from "./ChatIconButton";
import FriendRequestButton from "./FriendRequestButton";

export const UserCard = ({ user, currentUser }) => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="border rounded p-4 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{user.name}</h3>
      </div>
      <div className="flex gap-2">
        <FriendRequestButton senderId={currentUser} receiverId={user._id} />
        <ChatIconButton onClick={() => setChatOpen(true)} />
      </div>
      <ChatBox
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        user={user}
        currentUser={currentUser}
      />
    </div>
  );
};
