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
import SearchDialog from "../../Dialog/Search_Dialog/SearchDialog.jsx";

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
  Sparkles,
} from "lucide-react";

// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

const DEFAULT_AVATAR = "/defaultUserAvatar.jpeg";

// ============================================================
// Design tokens (kept local so no tailwind.config changes are
// required — "brand" from the Stitch export maps 1:1 onto the
// default Tailwind "violet" scale).
// ============================================================
const PANEL_SHADOW =
  "shadow-[0_4px_20px_-2px_rgba(124,58,237,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)]";
const CARD_SHADOW =
  "shadow-[0_1px_3px_rgba(0,0,0,0.03),0_3px_8px_rgba(124,58,237,0.02)]";

const DIRECTORY_FILTERS = [
  "All Students",
  "Computer Science",
  "Design & Arts",
  "Business",
  "Faculty",
];

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
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [peopleLoading, setPeopleLoading] = useState(false);
  // ---------- Friend requests ----------
  const [friendRequest, setFriendRequest] = useState({
    newFriend: false,
    friends: [],
  });

  // ---------- UI-only state (design layer) ----------
  const [activeFriendsTab, setActiveFriendsTab] = useState("all"); // "all" | "online" | "requests"
  const [activeFilter, setActiveFilter] = useState(DIRECTORY_FILTERS[0]); // decorative until backend exposes a category field

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

    const fetchFriendsAndRequests = async () => {
      try {
        setFriendsLoading(true);
        setPeopleLoading(true);

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        };
        const [resFriends, resIncoming] = await Promise.all([
          fetch(`${API_URL}/api/v2/friend-request/friends`, {
            method: "GET",
            credentials: "include",
            headers,
          }),

          fetch(`${API_URL}/api/v2/friend-request/incoming`, {
            method: "GET",
            credentials: "include",
            headers,
          }),
        ]);

        const [dataFriends, dataIncoming] = await Promise.all([
          resFriends.json(),
          resIncoming.json(),
        ]);

        if (cancelled) return;

        // ---------------- Friends ----------------
        if (!resFriends.ok || !dataFriends?.success) {
          throw new Error(
            dataFriends?.message || "Failed to fetch friends"
          );
        }

        const normalizedFriends = (
          Array.isArray(dataFriends?.data)
            ? dataFriends.data
            : []
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

        setFriends(normalizedFriends);
        setFriendsLoading(false);
        // ---------------- Incoming requests ----------------
        if (
          dataIncoming?.success &&
          Array.isArray(dataIncoming?.data)
        ) {
          const pendingRequests = dataIncoming.data
            .map((request) => ({
              requestId: request?._id,
              sender: request?.sender,
            }))
            .filter((request) => request?.sender?._id);

          setFriendRequest({
            newFriend: pendingRequests.length > 0,
            friends: pendingRequests,
          });
        }
        setPeopleLoading(false);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to fetch friends & requests:",
            error
          );

          toast.error(
            error?.message || "Failed to load friends and requests."
          );
        }
      } finally {
        if (!cancelled) {
          setPeopleLoading(false);
          setFriendsLoading(false);
        }
      }
    };

    fetchFriendsAndRequests();

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
        const acceptedRequest = friendRequest.friends.find(
          (req) => req?.requestId === requestId
        );

        if (acceptedRequest?.sender) {
          const newFriend = {
            ...acceptedRequest.sender,
            requestId: acceptedRequest.requestId,
          };
          setFriends((prev) => {
            const alreadyExists = prev.some(
              (friend) => friend?._id === newFriend?._id
            );

            return alreadyExists
              ? prev
              : [...prev, newFriend];
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

      toast.success(
        action === "accepted"
          ? "Friend request accepted!"
          : "Friend request declined."
      );
    } catch (error) {
      console.error("Failed to respond to friend request:", error);
      toast.error("Something went wrong.");
    }
  };

  // ============================================================
  // Derived values (design layer)
  // ============================================================

  // A single not-yet-friended person to spotlight in the Friends
  // panel. Purely a client-side pick from what's already loaded —
  // no dedicated "suggestions" endpoint exists yet.
  const suggestedPeer = users.find(
    (user) =>
      user?._id &&
      user._id !== myId &&
      !friends.some((friend) => friend?._id === user._id)
  );

  // ============================================================
  // Person card
  // ============================================================

  const renderPersonCard = (person, actions) => (
    <motion.div
      key={person?._id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.04] p-3 ${CARD_SHADOW} transition-all duration-200 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-500/30`}
    >
      <div>
        <div className="mb-2.5 flex items-center space-x-2.5">
          <img
            src={avatarOf(person)}
            alt={nameOf(person)}
            className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-white/15"
          />

          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
              {nameOf(person)}
            </p>

            <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
              {emailOf(person) || "Student"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-white/10 pt-2">
        {actions}
      </div>
    </motion.div>
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="relative flex min-h-[560px] h-[calc(100vh-7.5rem)] w-full min-w-0 gap-5">
      {/* Custom scrollbars — scoped, no tailwind.config changes needed */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ========================================================
          Messages
      ======================================================== */}

      <aside
        className={`
          flex w-72 shrink-0 flex-col overflow-hidden
          rounded-2xl border border-slate-200/80 dark:border-white/10
          bg-white dark:bg-[#0d1322] ${PANEL_SHADOW}
          ${showChatPanel ? "hidden lg:flex" : "flex"}
        `}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] p-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-lg bg-violet-50 dark:bg-violet-500/15 p-1.5 text-violet-600 dark:text-violet-400">
              <MessageCircle className="h-4 w-4" />
            </div>
            <h2 className="font-display text-sm font-bold text-slate-800 dark:text-slate-100">
              Messages
            </h2>
          </div>

          <span className="rounded-full bg-violet-100/80 dark:bg-violet-500/15 px-2 py-0.5 text-xs font-bold text-violet-700 dark:text-violet-300 ring-1 ring-inset ring-violet-600/10 dark:ring-violet-400/20">
            {friends.length}
          </span>
        </div>

        {/* Quick access strip — built from real friends, not mock data */}
        {friends.length > 0 && (
          <div className="border-b border-slate-100 dark:border-white/10 bg-slate-50/30 dark:bg-white/[0.02] px-3 py-2">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Quick access
            </div>
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-0.5">
              {friends.slice(0, 10).map((friend) => (
                <button
                  key={friend?._id}
                  type="button"
                  onClick={() => openChatWith(friend)}
                  className="group flex flex-shrink-0 cursor-pointer flex-col items-center"
                >
                  <img
                    src={avatarOf(friend)}
                    alt={nameOf(friend)}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-white/15 transition group-hover:ring-violet-300 dark:group-hover:ring-violet-500/40"
                  />
                  <span className="mt-0.5 max-w-[40px] truncate text-[9px] text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                    {nameOf(friend).split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation list — MessagesContainer owns its own empty state */}
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
          <MessagesContainer
            activeConversationId={
              showChatPanel
                ? activeConversation?._id
                : null
            }
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Panel footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] p-3 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Instant Messenger
          </span>
        </div>
      </aside>

      {/* ========================================================
          Right Content
      ======================================================== */}

      <section className={`flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0d1322] ${PANEL_SHADOW}`}>

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

              <div className="border-b border-slate-100 dark:border-white/10 p-4 sm:p-5">
                <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-lg bg-violet-50 dark:bg-violet-500/15 p-1.5 text-violet-600 dark:text-violet-400">
                        <MessageCircle className="h-4 w-4" />
                      </span>
                      <h1 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                        Start a conversation
                      </h1>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Search for someone or pick from everyone on the platform.
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-400/20">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    {users.length}+ People
                  </span>
                </div>

                {/* Search */}
                {/* <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <SearchDialog
                      data={(Array.isArray(data) ? data : []).filter(
                        (user) => user?._id !== myId
                      )}
                      searchCriteria={["name", "email"]}
                      onQuery={searchQueryFromChild}
                      placeholderValue="Search user by name or email"
                    />
                  </div>
                </div> */}

                {/* Quick filter chips — visual grouping only until the
                    backend exposes a category/major field to filter on */}
                <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto pb-0.5 text-xs">
                  <span className="whitespace-nowrap text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    Filter by:
                  </span>
                  {DIRECTORY_FILTERS.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 transition-colors ${activeFilter === filter
                        ? "border border-violet-200/60 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/15 font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-500/25"
                        : "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                        }`}
                    >
                      {filter}
                    </button>
                  ))}
                  <span className="ml-auto whitespace-nowrap text-[11px] font-medium text-slate-400">
                    <SearchDialog data={(Array.isArray(data) ? data : []).filter(
                      (user) => user?._id !== myId
                    )} onQuery={searchQueryFromChild} placeholderValue="Search user by name and email" />
                  </span>
                </div>
              </div>

              {/* People grid */}

              <div className="custom-scrollbar grid flex-1 auto-rows-min grid-cols-1 gap-4 overflow-y-auto bg-slate-50/50 dark:bg-white/[0.02] px-5 py-4 sm:grid-cols-2">

                {result &&
                  renderPersonCard(
                    result,
                    <>
                      <FriendRequestButton
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

                {(() => {
                  const filtered = users.filter((u) => {
                    if (!u || String(myId) === String(u._id)) return false;
                    const role = (u.role || u.student_id?.role || "").toLowerCase();
                    const dept = (u.department || u.student_id?.department || u.branch || u.student_id?.branch || "").toLowerCase();
                    const email = (u.email || u.student_id?.email || "").toLowerCase();

                    if (activeFilter === "All Students") {
                      return role === "student" || role === "" || !u.role;
                    }
                    if (activeFilter === "Faculty") {
                      return role === "placement_staff" || role === "admin" || role === "faculty" || role === "staff";
                    }
                    if (activeFilter === "Computer Science") {
                      return dept.includes("computer") || dept.includes("cs") || dept.includes("it") || dept.includes("tech") || email.includes("cs");
                    }
                    if (activeFilter === "Design & Arts") {
                      return dept.includes("design") || dept.includes("art") || dept.includes("ui") || dept.includes("ux");
                    }
                    if (activeFilter === "Business") {
                      return dept.includes("business") || dept.includes("mba") || dept.includes("management") || dept.includes("finance");
                    }
                    return true;
                  });

                  const listToDisplay = filtered.length > 0 ? filtered : users.filter(u => String(myId) !== String(u?._id));

                  return listToDisplay.map((user) =>
                    renderPersonCard(
                      user,
                      <>
                        <FriendRequestButton
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
                    )
                  );
                })()}

                {loading && (
                  <div className="col-span-full flex items-center justify-center gap-2 py-4 text-sm text-slate-400">
                    <LoaderCircle className="h-4 w-4 animate-spin text-violet-500" />
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

              {/* Directory footer — reflects real infinite-scroll state
                  rather than a fake numbered pager */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Showing {users.length} {users.length === 1 ? "person" : "people"}
                </span>
                <span>
                  {loading
                    ? "Loading more…"
                    : hasMore
                      ? "Scroll for more"
                      : "You've reached the end"}
                </span>
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

              <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 px-5 py-4 text-white">

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
          Friends & Network
      ======================================================== */}

      <aside
        className={`
          flex w-72 shrink-0 flex-col overflow-hidden
          rounded-2xl border border-slate-200/80 dark:border-white/10
          bg-white dark:bg-[#0d1322] ${PANEL_SHADOW}
          ${showChatPanel ? "hidden lg:flex" : "flex"}
        `}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] p-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/15 p-1.5 text-indigo-600 dark:text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="font-display text-sm font-bold text-slate-800 dark:text-slate-100">
              Friends &amp; Network
            </h2>
          </div>

          <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-500/10 dark:ring-indigo-400/20">
            {activeFriendsTab === "requests" ? friendRequest.friends.length : friends.length}
          </span>
        </div>

        {/* Sub tabs */}
        <div className="flex border-b border-slate-100 dark:border-white/10 bg-white dark:bg-transparent px-3 pt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setActiveFriendsTab("all")}
            className={`px-2.5 pb-2 ${activeFriendsTab === "all"
              ? "border-b-2 border-violet-600 dark:border-violet-400 font-semibold text-violet-600 dark:text-violet-400"
              : "hover:text-slate-700 dark:hover:text-slate-200"
              }`}
          >
            All ({friends.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFriendsTab("online")}
            className={`px-2.5 pb-2 ${activeFriendsTab === "online"
              ? "border-b-2 border-violet-600 dark:border-violet-400 font-semibold text-violet-600 dark:text-violet-400"
              : "hover:text-slate-700 dark:hover:text-slate-200"
              }`}
          >
            Online ({friends.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFriendsTab("requests")}
            className={`flex items-center gap-1.5 px-2.5 pb-2 ${activeFriendsTab === "requests"
              ? "border-b-2 border-violet-600 dark:border-violet-400 font-semibold text-violet-600 dark:text-violet-400"
              : "hover:text-slate-700 dark:hover:text-slate-200"
              }`}
          >
            <span>Requests ({friendRequest.friends.length})</span>
            {friendRequest.friends.length > 0 && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="custom-scrollbar flex flex-1 flex-col justify-between overflow-y-auto p-3.5">
          <div className="space-y-2">
            {activeFriendsTab === "all" && (
              friends.length === 0 ? (
                <div className="mb-3 flex flex-col items-center justify-center rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-4 text-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 shadow-inner">
                    <UserPlus className="h-6 w-6 opacity-75" />
                  </div>
                  <h3 className="mb-1 text-xs font-semibold text-slate-800 dark:text-slate-100">
                    No friends added yet
                  </h3>
                  <p className="max-w-[210px] text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                    Send friend requests to connect with classmates, mentors, and study partners.
                  </p>
                </div>
              ) : (
                friends.map((friend) => {
                  const isActive =
                    showChatPanel &&
                    activeConversation?._id === friend?._id;

                  return (
                    <button
                      key={friend?._id}
                      type="button"
                      onClick={() => openChatWith(friend)}
                      className={`
                        flex w-full cursor-pointer items-center gap-3
                        rounded-xl p-2.5 text-left transition-all
                        ${isActive
                          ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/25"
                          : "text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-white/[0.06]"
                        }
                      `}
                    >
                      <img
                        src={avatarOf(friend)}
                        alt={nameOf(friend)}
                        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {nameOf(friend)}
                        </p>

                        <p
                          className={`truncate text-xs ${isActive ? "text-indigo-100" : "text-slate-400"
                            }`}
                        >
                          Tap to chat
                        </p>
                      </div>
                    </button>
                  );
                })
              )
            )}

            {activeFriendsTab === "online" && (
              friends.length === 0 ? (
                <div className="mb-3 flex flex-col items-center justify-center rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-4 text-center">
                  <h3 className="mb-1 text-xs font-semibold text-slate-800 dark:text-slate-100">
                    No friends online right now
                  </h3>
                  <p className="max-w-[210px] text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                    Check back later or message your friends from the All tab.
                  </p>
                </div>
              ) : (
                friends.map((friend) => {
                  const isActive =
                    showChatPanel &&
                    activeConversation?._id === friend?._id;

                  return (
                    <button
                      key={friend?._id}
                      type="button"
                      onClick={() => openChatWith(friend)}
                      className={`
                        flex w-full cursor-pointer items-center gap-3
                        rounded-xl p-2.5 text-left transition-all
                        ${isActive
                          ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/25"
                          : "text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-white/[0.06]"
                        }
                      `}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={avatarOf(friend)}
                          alt={nameOf(friend)}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                        />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {nameOf(friend)}
                        </p>

                        <p
                          className={`truncate text-xs ${isActive ? "text-indigo-100" : "text-emerald-600 font-medium"
                            }`}
                        >
                          Online now
                        </p>
                      </div>
                    </button>
                  );
                })
              )
            )}

            {activeFriendsTab === "requests" && (
              friendRequest.friends.length === 0 ? (
                <div className="mb-3 flex flex-col items-center justify-center rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-4 text-center">
                  <h3 className="mb-1 text-xs font-semibold text-slate-800 dark:text-slate-100">
                    No pending requests
                  </h3>
                  <p className="max-w-[210px] text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                    New friend requests will show up here.
                  </p>
                </div>
              ) : (
                friendRequest.friends.map((friend) => {
                  const sender = friend?.sender;

                  return (
                    <Card
                      key={friend?.requestId}
                      className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] p-3 shadow-sm"
                    >
                      <img
                        src={avatarOf(sender)}
                        alt={nameOf(sender)}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-500/25"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {nameOf(sender)}
                        </p>

                        <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                          {emailOf(sender)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          title="Accept"
                          onClick={() => handleResponseToFriendRequest(
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
                    </Card>
                  );
                })
              )
            )}
          </div>

          {/* Suggested peer spotlight — a real not-yet-friended user,
              not mock data */}
          {suggestedPeer && (
            <div className={`mt-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] p-3 ${CARD_SHADOW}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Suggested Peer
                </span>
              </div>

              <div className="mb-2.5 flex items-center space-x-2.5">
                <img
                  src={avatarOf(suggestedPeer)}
                  alt={nameOf(suggestedPeer)}
                  className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-white/15"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {nameOf(suggestedPeer)}
                  </div>
                  <div className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                    {emailOf(suggestedPeer) || "Student"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <FriendRequestButton
                  receiverId={suggestedPeer?._id}
                />

                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  onClick={() => openChatWith(suggestedPeer)}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Quick Connect
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Panel footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] p-3 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="font-medium text-slate-500">Campus Directory</span>
        </div>
      </aside>

    </div>
  );
}