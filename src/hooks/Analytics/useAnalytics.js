import { useEffect, useState } from "react";
import axios from "axios";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

const useFetchData = (endpoint, delayMs = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { accessToken } = useUserData();

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                // Add delay before fetching
                await new Promise((res) => setTimeout(res, delayMs));
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
    }, [endpoint, accessToken, delayMs]);

    return { data, loading, error };
};

export const useUserCountByRole = () =>
    useFetchData("/api/v1/analytics/user-count-by-role", 200);

export const useStudentsPerDepartment = () =>
    useFetchData("/api/v1/analytics/students-per-department", 300);

export const useSelectedStudentsPerDepartment = () =>
    useFetchData("/api/v1/analytics/selected-student-per-department", 400);

export const usePlacementsCreatedPerMonth = () =>
    useFetchData("/api/v1/analytics/placement-created-per-month", 600);

export const useApplicationsPerMonth = () =>
    useFetchData("/api/v1/analytics/applications-per-month", 800);

export const useApplicationStatusSummary = () =>
    useFetchData("/api/v1/analytics/application-status-summary", 1000);

export const useResumeUploadStats = () =>
    useFetchData("/api/v1/analytics/resume-upload-statistics", 1200);

export const useStudentsByLocation = () =>
    useFetchData("/api/v1/analytics/student-by-location", 1400);

export const useStudentApprovalStats = () =>
    useFetchData("/api/v1/analytics/student-approval-statistics", 1600);

export const useTopActiveStudents = () =>
    useFetchData("/api/v1/analytics/top-active-students", 1800);

export const useTotalStudents = () =>
    useFetchData("/api/v1/analytics/total-users", 0);

export const useTotalPlacements = () =>
    useFetchData("/api/v1/analytics/total-placements", 100);

export const useTotalApplications = () =>
    useFetchData("/api/v1/analytics/total-applications", 150);