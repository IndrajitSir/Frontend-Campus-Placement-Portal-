import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Public, unauthenticated placement counts used by the landing page.
 *
 * Returns `stats: null` while loading or when the API is unreachable — callers
 * must render a neutral placeholder rather than inventing numbers.
 */
export const usePublicStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/analytics/public-stats`);
        const response = await res.json();
        if (!res.ok || !response?.success) {
          throw new Error(response?.message || "Stats unavailable");
        }
        if (!cancelled) setStats(response.data);
      } catch (err) {
        if (!cancelled) {
          console.error("Public stats fetch failed", err);
          setError(err?.message || "Stats unavailable");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
};
