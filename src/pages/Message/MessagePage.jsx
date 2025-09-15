import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useInView } from 'react-intersection-observer';
// Shadcn Components
import { Button } from '../../Components/ui/button';
import { Card } from '../../Components/ui/card';
// components
import ChatBox from '../../Components/PersonalChat/ChatBox';
import FriendRequestButton from '../../Components/PersonalChat/FriendRequestButton';
import SearchDialog from '../../Dialog/Search_Dialog/SearchDialogUpdated.jsx';
import CircleLoader from '../../Components/Loader/CircleLoader.jsx';
// CONTEXT api
import { useUserData } from '../../context/AuthContext/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext/SocketContext.jsx';
import { useApi } from '../../context/ApiContext/ApiContext';
// Hooks
import useAllUsersNameAndEmail from '../../hooks/Users_Name_and_Email/useAllUsersNameAndEmail.js';
//Icons
import { Check, X } from 'lucide-react';
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

export default function NewMessagePage() {
  const [users, setUsers] = useState([]);
  const [result, setResult] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openChat, setOpenChat] = useState(false);
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/v2/users?page=${page}&limit=30`);
        const res = await response.json();
        if (res?.data?.users?.length === 0) {
          setHasMore(false);
          return;
        }
        setUsers(prev => [...prev, ...res?.data?.users]);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };

    if (hasMore) fetchUsers();
  }, [page]);

  useEffect(() => {
    if (inView && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [inView]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/v2/friend-request/${currentUser?.user?._id}`, {
          credentials: "include",
          method: "GET",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          }
        });
        const res = await response.json();
        if (!res?.success) { toast.error(res?.message); }
        setFriends(res?.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("friend:request", async (data) => {
      let friend = await getUserById(data?.senderId);
      // setFriends(prev => {
      //   const alreadyExists = prev.some(f => f._id === data.from);
      //   return alreadyExists ? prev : [...prev, { _id: data.from, user: friend }]
      // })
      let frnds = friendRequest.friends;
      friend["requestId"] = data?.requestId;
      frnds.push(friend);
      setFriendRequest({ newFriend: true, friends: frnds });
      toast.info(`${friend?.student_id?.name || friend?.name || "Unknown user"} sent you a friend request.`);
    });

    return () => socket.off("friend:request");
  }, [socket]);

  const searchQueryFromChild = async (query) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/users/one/${query?.name}`, {
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

  return (
    <div className="w-full min-h-screen flex overflow-hidden">
      {/* Friends Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r md:block">
        <h2 className="text-lg font-bold mb-2">Friends</h2>
        {
          Array.isArray(friends) && friends?.length === 0 &&
          <h2 className='text-gray-400 italic'>No frineds yet.</h2>
        }
        {
          Array.isArray(friends) && friends.map((friend) => (
            <>
              <Card key={friend?._id} className='h-5 flex relative mt-3 shadow-md cursor-pointer hover:shadow-lg transition-all' onClick={() => { setSelectedUser(friend); setOpenChat(true) }}>
                <img className="w-8 h-8 mx-auto border-4 border-white rounded-full absolute left-1 top-2" src={friend?.avatar || friend?.student_id?.avatar || "../../defaultUserAvatar.jpeg"} />
                <p className="font-semibold pl-3 absolute left-8 top-3">{friend?.name || friend?.student_id?.name || friend?.sender?.name === currentUser?.user?.name ? friend?.receiver?.name : friend?.sender?.name}</p>
              </Card>
            </>
          ))
        }
      </div>

      {/* Main Section */}
      <div className="flex-1 p-4 relative">
        <h1 className="text-xl font-bold mb-4">Start a New Message</h1>
        {/* Search + Friend Request */}
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex justify-between">
          {
            friendRequest.newFriend && (
              <div className='relative'>
                <h2 className="text-lg font-semibold mb-2">Friend Request</h2>
                <div className='flex items-center gap-x-5'>
                  {
                    friendRequest.friends.map((friend) => (
                      <Card key={friend?._id} className="p-3">
                        <div key={friend?._id} className='relative'>
                          <img className="w-8 h-8 mx-auto border-4 border-white rounded-full absolute left-1 top-2" src={friend?.student_id?.avatar || "../../defaultUserAvatar.jpeg"} />
                          <p className="font-semibold">{friend?.student_id?.name || friend?.name}</p>
                          <p className="text-sm text-gray-500">{friend?.student_id?.email || friend?.email}</p>
                          <div className='flex items-center gap-4 mt-2'>
                            <Button size={15} className="cursor-pointer bg-green-600 hover:bg-green-500" onClick={() => handleResponseToFriendRequest("accepted", friend?.requestId)}><Check /></Button>
                            <Button size={15} className="cursor-pointer bg-red-600 hover:bg-red-500" onClick={() => handleResponseToFriendRequest("rejected", friend?.requestId)}><X /></Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  }
                </div>
              </div>
            )
          }
          <SearchDialog data={data} searchCriteria={["name", "email"]} onQuery={searchQueryFromChild} placeholderValue="Search user by name or email" />
        </div>

        {/* Results and Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Searched result */}
          {result && (
            <div key={result?._id} className="p-3 border rounded bg-white flex justify-between items-center">
              <div>
                <p className="font-semibold">{result?.name}</p>
                <p className="text-sm text-gray-500">{result?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <FriendRequestButton senderId={currentUser} receiverId={result?._id} />
                {/* <button onClick={() => { setSelectedUser(result); setOpenChat(true) }}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 cursor-pointer">
                  Chat
                </button> */}
              </div>
            </div>
          )}

          {/* All users */}
          {users.map((user) => (
            currentUser?.user?.name !== user?.name &&
            <div key={user?._id} className="p-3 border rounded bg-white flex justify-between items-center">
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <FriendRequestButton senderId={currentUser?.user?._id} receiverId={user?._id} />
                {/* <button onClick={() => { setSelectedUser(user); setOpenChat(true); }}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 cursor-pointer">
                  Chat
                </button> */}
              </div>
            </div>
          ))}

          {loading && <CircleLoader />}
          {hasMore && <div ref={ref}><p><CircleLoader /></p></div>}
        </div>
        {/* Chat Box Overlay */}
        {
          openChat && selectedUser && (
            <div className='fixed top-9 right-0 w-full sm:w-[400px] h-full bg-white shadow-lg z-50 p-4'>
              <button onClick={() => setOpenChat(false)} className='text-red-600 text-sm float-right mb-2 cursor-pointer p-1 hover:bg-gray-300 rounded'><X size={18} /></button>
              <ChatBox isOpen={openChat} onClose={() => setOpenChat(false)} user={selectedUser} currentUser={currentUser} />
            </div>
          )}
      </div>
    </div>
  );
}
