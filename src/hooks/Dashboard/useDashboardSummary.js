import { useCallback, useEffect, useState } from "react";
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Loads the role-scoped dashboard summary from the API.
 *
 * The endpoint enforces the role server-side; the client only renders what it
 * receives. `refresh` is exposed so an error state can retry without a reload.
 */
export const useDashboardSummary = () => {
  const { accessToken } = useUserData();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/dashboard/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const response = await res.json();
      if (!res.ok || !response?.success) {
        throw new Error(response?.message || "Unable to load your dashboard");
      }
      setData(response.data);
    } catch (err) {
      console.error("Dashboard summary fetch failed", err);
      setError(err?.message || "Unable to load your dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
};
