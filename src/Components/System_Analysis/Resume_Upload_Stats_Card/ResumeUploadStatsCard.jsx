import React from 'react'
import { motion } from 'framer-motion';
// Chart
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../components/ui/card";
// Hooks
import { useResumeUploadStats } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../components/Loader/CircleLoader.jsx';
function ResumeUploadStatsCard() {
    const { data, loading, error } = useResumeUploadStats();

    if (loading) return <CircleLoader />;
    if (error) return <p>Error fetching analytics data!</p>;
    if (!Array.isArray(data)) return <p>No data available.</p>;
    return (
        <>
            {/* 6. Resume Upload Stats */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="w-full max-w-xl mx-auto shadow-md">
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">Resume Upload Stats</h2>
                        <BarChart width={450} height={250} data={data}>
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => [`${value} Students`, "Count"]}
                                labelFormatter={(label) => `Status: ${label}`}
                            />
                            <Bar dataKey="count" fill="#d0ed57" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                        </BarChart>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    )
}

export default ResumeUploadStatsCard