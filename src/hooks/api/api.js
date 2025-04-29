// import { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// // CONTEXT api
// import { useUserData } from "../../context/AuthContext/AuthContext";
// // Environment variable
// const API_URL = import.meta.env.VITE_API_URL;

// export const useFilteredUser = (query) => {
//   const { accessToken } = useUserData();
//   const [filteredUser, setFilteredUser] = useState(null);

//   useEffect(() => {
//     if (!query) return;

//     const fetchData = async () => {
//       try {
//         const res = await fetch(`${API_URL}/api/v1/users/one/${query?.name}`, {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${accessToken}`
//           },
//         });

//         const response = await res.json();
//         if (!response.success) {
//           toast.warning(response.message);
//         } else {
//           setFilteredUser(response.data);
//         }
//       } catch (err) {
//         console.error("Error fetching user:", err);
//       }
//     };

//     fetchData();
//   }, [query, accessToken]);

//   return filteredUser;
// };

// export const useGetDataV3 = (page, userStatus) => {
//   const { accessToken } = useUserData();
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(false);
//   console.log(`API endpoint: ${API_URL}/api/v3/applications/${userStatus}-candidates?page=${page}&limit=9`);
//   console.log("Access Token: ", accessToken);
//   console.log("User Status: ", userStatus);
//   useEffect(() => {
//     if (!accessToken) return;
//     const fetch = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`${API_URL}/api/v3/applications/${userStatus}-candidates?page=${page}&limit=9`, {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${accessToken}`
//           },
//         });
//         const response = await res.json();
//         if (!response.success) {
//           throw new Error(response.message);
//         }
//         if (response?.data?.candidates?.length > 0) {
//           setApplications(response.data.candidates);
//         }
//       } catch (error) {
//         console.error("Error fetching candidates: ", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     const timeout = setTimeout(() => {
//       fetch();
//     }, 100);
//     return () => clearTimeout(timeout)
//   }, [page, accessToken, userStatus]);
//   return { applications, loading };
// };