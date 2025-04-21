import { useEffect, useState } from "react";
import { PlacementContext } from "./PlacementContext";
const API_URL = import.meta.env.VITE_API_URL;

export const PlacementDataProvider = ({ children }) => {
  const [placements, setPlacements] = useState([]);

  useEffect(() => {
    async function getData() { //get all placements
      const res = await fetch(`${API_URL}/api/v1/placements`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        },
      })
      const response = await res.json();
      setPlacements(response?.data);
    }
    getData();
  }, []);
  return (
    <>
      <PlacementContext.Provider value={{ placements, setPlacements }}>
        {children}
      </PlacementContext.Provider>
    </>
  )
}