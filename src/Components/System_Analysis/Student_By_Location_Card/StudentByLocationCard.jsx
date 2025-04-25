import React from 'react'
import { motion } from 'framer-motion';
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
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="w-full shadow-md">
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">Students by Location</h2>
                        <BarChart width={1300} height={250} data={data}>
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                        </BarChart>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    )
}

export default StudentByLocationCard