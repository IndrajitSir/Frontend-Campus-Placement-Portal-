import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

// Shadcn Components
import { Button } from "../../Components/ui/button";
import { Card } from "../../Components/ui/card";

// Components
import ChatBox from "../../Components/PersonalChat/ChatBox";
import FriendRequestButton from "../../Components/PersonalChat/FriendRequestButton";
import MessagesContainer from "../../Components/PersonalChat/MessagesContainer";
import SearchDialog from "../../Dialog/Search_Dialog/SearchDialogUpdated.jsx";

// Context
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext/SocketContext.jsx";
import { useApi } from "../../context/ApiContext/ApiContext";

// Hooks
import useAllUsersNameAndEmail from "../../hooks/Users_Name_and_Email/useAllUsersNameAndEmail.js";

// Icons
import {
  Check,
  X,
  MessageCircle,
  LoaderCircle,
  UserPlus,
  Users,
  ChevronLeft,
} from "lucide-react";

// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

const DEFAULT_AVATAR = "/defaultUserAvatar.jpeg";

export default function NewMessagePage() {
  // ---------- Users ----------
  const [users, setUsers] = useState([]);
  const [result, setResult] = useState(null);

  // ---------- Conversation ----------
  const [activeConversation, setActiveConversation] = useState(null);
  const [showChatPanel, setShowChatPanel] = useState(false);

  // ---------- Friends ----------
  const [friends, setFriends] = useState([]);

  // ---------- Pagination ----------
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // ---------- Friend requests ----------
  const [friendRequest, setFriendRequest] = useState({
    newFriend: false,
    friends: [],
  });

  const { ref, inView } = useInView();

  const data = useAllUsersNameAndEmail();

  const { userInfo: currentUser, accessToken } = useUserData();

  const { socket } = useSocket();

  const { getUserById } = useApi();

  const myId = currentUser?.user?._id;

  // ============================================================
  // Helpers
  // ============================================================

  const avatarOf = (user) =>
    user?.avatar ||
    user?.student_id?.avatar ||
    DEFAULT_AVATAR;

  const nameOf = (user) =>
    user?.name ||
    user?.student_id?.name ||
    "Unknown";

  const emailOf = (user) =>
    user?.email ||
    user?.student_id?.email ||
    "";

  // ============================================================
  // Conversation handling
  // ============================================================

  const openChatWith = (user) => {
    if (!user?._id || user._id === myId) return;

    setActiveConversation(user);
    setShowChatPanel(true);
  };

  const closeChat = () => {
    setShowChatPanel(false);
    setActiveConversation(null);
  };

  const handleSelectConversation = (user) => {
    openChatWith(user);
  };

  // ============================================================
  // People - Infinite scroll
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/v2/users?page=${page}&limit=30`
        );

        const res = await response.json();

        if (cancelled) return;

        const newUsers = Array.isArray(res?.data?.users)
          ? res.data.users
          : [];

        if (newUsers.length === 0) {
          setHasMore(false);
          return;
        }

        setUsers((prev) => {
          const existing = new Set(
            (Array.isArray(prev) ? prev : []).map((u) => u?._id)
          );

          const fresh = newUsers.filter(
            (u) => u?._id && !existing.has(u._id)
          );

          return [
            ...(Array.isArray(prev) ? prev : []),
            ...fresh,
          ];
        });
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch users:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (hasMore) {
      fetchUsers();
    }

    return () => {
      cancelled = true;
    };
  }, [page, hasMore]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, loading]);

  // ============================================================
  // Friends
  // ============================================================

  useEffect(() => {
    if (!myId) return;

    let cancelled = false;

    const fetchFriends = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/v2/friend-request/friends`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const res = await response.json();

        if (cancelled) return;

        if (!res?.success) {
          toast.error(res?.message || "Failed to fetch friends.");
          return;
        }

        const normalized = (
          Array.isArray(res?.data) ? res.data : []
        )
          .map((request) => {
            const isSender =
              String(request?.sender?._id) === String(myId);

            const friendUser = isSender
              ? request?.receiver
              : request?.sender;

            return friendUser
              ? {
                ...friendUser,
                requestId: request?._id,
              }
              : null;
          })
          .filter(Boolean);

        setFriends(normalized);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch friends:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchFriends();

    return () => {
      cancelled = true;
    };
  }, [myId, accessToken]);

  // ============================================================
  // Live friend requests
  // ============================================================

  useEffect(() => {
    if (!socket) return;

    const handleFriendRequest = async (requestData) => {
      try {
        const friend = await getUserById(requestData?.senderId);

        if (!friend?._id) return;

        const friendWithRequestId = {
          ...friend,
          requestId: requestData?.requestId,
        };

        setFriendRequest((prev) => {
          const existing = Array.isArray(prev.friends)
            ? prev.friends
            : [];

          const alreadyExists = existing.some(
            (item) =>
              item?.requestId === requestData?.requestId
          );

          if (alreadyExists) return prev;

          const updated = [
            ...existing,
            friendWithRequestId,
          ];

          return {
            newFriend: true,
            friends: updated,
          };
        });

        toast.info(
          `${nameOf(friend)} sent you a friend request.`
        );
      } catch (error) {
        console.error("Failed to process friend request:", error);
      }
    };

    socket.on("friend:request", handleFriendRequest);

    return () => {
      socket.off("friend:request", handleFriendRequest);
    };
  }, [socket, getUserById]);

  // ============================================================
  // Incoming message notification
  // ============================================================

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (doc) => {
      const senderId = doc?.sender?._id;

      const senderName =
        doc?.sender?.name ||
        doc?.sender?.student_id?.name ||
        "Someone";

      if (!senderId || String(senderId) === String(myId)) {
        return;
      }

      const isCurrentConversation =
        showChatPanel &&
        String(activeConversation?._id) === String(senderId);

      if (!isCurrentConversation) {
        toast.info(`💬 ${senderName} sent you a message.`);
      }

      // MessagesContainer should independently update its
      // conversation list using the same socket event.
    };

    socket.on("personalChat:newMessage", handleNewMessage);

    return () => {
      socket.off("personalChat:newMessage", handleNewMessage);
    };
  }, [
    socket,
    myId,
    showChatPanel,
    activeConversation?._id,
  ]);

  // ============================================================
  // Search
  // ============================================================

  const searchQueryFromChild = async (query) => {
    try {
      const searchTerm =
        typeof query === "string"
          ? query
          : query?.name || query?.email || "";

      if (!searchTerm.trim()) {
        toast.warning("Please enter a name or email to search.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/v1/users/one/${encodeURIComponent(searchTerm)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const res = await response.json();

      if (!res?.success) {
        toast.warning(res?.message || "User not found.");
        return;
      }

      const searchedUser = res?.data;

      if (!searchedUser?._id) {
        toast.warning("User not found.");
        return;
      }

      if (String(searchedUser._id) === String(myId)) {
        toast.warning("You can't start a chat with yourself.");
        return;
      }

      setResult(searchedUser);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Failed to search user.");
    }
  };

  // ============================================================
  // Friend request response
  // ============================================================

  const handleResponseToFriendRequest = async (
    action,
    requestId
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v2/friend-request/respond`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            requestId,
            action,
          }),
        }
      );

      const res = await response.json();

      if (!res?.success) {
        toast.error(res?.message || "Failed to respond.");
        return;
      }

      if (action === "accepted") {
        const acceptedFriend = friendRequest.friends.find(
          (friend) => friend?.requestId === requestId
        );

        if (acceptedFriend) {
          setFriends((prev) => {
            const alreadyExists = prev.some(
              (friend) => friend?._id === acceptedFriend?._id
            );

            return alreadyExists
              ? prev
              : [...prev, acceptedFriend];
          });
        }
      }

      setFriendRequest((prev) => {
        const remaining = prev.friends.filter(
          (friend) => friend?.requestId !== requestId
        );

        return {
          newFriend: remaining.length > 0,
          friends: remaining,
        };
      });
    } catch (error) {
      console.error("Failed to respond to friend request:", error);
      toast.error("Something went wrong.");
    }
  };

  // ============================================================
  // Person card
  // ============================================================

  const renderPersonCard = (person, actions) => (
    <motion.div
      key={person?._id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <img
          src={avatarOf(person)}
          alt={nameOf(person)}
          className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-indigo-100"
        />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {nameOf(person)}
          </p>

          <p className="truncate text-xs text-slate-400">
            {emailOf(person) || "Student"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {actions}
      </div>
    </motion.div>
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="relative flex min-h-[560px] h-[calc(100vh-7.5rem)] w-full min-w-0 gap-6">

      {/* ========================================================
          Messages
      ======================================================== */}

      <aside
        className={`
          flex w-72 shrink-0 flex-col overflow-hidden
          rounded-2xl border border-slate-200/80
          bg-white shadow-sm
          ${showChatPanel ? "hidden lg:flex" : "flex"}
        `}
      >
        <MessagesContainer
          activeConversationId={
            showChatPanel
              ? activeConversation?._id
              : null
          }
          onSelectConversation={handleSelectConversation}
        />
      </aside>

      {/* ========================================================
          Friends
      ======================================================== */}

      <aside
        className={`
          flex w-72 shrink-0 flex-col overflow-hidden
          rounded-2xl border border-slate-200/80
          bg-white shadow-sm
          ${showChatPanel ? "hidden lg:flex" : "flex"}
        `}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
            <Users className="h-4 w-4 text-indigo-600" />
            Friends
          </h2>

          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
            {friends.length}
          </span>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {friends.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <UserPlus className="h-6 w-6" />
              </span>

              <p className="text-sm font-medium text-slate-400">
                No friends yet
              </p>

              <p className="px-4 text-xs text-slate-300">
                Send a friend request from the people list to start chatting.
              </p>
            </div>
          )}

          {friends.map((friend) => {
            const isActive =
              showChatPanel &&
              activeConversation?._id === friend?._id;

            return (
              <button
                key={friend?._id}
                onClick={() => openChatWith(friend)}
                className={`
                  flex w-full cursor-pointer items-center gap-3
                  rounded-xl p-2.5 text-left transition-all
                  ${isActive
                    ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-700 hover:bg-indigo-50"
                  }
                `}
              >
                <img
                  src={avatarOf(friend)}
                  alt={nameOf(friend)}
                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-indigo-100"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {nameOf(friend)}
                  </p>

                  <p
                    className={`truncate text-xs ${isActive
                        ? "text-indigo-100"
                        : "text-slate-400"
                      }`}
                  >
                    Tap to chat
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ========================================================
          Right Content
      ======================================================== */}

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

        <AnimatePresence mode="wait" initial={false}>

          {!showChatPanel || !activeConversation ? (
            <motion.div
              key="people"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-0 flex-1 flex-col"
            >

              {/* People header */}

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                    <MessageCircle className="h-4 w-4 text-indigo-600" />
                    Start a conversation
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Search for someone or pick from everyone on the platform.
                  </p>
                </div>

                <SearchDialog
                  data={(Array.isArray(data) ? data : []).filter(
                    (user) => user?._id !== myId
                  )}
                  searchCriteria={["name", "email"]}
                  onQuery={searchQueryFromChild}
                  placeholderValue="Search user by name or email"
                />
              </div>

              {/* People grid */}

              <div className="mt-4 grid flex-1 auto-rows-min grid-cols-1 gap-4 overflow-y-auto px-5 pb-5 pr-4 sm:grid-cols-2 xl:grid-cols-3">

                {result &&
                  renderPersonCard(
                    result,
                    <>
                      <FriendRequestButton
                        senderId={myId}
                        receiverId={result?._id}
                      />

                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => openChatWith(result)}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Message
                      </Button>
                    </>
                  )}

                {users.map((user) => {
                  if (String(myId) === String(user?._id)) {
                    return null;
                  }

                  return renderPersonCard(
                    user,
                    <>
                      <FriendRequestButton
                        senderId={myId}
                        receiverId={user?._id}
                      />

                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => openChatWith(user)}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Message
                      </Button>
                    </>
                  );
                })}

                {loading && (
                  <div className="col-span-full flex items-center justify-center gap-2 py-4 text-sm text-slate-400">
                    <LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" />
                    Loading people…
                  </div>
                )}

                {hasMore && (
                  <div
                    ref={ref}
                    className="col-span-full h-4"
                  />
                )}

              </div>
            </motion.div>
          ) : (

            /* ==================================================
               Chat panel
               ================================================== */

            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="flex min-h-0 flex-1 flex-col"
            >

              {/* Chat header */}

              <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-4 text-white">

                <div className="flex min-w-0 items-center gap-3">

                  <button
                    onClick={closeChat}
                    className="cursor-pointer rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
                    title="Back to people"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <img
                    src={avatarOf(activeConversation)}
                    alt={nameOf(activeConversation)}
                    className="h-10 w-10 shrink-0 rounded-full border-2 border-white/40 object-cover"
                  />

                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold">
                      {nameOf(activeConversation)}
                    </p>

                    <p className="truncate text-xs text-indigo-100">
                      {emailOf(activeConversation) || "Student"}
                    </p>
                  </div>

                </div>

                <button
                  onClick={closeChat}
                  title="Close conversation"
                  className="cursor-pointer rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* ChatBox */}

              <div className="min-h-0 flex-1">
                <ChatBox
                  isOpen={showChatPanel}
                  onClose={closeChat}
                  user={activeConversation}
                  currentUser={currentUser}
                />
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </section>

      {/* ========================================================
          Friend requests
          ======================================================== */}

      {friendRequest.newFriend && !showChatPanel && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <Card className="pointer-events-auto w-full max-w-3xl border-amber-200/70 bg-amber-50/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-sm font-bold text-slate-900">
                Friend requests
              </h2>

              <button
                onClick={() =>
                  setFriendRequest({
                    newFriend: false,
                    friends: [],
                  })
                }
                className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-white/70 hover:text-slate-700"
                title="Close friend requests"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              {friendRequest.friends.map((friend) => (
                <div
                  key={friend?.requestId || friend?._id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 pr-4 shadow-sm"
                >
                  <img
                    src={avatarOf(friend)}
                    alt={nameOf(friend)}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100"
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {nameOf(friend)}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                      {emailOf(friend)}
                    </p>
                  </div>

                  <div className="ml-2 flex items-center gap-2">
                    <button
                      title="Accept"
                      onClick={() =>
                        handleResponseToFriendRequest(
                          "accepted",
                          friend?.requestId
                        )
                      }
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600"
                    >
                      <Check className="h-4 w-4" />
                    </button>

                    <button
                      title="Decline"
                      onClick={() =>
                        handleResponseToFriendRequest(
                          "rejected",
                          friend?.requestId
                        )
                      }
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}