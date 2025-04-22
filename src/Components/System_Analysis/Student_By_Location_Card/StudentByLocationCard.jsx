import React from 'react'
// Chart
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../components/ui/card";
// Hooks
import { useStudentsByLocation } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../components/Loader/CircleLoader.jsx';
function StudentByLocationCard() {
    const { data, loading, error } = useStudentsByLocation();

    if (loading) return <CircleLoader />;
    if (error) return <p>Error fetching Students By Location analysis data!</p>;
    if (!Array.isArray(data)) return <p>No data available.</p>;
    return (
        <>
            {/* 8. Students by Location -- working fine */}
            <Card className="w-full shadow-md">
                <CardContent>
                    <h2 className="text-xl font-semibold mb-2">Students by Location</h2>
                    <BarChart width={1300} height={250} data={data}>
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                </CardContent>
            </Card>
        </>
    )
}

export default StudentByLocationCard