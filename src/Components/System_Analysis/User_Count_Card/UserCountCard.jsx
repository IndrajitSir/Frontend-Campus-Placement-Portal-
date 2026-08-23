import React from 'react'
import { motion } from 'framer-motion';
// Chart
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../Components/ui/card";
// Hooks
import { useUserCountByRole } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../Components/Loader/CircleLoader.jsx';
function UserCountCard() {
    const { data, loading, error } = useUserCountByRole();

    if (loading) return <CircleLoader />;
    if (error) return <p className="text-sm text-red-500">Error fetching User Count By Role analysis data!</p>;
    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full shadow-md">
                <CardContent>
                    <h2 className="text-xl font-semibold mb-2">Users by Role</h2>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default UserCountCard
