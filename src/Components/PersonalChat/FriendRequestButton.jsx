import React, { useState } from 'react';
import { toast } from 'react-toastify';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

const FriendRequestButton = ({ senderId, receiverId }) => {
  const [sent, setSent] = useState(false);
  const { accessToken } = useUserData();

  const sendRequest = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v2/friend-request/send`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ senderId: senderId, receiverId: receiverId })
      });
      const res = await response.json();
      if (!res.success) { toast.warn(res.message); }
      setSent(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={sendRequest}
      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 cursor-pointer"
      disabled={sent}
    >
      {sent ? "Request Sent" : "Add Friend"}
    </button>
  );
};

export default FriendRequestButton;