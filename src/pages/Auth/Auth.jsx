import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Toast container
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
// Icons
import { FaGoogle } from 'react-icons/fa';
import { FaGithub } from 'react-icons/fa';
// Framer Motion
import { motion } from "framer-motion";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

function Auth() {
  const [loginInfo, setloginInfo] = useState({ email: "", password: "" });
  const [signupInfo, setSignupInfo] = useState({ name: "", email: "", password: "", role: "student" });
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const [isLogin, setIsLogin] = useState(isLoginPage);
  const { role, setRole, setAccessToken, setRefreshToken, setUserInfo } = useUserData();// -- from CONTEXT API

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginInfo)
      });

      const response = await res.json();
      console.log("Login response: " + JSON.stringify(response) + " and user: " + JSON.stringify(response?.data?.user));
      if (!response?.success) {
        toast.error(response?.message || "Something went wrong!");
      }
      console.log("User role after login: " + response?.data?.user?.role);
      setRole(response?.data?.user?.role);
      setAccessToken(response?.data?.accessToken);
      setRefreshToken(response?.data?.refreshToken);
      setUserInfo(response?.data?.user);
      toast.success("Login successful!");
      console.log("User role set in context: " + response?.data?.user?.role);
      if (!response?.data?.user?.role) { navigate("/") }
      if (response?.data?.user?.role === "student") {
        navigate("/home");
      } else {
        console.log("Navigating to dashboard for role: " + response?.data?.user?.role);
        navigate("/home/dashboard");
      }

    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupInfo)
      });

      const response = await res.json();
      if (!response.success) {
        toast.error(response.message || "Something went wrong!");
      }
      setRole(response?.data.user.role);
      setAccessToken(response?.data.accessToken);
      setRefreshToken(response?.data.refreshToken);
      setUserInfo(response?.data.user);
      toast.success("Registration successful!");
      if (response?.data.user.role === "student") {
        navigate("/home");
      } else {
        navigate("/home/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error("Registration failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/v1/auth/google`;
  }

  const handleGithubLogin = () => {
    window.location.href = `${API_URL}/api/v1/auth/github`;
  }

  useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location.pathname]);

  const handleToggle = (login) => {
    setIsLogin(login);
    navigate(login ? "/login" : "/register");
  }
  const handleChangeSignup = (e) => {
    console.log(e.target.value);
    setSignupInfo({ ...signupInfo, [e.target.name]: e.target.value });
  };
  const handleChangelogin = (e) => {
    setloginInfo({ ...loginInfo, [e.target.name]: e.target.value });
  }
  const handleRolechange = (e) => {
    setSignupInfo({ ...signupInfo, role: e.target.value });
  }

  return (
    <motion.div className="flex h-screen w-full bg-white"
      key={isLogin ? "login" : "signup"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Left Section: Form */}
      <ToastContainer position="top-left" autoClose={3000} />
      <div className="w-1/2 flex flex-col justify-center items-center p-10">
        <div className="flex space-x-4 mb-6">
          <motion.button
            className={`px-6 py-2 border rounded cursor-pointer ${isLogin ? "bg-pink-500 text-white" : "border-pink-500 text-pink-500"}`}
            onClick={() => handleToggle(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ backgroundColor: isLogin ? "#ec4899" : "#ffffff", color: isLogin ? "#ffffff" : "#ec4899" }}
            transition={{ duration: 0.3 }}
          >
            Log in
          </motion.button>
          <motion.button
            className={`px-6 py-2 border rounded cursor-pointer ${!isLogin ? "bg-pink-500 text-white" : "border-pink-500 text-pink-500"}`}
            onClick={() => handleToggle(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ backgroundColor: !isLogin ? "#ec4899" : "#ffffff", color: !isLogin ? "#ffffff" : "#ec4899" }}
            transition={{ duration: 0.3 }}
          >
            Sign up
          </motion.button>
        </div>
        {
          isLogin ?
            <h2 className="text-2xl font-bold mb-4">Welcome<span className="text-pink-500"> Back</span></h2>
            :
            <h2 className="text-2xl font-bold mb-4">Begin<span className="text-pink-500"> Your Future</span></h2>
        }
        <div className="flex space-x-4 mb-4">
          <button className="border px-4 py-2 rounded cursor-pointer hover:bg-gray-300" onClick={handleGoogleLogin}><FaGoogle /></button>
          <button className="border px-4 py-2 rounded cursor-pointer hover:bg-gray-300" onClick={handleGithubLogin}><FaGithub /></button>
        </div>
        <div className="w-full max-w-sm">
          {!isLogin && <input type="text" name="name" value={signupInfo.name} placeholder="Username" className="border p-2 mb-2 w-full" onChange={handleChangeSignup} required />}
          <input type="email" name="email" value={isLogin ? loginInfo.email : signupInfo.email} placeholder="Email" className="border p-2 mb-2 w-full" onChange={isLogin ? handleChangelogin : handleChangeSignup} required />
          <input type="password" name="password" value={isLogin ? loginInfo.password : signupInfo.password} placeholder="Password" className="border p-2 mb-4 w-full" onChange={isLogin ? handleChangelogin : handleChangeSignup} required />
          {!isLogin &&
            <label htmlFor="student">Role:
              <input type="radio" name="role" id="student" value="student" className="ml-5" checked={signupInfo.role === "student"} onChange={handleRolechange} /><label htmlFor="student" className="ml-1">Student</label>
              {
                role === "admin" || role === "super_admin" &&
                <><input type="radio" name="role" id="placement_staff" value="placement_staff" checked={signupInfo.role === "placement_staff"} className="ml-7" onChange={handleRolechange} /><label htmlFor="placement_staff" className="ml-1">Placement Staff</label></>
              }
            </label>}
          <button className={`w-full bg-pink-500 text-white py-2 rounded cursor-pointer hover:bg-pink-400 ${!isLogin && "mt-2"}`} onClick={isLogin ? handleLogin : handleRegister}>Let's start</button>
        </div>
      </div>
      {/* Right Section: Image */}
      <motion.div
        key={isLogin ? "login-img" : "signup-img"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut", delay: 0.1 }}
        className="w-1/2 h-full bg-cover bg-center rounded" style={{
          backgroundImage: isLogin ? 'url("/study.jpg")' : 'url("/college.jpg")'

        }}></motion.div>
    </motion.div>
  )
}

export default Auth
