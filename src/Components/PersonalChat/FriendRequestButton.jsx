import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Check, UserPlus } from 'lucide-react';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

const FriendRequestButton = ({ senderId, receiverId }) => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const { accessToken } = useUserData();

  const sendRequest = async () => {
    if (!senderId || !receiverId || sending) return;
    setSending(true);
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
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <button
        className="inline-flex cursor-default items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600"
        disabled
      >
        <Check className="h-3.5 w-3.5" /> Request Sent
      </button>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={sending}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-50"
    >
      <UserPlus className="h-3.5 w-3.5" /> {sending ? "Sending…" : "Add Friend"}
    </button>
  );
};

export default FriendRequestButton;
