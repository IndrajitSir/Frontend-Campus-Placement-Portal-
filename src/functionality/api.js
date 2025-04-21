// import { toast } from "react-toastify";
// import { useEffect, useState } from "react";
// // CONTEXT api
// import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// // Environment variable
// const API_URL = import.meta.env.VITE_API_URL;
// export const searchQueryFromChild = (query) => {
//     const [filterdUser, setFilteredUser] = useState({});
//     const { accessToken } = useUserData();
//     useEffect(() => {
//         const fetch = async () => {
//             const res = await fetch(`${API_URL}/api/v1/users/one/${query?.name}`, {
//                 method: "GET",
//                 credentials: "include",
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${accessToken}`
//                 },
//             });
//             if (!res.ok) {
//                 console.log(res);
//             }
//             const response = await res.json();
//             if (!response.success) {
//                 toast.warning(response.message)
//             }
//             console.log("Specific users data:", response.data);
//             setFilteredUser(response.data);
//         }
//         fetch();
//     },[])
// }