import { useState, useEffect, useRef } from "react";
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
  // Capture the token state at mount time so the one-time auth check below
  // doesn't re-run on every context update.
  const tokenAtMount = useRef(accessToken);

  useEffect(() => {
    let active = true;
    const checkAuth = async () => {
      // Fresh page load / expired session -> restore the session first.
      if (!tokenAtMount.current) {
        await fetchUserData();
      }
      if (active) setLoading(false);
    };
    checkAuth();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <CircleLoader />;
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Home />;
};

export default ProtectedRoute;

export function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="p-4 bg-red-100 border border-red-400 rounded">
      <p className="font-bold text-red-700">Something went wrong:</p>
      <pre className="text-red-600 whitespace-pre-wrap">{error.message}</pre>
      <button onClick={resetErrorBoundary} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">
        Try again
      </button>
    </div>
  );
}
