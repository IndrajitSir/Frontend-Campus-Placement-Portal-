import { useEffect, useState } from "react";
import axios from "axios";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

const useFetchData = (endpoint, delayMs = 0, params = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { accessToken } = useUserData();

    const paramsKey = JSON.stringify(params);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                if (delayMs > 0) {
                    await new Promise((res) => setTimeout(res, delayMs));
                }

                const queryParams = new URLSearchParams();
                if (params?.year && params.year !== "all") queryParams.append("year", params.year);
                if (params?.month && params.month !== "all") queryParams.append("month", params.month);

                const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

                const response = await axios.get(`${API_URL}${endpoint}${queryString}`, {
                    withCredentials: 'include',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    }
                });
                if (response?.data?.data) {
                    setData(response?.data?.data);
                } else {
                    setData(response?.data);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [endpoint, accessToken, delayMs, paramsKey]);

    return { data, loading, error };
};

export const useUserCountByRole = (params) =>
    useFetchData("/api/v1/analytics/user-count-by-role", 100, params);

export const useStudentsPerDepartment = (params) =>
    useFetchData("/api/v1/analytics/students-per-department", 150, params);

export const useSelectedStudentsPerDepartment = (params) =>
    useFetchData("/api/v1/analytics/selected-student-per-department", 200, params);

export const usePlacementsCreatedPerMonth = (params) =>
    useFetchData("/api/v1/analytics/placement-created-per-month", 250, params);

export const useApplicationsPerMonth = (params) =>
    useFetchData("/api/v1/analytics/applications-per-month", 300, params);

export const useApplicationStatusSummary = (params) =>
    useFetchData("/api/v1/analytics/application-status-summary", 350, params);

export const useResumeUploadStats = (params) =>
    useFetchData("/api/v1/analytics/resume-upload-statistics", 400, params);

export const useStudentsByLocation = (params) =>
    useFetchData("/api/v1/analytics/student-by-location", 450, params);

export const useStudentApprovalStats = (params) =>
    useFetchData("/api/v1/analytics/student-approval-statistics", 500, params);

export const useTopActiveStudents = (params) =>
    useFetchData("/api/v1/analytics/top-active-students", 550, params);

export const useTotalStudents = (params) =>
    useFetchData("/api/v1/analytics/total-users", 0, params);

export const useTotalPlacements = (params) =>
    useFetchData("/api/v1/analytics/total-placements", 50, params);

export const useTotalApplications = (params) =>
    useFetchData("/api/v1/analytics/total-applications", 75, params);