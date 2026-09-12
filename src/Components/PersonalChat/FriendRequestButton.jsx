import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Check, UserPlus } from 'lucide-react';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

const FriendRequestButton = ({ receiverId }) => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const { accessToken } = useUserData();

  const sendRequest = async () => {
    if (sending) return;

    if (!receiverId) {
      toast.error("Receiver ID is missing. Cannot send friend request.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch(
        `${API_URL}/api/v2/friend-request/send`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            receiverId: String(receiverId),
          }),
        }
      );

      const res = await response.json();

      if (!response.ok || !res?.success) {
        toast.error(
          res?.message || "Failed to send friend request."
        );
        return;
      }

      setSent(true);

      toast.success(
        res?.message || "Friend request sent successfully!"
      );
    } catch (err) {
      console.error("Failed to send friend request:", err);

      toast.error(
        "Unable to send friend request. Please try again."
      );
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
