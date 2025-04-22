import React from 'react'
// Chart
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../components/ui/card";
// Hooks
import { useTopActiveStudents } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../components/Loader/CircleLoader.jsx';
function ActiveStudentsCard() {
    const { data, loading, error } = useTopActiveStudents();
    if (loading) return <CircleLoader />;
    if (error) return <p>Error fetching Top Active Students analysis data!</p>;
    if (!Array.isArray(data)) return <p>No data available.</p>;
    return (
        <>
            {/* 9. Top Active Students */}
            <Card className="w-full shadow-md">
                <CardContent>
                    <h2 className="text-xl font-semibold mb-2">Top 10 Active Students</h2>
                    <BarChart width={1300} height={250} data={data}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="applications" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </CardContent>
            </Card>
        </>
    )
}

export default ActiveStudentsCard