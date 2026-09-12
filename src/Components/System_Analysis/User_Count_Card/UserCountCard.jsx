import React, { useState } from 'react'
import { motion } from 'framer-motion';
// Chart
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// Shadcn Components
import { Card, CardContent } from "../../../Components/ui/card";
// Hooks
import { useUserCountByRole } from '../../../hooks/Analytics/useAnalytics.js';
// Components
import CircleLoader from '../../../Components/Loader/CircleLoader.jsx';
import CardFilterHeader from '../CardFilterHeader.jsx';

function UserCountCard() {
    const [year, setYear] = useState('all');
    const [month, setMonth] = useState('all');
    const { data, loading, error } = useUserCountByRole({ year, month });

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full shadow-md">
                <CardContent>
                    <CardFilterHeader title="Users by Role" year={year} setYear={setYear} month={month} setMonth={setMonth} />
                    <div className="h-[280px]">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <CircleLoader />
                            </div>
                        ) : error ? (
                            <div className="flex h-full items-center justify-center text-center px-4">
                                <p className="text-sm text-red-500">Error fetching User Count By Role analysis data!</p>
                            </div>
                        ) : !Array.isArray(data) || data.length === 0 ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-slate-400">No data available.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
                            </BarChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default UserCountCard
