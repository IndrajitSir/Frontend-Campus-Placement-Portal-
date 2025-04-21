import { createContext, useContext } from "react";
export const PlacementContext = createContext();
export const usePlacementData = () => useContext(PlacementContext);