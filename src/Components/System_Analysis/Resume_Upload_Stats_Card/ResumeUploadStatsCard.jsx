import React, { useState } from 'react'
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../../../Components/ui/card";
import { useResumeUploadStats } from '../../../hooks/Analytics/useAnalytics.js';
import CircleLoader from '../../../Components/Loader/CircleLoader.jsx';
import CardFilterHeader from '../CardFilterHeader.jsx';

function ResumeUploadStatsCard() {
    const [year, setYear] = useState('all');
    const [month, setMonth] = useState('all');
    const { data, loading, error } = useResumeUploadStats({ year, month });

    if (loading) return <CircleLoader />;
    if (error) return <p className="text-sm text-red-500">Error fetching analytics data!</p>;
    if (!Array.isArray(data)) return <p className="text-sm text-slate-400">No data available.</p>;
    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full shadow-md">
                <CardContent>
                    <CardFilterHeader title="Resume Upload Stats" year={year} setYear={setYear} month={month} setMonth={setMonth} />
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value) => [`${value} Students`, "Count"]}
                                    labelFormatter={(label) => `Status: ${label}`}
                                />
                                <Bar dataKey="count" fill="#d0ed57" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default ResumeUploadStatsCard
