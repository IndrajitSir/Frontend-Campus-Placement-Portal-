import React from 'react'
// Chart
import { Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../components/ui/card";
// Hooks
import { useStudentApprovalStats } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../components/Loader/CircleLoader.jsx';
// Constants
import { COLORS } from '../../../constants/constants.js';
function StudentApprovalStats() {
    const { data, loading, error } = useStudentApprovalStats();

    if (loading) return <CircleLoader />;
    if (error) return <p>Error fetching Student Approval Stats data!</p>;
    if (!Array.isArray(data)) return <p>No data available.</p>;
    return (
        <>
            {/* 7. Student Approval Stats -- working fine */}
            <Card className="w-full max-w-xl mx-auto shadow-md">
                <CardContent>
                    <h2 className="text-xl font-semibold mb-2">Approval Stats</h2>
                    <PieChart width={450} height={250}>
                        <Pie data={data} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} fill="#ff7300" label>
                            {Array.isArray(data) && data?.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </CardContent>
            </Card>
        </>
    )
}

export default StudentApprovalStats