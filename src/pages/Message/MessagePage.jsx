import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
// Shadcn Components
import { Button } from '../../Components/ui/button';
import { Card } from '../../Components/ui/card';
// components
import ChatBox from '../../Components/PersonalChat/ChatBox';
import FriendRequestButton from '../../Components/PersonalChat/FriendRequestButton';
import SearchDialog from '../../Dialog/Search_Dialog/SearchDialogUpdated.jsx';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext/SocketContext.jsx';
import { useApi } from '../../context/ApiContext/ApiContext';
// Hooks
import useAllUsersNameAndEmail from '../../hooks/Users_Name_and_Email/useAllUsersNameAndEmail.js';
// Icons
import { Check, X, MessageCircle, LoaderCircle, UserPlus, Users, ChevronLeft, ChevronRight } from 'lucide-react';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;
const DEFAULT_AVATAR = '/defaultUserAvatar.jpeg';

export default function NewMessagePage() {
  const [users, setUsers] = useState([]);
  const [result, setResult] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [friends, setFriends] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [friendRequest, setFriendRequest] = useState({ newFriend: false, friends: [] });
  const { ref, inView } = useInView();
  const data = useAllUsersNameAndEmail();
  const { userInfo: currentUser, accessToken } = useUserData();
  const { socket } = useSocket();
  const { getUserById } = useApi();

  const myId = currentUser?.user?._id;

  const openChatWith = (user) => {
    setSelectedUser(user);
    setActiveConversation(user);
    setShowChatPanel(true);
  };

  // ---------- People (infinite scroll) ----------
  useEffect(() => {
    let cancelled = false;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/v2/users?page=${page}&limit=30`);
        const res = await response.json();
        if (cancelled) return;
        const newUsers = Array.isArray(res?.data?.users) ? res?.data?.users : [];
        if (newUsers.length === 0) {
          setHasMore(false);
          return;
        }
        // De-dupe by _id so StrictMode/repeated triggers never duplicate entries
        setUsers(prev => {
          const existing = new Set((Array.isArray(prev) ? prev : []).map(u => u?._id));
          const fresh = newUsers.filter(u => u?._id && !existing.has(u._id));
          return [...(Array.isArray(prev) ? prev : []), ...fresh];
        });
      } catch (err) {
        if (!cancelled) console.error("Failed to fetch users", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (hasMore) fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    if (inView && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [inView]);

  // ---------- Friends (accepted requests) ----------
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/v2/friend-request/friends`, {
          credentials: "include",
          method: "GET",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          }
        });
        const res = await response.json();
        if (!res?.success) { toast.error(res?.message); }
        // Each record is { _id: requestId, sender, receiver }; normalize to the
        // actual friend user so chat uses the real user id.
        const normalized = (Array.isArray(res?.data) ? res?.data : [])
          .map(req => {
            const isSender = req?.sender?._id === myId;
            const friendUser = isSender ? req?.receiver : req?.sender;
            return friendUser ? { ...friendUser, requestId: req?._id } : null;
          })
          .filter(Boolean);
        setFriends(normalized);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    if (myId) fetchFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  // ---------- Live friend requests ----------
  useEffect(() => {
    if (!socket) return;

    socket.on("friend:request", async (data) => {
      const friend = await getUserById(data?.senderId);
      const frnds = [...(friendRequest.friends || [])];
      friend["requestId"] = data?.requestId;
      frnds.push(friend);
      setFriendRequest({ newFriend: true, friends: frnds });
      toast.info(`${friend?.student_id?.name || friend?.name || "Someone"} sent you a friend request.`);
    });

    return () => socket.off("friend:request");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // ---------- Global incoming message listener ----------
  // When a message arrives and the chat panel is NOT showing for that sender,
  // show a toast so the user knows someone messaged them.
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (doc) => {
      const senderId = doc?.sender?._id;
      const senderName = doc?.sender?.name || "Someone";
      // Only show toast if the chat with this sender is not currently open
      if (senderId && senderId !== myId && (!showChatPanel || activeConversation?._id !== senderId)) {
        toast.info(`💬 ${senderName} sent you a message.`);
      }
    };

    socket.on("personalChat:newMessage", onNewMessage);
    return () => socket.off("personalChat:newMessage", onNewMessage);
  }, [socket, showChatPanel, activeConversation?._id, myId]);

  const searchQueryFromChild = async (query) => {
    try {
      // SearchDialog can pass either a user object (from suggestion click)
      // or a raw string (from the Search button).
      const searchTerm = typeof query === 'string' ? query : (query?.name || query?.email || '');
      if (!searchTerm) {
        return toast.warning("Please enter a name or email to search.");
      }
      const res = await fetch(`${API_URL}/api/v1/users/one/${encodeURIComponent(searchTerm)}`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
      const response = await res.json();
      if (!response?.success) {
        return toast.warning(response?.message);
      }
      // Don't let users chat with themselves
      if (response?.data?._id === myId) {
        return toast.warning("You can't start a chat with yourself.");
      }
      setResult(response?.data);
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  const handleResponseToFriendRequest = async (action, requestId) => {
    const response = await fetch(`${API_URL}/api/v2/friend-request/respond`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({ requestId: requestId, action: action })
    });
    const res = await response.json();
    if (!res?.success) { toast.error(res?.message); }
    if (action === "accepted") {
      friendRequest.friends.map((friend) => {
        if (friend.requestId === requestId) {
          setFriends(prev => [...prev, friend]);
        }
      })
    }
    let frnds = friendRequest.friends.filter((friend) => friend?.requestId !== requestId)
    setFriendRequest({ newFriend: frnds.length > 0, friends: frnds });
  }

  const avatarOf = (u) => u?.avatar || u?.student_id?.avatar || DEFAULT_AVATAR;
  const nameOf = (u) => u?.name || u?.student_id?.name || "Unknown";
  const emailOf = (u) => u?.email || u?.student_id?.email || "";

  const renderPersonCard = (person, actions) => (
    <motion.div
      key={person?._id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevate group rounded-2xl border border-slate-200/80 bg-white p-4"
    >
      <div className="flex items-center gap-3">
        <img src={avatarOf(person)} alt={nameOf(person)} className="h-11 w-11 rounded-full object-cover ring-2 ring-indigo-100" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{nameOf(person)}</p>
          <p className="truncate text-xs text-slate-400">{emailOf(person) || "Student"}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {actions}
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-[560px] gap-6">
      {/* ---------------- Friends sidebar ---------------- */}
      <aside className="flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
            <Users className="h-4 w-4 text-indigo-600" /> Friends
          </h2>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
            {Array.isArray(friends) ? friends.length : 0}
          </span>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {Array.isArray(friends) && friends.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <UserPlus className="h-6 w-6" />
              </span>
              <p className="text-sm font-medium text-slate-400">No friends yet</p>
              <p className="px-4 text-xs text-slate-300">Send a friend request from the people list to start chatting.</p>
            </div>
          )}
          {Array.isArray(friends) && friends.map((friend) => {
            const isActive = activeConversation?._id === friend?._id && showChatPanel;
            return (
              <button
                key={friend?._id}
                onClick={() => openChatWith(friend)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-2.5 text-left transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-700 hover:bg-indigo-50"
                }`}
              >
                <img src={avatarOf(friend)} alt={nameOf(friend)} className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-indigo-100" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{nameOf(friend)}</p>
                  <p className={`truncate text-xs ${isActive ? "text-indigo-100" : "text-slate-400"}`}>Tap to chat</p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ---------------- Main ---------------- */}
      <section className="flex min-w-0 flex-1 flex-col gap-5">
        {/* Friend requests */}
        {friendRequest.newFriend && (
          <Card className="border-amber-200/70 bg-amber-50/40 p-5">
            <h2 className="font-display text-sm font-bold text-slate-900">Friend requests</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {friendRequest.friends.map((friend) => (
                <div key={friend?.requestId || friend?._id} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 pr-4 shadow-sm">
                  <img src={avatarOf(friend)} alt={nameOf(friend)} className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{nameOf(friend)}</p>
                    <p className="truncate text-xs text-slate-400">{emailOf(friend)}</p>
                  </div>
                  <div className="ml-2 flex items-center gap-2">
                    <button
                      title="Accept"
                      onClick={() => handleResponseToFriendRequest("accepted", friend?.requestId)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      title="Decline"
                      onClick={() => handleResponseToFriendRequest("rejected", friend?.requestId)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* People */}
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-slate-200/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                <MessageCircle className="h-4 w-4 text-indigo-600" /> Start a conversation
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">Search for someone or pick from everyone on the platform.</p>
            </div>
            <SearchDialog data={(Array.isArray(data) ? data : []).filter(u => u?._id !== myId)} searchCriteria={["name", "email"]} onQuery={searchQueryFromChild} placeholderValue="Search user by name or email" />
          </div>

          <div className="mt-4 grid flex-1 auto-rows-min grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
            {result && renderPersonCard(result, (
              <>
                <FriendRequestButton senderId={myId} receiverId={result?._id} />
                <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => openChatWith(result)}>
                  <MessageCircle className="h-3.5 w-3.5" /> Message
                </Button>
              </>
            ))}

            {users.map((user) => (
              myId !== user?._id && renderPersonCard(user, (
                <>
                  <FriendRequestButton senderId={myId} receiverId={user?._id} />
                  <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => openChatWith(user)}>
                    <MessageCircle className="h-3.5 w-3.5" /> Message
                  </Button>
                </>
              ))
            ))}

            {loading && (
              <div className="col-span-full flex items-center justify-center gap-2 py-4 text-sm text-slate-400">
                <LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" /> Loading people…
              </div>
            )}
            {hasMore && <div ref={ref} className="col-span-full h-4" />}
          </div>
        </Card>
      </section>

      {/* ---------------- Conversation panel (right side) ---------------- */}
      <AnimatePresence>
        {showChatPanel && activeConversation && (
          <motion.div
            initial={{ x: showChatPanel ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-[calc(100vh-7.5rem)] min-h-[560px] flex-col bg-white shadow-xl sm:shadow-2xl"
          >
            {/* Conversation header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => setShowChatPanel(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white sm:hidden"
                  title="Back to conversations"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <img src={avatarOf(activeConversation)} alt={nameOf(activeConversation)} className="h-10 w-10 shrink-0 rounded-full border-2 border-white/40 object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold">{nameOf(activeConversation)}</p>
                  <p className="truncate text-xs text-indigo-100">{emailOf(activeConversation) || "Student"}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatPanel(false)}
                title="Close conversation"
                className="cursor-pointer rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 min-h-0">
              <ChatBox
                isOpen={showChatPanel}
                onClose={() => setShowChatPanel(false)}
                user={activeConversation}
                currentUser={currentUser}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile toggle for chat panel */}
      {showChatPanel && (
        <Button
          size="sm"
          variant="outline"
          className="fixed bottom-4 left-4 z-40 sm:hidden rounded-xl border-slate-200 bg-white shadow-lg"
          onClick={() => setShowChatPanel(false)}
        >
          <ChevronRight className="h-4 w-4 mr-1" /> Back to people
        </Button>
      )}
    </div>
  );
}
