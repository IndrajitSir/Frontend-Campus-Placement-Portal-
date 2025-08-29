import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
// CONTEXT api
import { useUserData } from "../context/AuthContext/AuthContext.jsx";
// Components
import CircleLoader from "../Components/Loader/CircleLoader.jsx";
// Pages
import Home from "../pages/Home/Home.jsx";

const ProtectedRoute = () => {
  const { accessToken, fetchUserData } = useUserData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await fetchUserData(); 
      setLoading(false); 
    };
    checkAuth();
  }, []);
  if (loading) return <CircleLoader/>; 
  if (!accessToken) return <Navigate to="/login" replace />;

  return <Home />;
};

export default ProtectedRoute;
