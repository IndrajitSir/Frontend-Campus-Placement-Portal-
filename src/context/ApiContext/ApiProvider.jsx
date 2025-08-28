import { ApiContext } from "./ApiContext";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
import { toast } from "react-toastify";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

export const ApiProvider = ({ children }) => {
    const { accessToken } = useUserData();
    const getUserById = async (userId) => {
        const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
            method: "GET",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
        });
        const res = await response.json();
        if (!res.success) { toast.warn(res.message); }
        return res?.data || {};
    }
    return (
        <>
            <ApiContext.Provider value={{ getUserById }}>
                {children}
            </ApiContext.Provider>
        </>
    )
}