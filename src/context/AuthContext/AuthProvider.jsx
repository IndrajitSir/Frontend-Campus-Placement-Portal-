import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "./AuthContext";
const API_URL = import.meta.env.VITE_API_URL;

export const AuthCrediantialsProvider = ({ children }) => {
  const [role, setRole] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/users/current-user`, { method: "GET", credentials: "include", });
      console.log('fetching current-user data');

      const response = await res.json();
      setRole(response?.data.user.role);
      setAccessToken(response?.data.accessToken);
      setRefreshToken(response?.data.refreshToken);
      setUserInfo((prevUser) => ({
        ...prevUser,
        user: response?.data.user,
        student: response?.data.student
      }))
      console.log("User data fetched: ", response);
    } catch (error) {
      console.error("Session fetch error", error);
    } finally {
      setLoading(false); // Done loading
    }
  }
  const handleAvatarUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await axios.put(`${API_URL}/api/v1/student/upload-avatar`, formData, {
        credentials: "include",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`
        },
      });
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleResumeUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await axios.put(`${API_URL}/api/v1/student/upload-resume`, formData, {
        credentials: "include",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`
        },
      });
      if (!res.success) {
        toast.error(res.message);
        return false;
      } else {
        toast.success(res.message);
        return true;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleDeleteResume = async () => {
    try {
      const res = await axios.delete(`${API_URL}/api/v1/student/delete-resume`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <>
      <AuthContext.Provider value={{ role, setRole, accessToken, setAccessToken, refreshToken, setRefreshToken, userInfo, setUserInfo, fetchUserData, handleAvatarUpload, handleDeleteResume, handleResumeUpload, loading }}>
        {children}
      </AuthContext.Provider>
    </>
  )
}