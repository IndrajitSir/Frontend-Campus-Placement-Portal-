import { useEffect, useState } from "react";
import { toast } from "react-toastify";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

export const useFilteredUser = (query) => {
  const { accessToken } = useUserData();
  const [filteredUser, setFilteredUser] = useState(null);

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
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
        if (!response.success) {
          toast.warning(response.message);
        } else {
          setFilteredUser(response.data);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchData();
  }, [query, accessToken]);

  return filteredUser;
};

export const useGetDataV3 = (page, userStatus) => {
    const { accessToken } = useUserData();
    const [applications, setApplications] = useState([]);
  
    useEffect(() => {
      const fetch = async () => {
        const res = await fetch(`${API_URL}/api/v3/applications/${userStatus}-candidates?page=${page}&limit=9`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
        });
        const response = await res.json();
        if (response?.data?.candidates?.length > 0) {
          setApplications(response.data.candidates);
        }
      };
      fetch();
    }, [page, accessToken, userStatus]);
  
    return applications;
  };