import { useEffect, useState } from "react"
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

function useAllUsersNameAndEmail() {
  const { accessToken } = useUserData();
  const [data, setData] = useState([]);
  const getdata = async () => {
    await fetch(`${API_URL}/api/v1/users/all-users-nameAndEmail`, {
      method: "GET",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    }).then((res) => res.json())
      .then((res) => setData(res.data))
      .catch((err) => console.error(`Error while fetching all users name and email: ${err}`))
  }
  useEffect(() => {
    getdata()
  }, []);

  return data;
}

export default useAllUsersNameAndEmail