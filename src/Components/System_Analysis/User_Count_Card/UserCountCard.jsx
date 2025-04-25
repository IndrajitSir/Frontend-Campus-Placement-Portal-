import React from 'react'
import { motion } from 'framer-motion';
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
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="w-full max-w-xl mx-auto shadow-md">
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">Users by Role</h2>
                        <BarChart width={480} height={290} data={data}>
                            <XAxis dataKey="_id" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                        </BarChart>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    )
}

export default UserCountCard