import React, { useState } from 'react'
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../../../Components/ui/card";
import { useStudentsByLocation } from '../../../hooks/Analytics/useAnalytics.js';
import CircleLoader from '../../../Components/Loader/CircleLoader.jsx';
import CardFilterHeader from '../CardFilterHeader.jsx';

function StudentByLocationCard() {
    const [year, setYear] = useState('all');
    const [month, setMonth] = useState('all');
    const { data, loading, error } = useStudentsByLocation({ year, month });

    if (loading) return <CircleLoader />;
    if (error) return <p className="text-sm text-red-500">Error fetching Students By Location analysis data!</p>;
    if (!Array.isArray(data)) return <p className="text-sm text-slate-400">No data available.</p>;
    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full shadow-md">
                <CardContent>
                    <CardFilterHeader title="Students by Location" year={year} setYear={setYear} month={month} setMonth={setMonth} />
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

export default StudentByLocationCard
