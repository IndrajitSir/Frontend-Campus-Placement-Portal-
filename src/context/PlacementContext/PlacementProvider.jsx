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
        const res = await fetch(`${API_URL}/api/v1/placements`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json'
          },
        });
        const response = await res.json();
        if (!cancelled) {
          setPlacements(response?.data || []);
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
