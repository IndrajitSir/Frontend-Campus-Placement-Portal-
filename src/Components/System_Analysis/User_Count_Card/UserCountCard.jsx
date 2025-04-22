import React from 'react'
// Chart
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../components/ui/card";
// Hooks
import { useUserCountByRole } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../components/Loader/CircleLoader.jsx';
function UserCountCard() {
    const { data, loading, error } = useUserCountByRole();

    if (loading) return <CircleLoader />;
    if (error) return <p>Error fetching User Count By Role analysis data!</p>;
    return (
        <>
            {/* 1. User Count by Role -- working fine */}
            <Card className="w-full max-w-xl mx-auto shadow-md">
                <CardContent>
                    <h2 className="text-xl font-semibold mb-2">Users by Role</h2>
                    <BarChart width={480} height={250} data={data}>
                        <XAxis dataKey="_id" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </CardContent>
            </Card>
        </>
    )
}

export default UserCountCard