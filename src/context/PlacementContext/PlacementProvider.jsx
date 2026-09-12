import { useEffect, useState } from "react";
import { PlacementContext } from "./PlacementContext";
const API_URL = import.meta.env.VITE_API_URL;

export const PlacementDataProvider = ({ children }) => {
  const [placements, setPlacements] = useState([]);
  const [loadingPlacements, setLoadingPlacements] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function getData() {
      try {
        setLoadingPlacements(true);
        const res = await fetch(`${API_URL}/api/v2/placements?page=1&limit=100`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json'
          },
        });
        const response = await res.json();
        if (!cancelled) {
          // v2 paginates: the placements live under response.data.data
          setPlacements(Array.isArray(response?.data?.data) ? response.data.data : []);
        }
      } catch (err) {
        console.error("Failed to fetch placements", err);
      } finally {
        if (!cancelled) setLoadingPlacements(false);
      }
    }
    getData();
    return () => { cancelled = true; };
  }, []);

  return (
    <PlacementContext.Provider value={{ placements, setPlacements, loadingPlacements }}>
      {children}
    </PlacementContext.Provider>
  )
}
