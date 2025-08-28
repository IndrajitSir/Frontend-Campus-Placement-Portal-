import { useEffect, useState } from "react"
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

function useGetUserById(userId) {
  const { accessToken } = useUserData();
  const [user, setUser] = useState(null);
  const getdata = async () => {
    await fetch(`${API_URL}/api/v1/users/${userId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    }).then((res) => res.json())
      .then((res) => setUser(res.data))
      .catch((err) => console.error(`Error while fetching all users name and email: ${err}`))
  }
  useEffect(() => {
    getdata()
  }, []);

  return user;
}

export default useGetUserById