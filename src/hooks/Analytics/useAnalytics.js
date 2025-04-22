import { useEffect, useState } from "react";
import axios from "axios";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

const useFetchData = (endpoint) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { accessToken } = useUserData();

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}${endpoint}`, {
                    withCredentials: 'include',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    }
                });
                if (response.data?.data) {
                    setData(response.data.data); 
                } else {
                    setData(response.data); 
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [endpoint, accessToken]);

    return { data, loading, error };
};

export const useUserCountByRole = () =>
    useFetchData("/api/v1/analytics/user-count-by-role");

export const useStudentsPerDepartment = () =>
    useFetchData("/api/v1/analytics/students-per-department");

export const useSelectedStudentsPerDepartment = () =>
    useFetchData("/api/v1/analytics/selected-student-per-department");

export const usePlacementsCreatedPerMonth = () =>
    useFetchData("/api/v1/analytics/placement-created-per-month");

export const useApplicationsPerMonth = () =>
    useFetchData("/api/v1/analytics/applications-per-month");

export const useApplicationStatusSummary = () =>
    useFetchData("/api/v1/analytics/application-status-summary");

export const useResumeUploadStats = () =>
    useFetchData("/api/v1/analytics/resume-upload-statistics");

export const useStudentsByLocation = () =>
    useFetchData("/api/v1/analytics/student-by-location");

export const useStudentApprovalStats = () =>
    useFetchData("/api/v1/analytics/student-approval-statistics");

export const useTopActiveStudents = () =>
    useFetchData("/api/v1/analytics/top-active-students");

export const useTotalStudents = () => 
    useFetchData("/api/v1/analytics/total-users");

export const useTotalPlacements = () =>
    useFetchData("/api/v1/analytics/total-placements");

export const useTotalApplications = () =>
    useFetchData("/api/v1/analytics/total-applications");